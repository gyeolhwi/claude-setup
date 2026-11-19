# /// script
# requires-python = ">=3.10"
# dependencies = ["PyYAML>=6,<7"]
# ///
"""Build or check a minimal routing INDEX. Never edits source documents."""
import argparse
from pathlib import Path, PureWindowsPath
from datetime import date
import re
import sys

import yaml

FIELDS = ('id', 'title', 'category', 'summary', 'keywords', 'related_files', 'last_updated')
ROUTING = ('title', 'summary', 'keywords')
HEADER = '# INDEX\n\n> AI는 질문을 받으면 이 파일부터 읽고, 아래에서 맞는 문서만 연다.\n\n'


class UniqueLoader(yaml.SafeLoader):
    """Reject duplicate YAML keys rather than silently dropping a value."""


def unique_mapping(loader, node):
    result = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node)
        if not isinstance(key, str) or key in result:
            raise ValueError(f'duplicate or non-string YAML key: {key!r}')
        result[key] = loader.construct_object(value_node)
    return result


UniqueLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, unique_mapping)


def load_yaml(text):
    return yaml.load(text, Loader=UniqueLoader)


def validate_meta(root, path, meta, body):
    rel = path.relative_to(root)
    if len(rel.parts) < 3:
        raise ValueError(f'{rel}: document must be inside docs/<category>/')
    if not isinstance(meta, dict) or not set(FIELDS).issubset(meta):
        raise ValueError(f'{rel}: all seven frontmatter fields are required')
    for key in ('id', 'title', 'category', 'summary'):
        value = meta[key]
        if not isinstance(value, str) or not value.strip() or '\n' in value or '\r' in value:
            raise ValueError(f'{rel}: {key} must be a nonempty single-line string')
    category = rel.parts[1]
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', category):
        raise ValueError(f'{rel}: category folder must be lowercase kebab-case')
    if meta['category'] != category or not meta['id'].startswith(category + '-'):
        raise ValueError(f'{rel}: category/id prefix mismatch')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)+', meta['id']):
        raise ValueError(f'{rel}: id must be lowercase kebab-case')
    if not re.search(r'[가-힣]', meta['title']):
        raise ValueError(f'{rel}: title must contain Korean search words')
    for key in ('keywords', 'related_files'):
        value = meta[key]
        if not isinstance(value, list) or any(not isinstance(v, str) or not v.strip() for v in value):
            raise ValueError(f'{rel}: {key} must be an array of nonempty strings')
    if not meta['keywords']:
        raise ValueError(f'{rel}: keywords must not be empty')
    updated = str(meta['last_updated'])
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', updated):
        raise ValueError(f'{rel}: last_updated must be YYYY-MM-DD')
    date.fromisoformat(updated)
    for target in meta['related_files']:
        local = Path(target)
        resolved = (root / local).resolve()
        if (local.is_absolute() or PureWindowsPath(target).drive or '\\' in target or
                '..' in local.parts or not resolved.is_relative_to(root) or not resolved.exists()):
            raise ValueError(f'{rel}: missing/unsafe related_files path: {target}')
    if not body.strip():
        raise ValueError(f'{rel}: document body is empty')


def rows(root):
    root = root.resolve()
    docs = root / 'docs'
    if not docs.is_dir():
        raise ValueError('docs/ directory is missing')
    if docs.is_symlink() or any(p.is_symlink() for p in docs.rglob('*')):
        raise ValueError('docs/ must not contain symbolic links; use real in-repository files')
    result, identifiers = [], set()
    for path in sorted(docs.rglob('*.md')):
        text = path.read_text(encoding='utf-8')
        match = re.match(r'\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)', text, re.S)
        if not match:
            raise ValueError(f'{path.relative_to(root)}: missing frontmatter')
        meta = load_yaml(match[1])
        validate_meta(root, path, meta, text[match.end():])
        if meta['id'] in identifiers:
            raise ValueError(f'{path.relative_to(root)}: duplicate id: {meta["id"]}')
        identifiers.add(meta['id'])
        result.append({'path': path.relative_to(root).as_posix(), **{key: meta[key] for key in ROUTING}})
    if not result:
        raise ValueError('docs/ contains no Markdown documents')
    return result


def index_block(path):
    if path.is_symlink():
        raise ValueError('INDEX.md must not be a symbolic link')
    text = path.read_text(encoding='utf-8')
    block = re.fullmatch(re.escape(HEADER) + r'```yaml\n(.*?)\n```\n?', text, re.S)
    if not block:
        raise ValueError('INDEX has custom content or a different format; preserve it and agree on migration first')
    payload = block[1]
    parsed = load_yaml(payload)
    if (not isinstance(parsed, dict) or set(parsed) != {'docs'} or
            not isinstance(parsed['docs'], list) or any(
                not isinstance(row, dict) or set(row) != {'path', *ROUTING}
                for row in parsed['docs'])):
        raise ValueError('INDEX contains custom YAML fields; agree on preservation before regenerating')
    # Comments are user content, unlike whitespace and YAML formatting.
    # Mask scalar tokens so a literal # inside a title/summary is not rejected.
    outside_scalars = list(payload)
    for token in yaml.scan(payload):
        if isinstance(token, yaml.tokens.ScalarToken):
            start, end = token.start_mark.index, token.end_mark.index
            outside_scalars[start:end] = ' ' * (end - start)
    if '#' in outside_scalars:
        raise ValueError('INDEX contains YAML comments; agree on preservation before regenerating')
    return payload


def build(root):
    root = root.resolve()
    expected = rows(root)
    target = root / 'INDEX.md'
    if target.exists() or target.is_symlink():
        index_block(target)
    text = HEADER + '```yaml\n' + yaml.safe_dump({'docs': expected}, allow_unicode=True, sort_keys=False, width=120) + '```\n'
    target.write_text(text, encoding='utf-8')
    return expected


def check(root):
    root = root.resolve()
    expected = rows(root)
    if load_yaml(index_block(root / 'INDEX.md')) != {'docs': expected}:
        raise ValueError('INDEX paths/order/title/summary/keywords differ from frontmatter')
    return expected


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['build', 'check'])
    parser.add_argument('--root', type=Path, default=Path('.'))
    args = parser.parse_args()
    try:
        found = (build if args.action == 'build' else check)(args.root.resolve())
    except (ValueError, KeyError, OSError, yaml.YAMLError) as exc:
        print(f'FAIL: {exc}', file=sys.stderr)
        return 1
    print(f'OK: {args.action}; docs={len(found)}; index={len(found)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
