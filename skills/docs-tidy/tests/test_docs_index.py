"""Run with: uv run --with pyyaml python -m unittest discover -s <this directory> -v."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts' / 'docs_index.py'


class IndexTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.assertTrue(SCRIPT.is_file(), 'Bundled INDEX tool must exist')
        spec = importlib.util.spec_from_file_location('docs_index', SCRIPT)
        assert spec is not None and spec.loader is not None
        self.tool = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.tool)
        self.write_doc()

    def write_doc(self, path='docs/guide/getting-started.md', **overrides):
        import yaml
        fields = dict(id='guide-getting-started', title='시작하기·로컬 실행', category='guide',
                      summary='프로젝트 설치 명령과 개발 서버 실행 절차를 설명한다',
                      keywords=['시작하기', 'getting started'], related_files=[], last_updated='2026-10-20')
        fields.update(overrides)
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text('---\n' + yaml.safe_dump(fields, allow_unicode=True, sort_keys=False) +
                          '---\n\n# 시작하기\n\n실제 설치 절차를 기록한 테스트용 문서.\n', encoding='utf-8')
        return target

    def test_build_then_check_canonical_index(self):
        rows = self.tool.build(self.root)
        self.assertEqual(len(rows), 1)
        self.assertEqual(set(rows[0]), {'path', 'title', 'summary', 'keywords'})
        self.assertEqual(self.tool.check(self.root), rows)
        self.assertIn('docs:', (self.root / 'INDEX.md').read_text(encoding='utf-8'))

    def test_rejects_invalid_metadata(self):
        cases = [
            {'id': 'Guide Wrong'}, {'id': 'spec-start'}, {'title': ''},
            {'category': 'ops'}, {'summary': '첫 줄\n둘째 줄'},
            {'keywords': []}, {'keywords': '시작하기'}, {'related_files': None},
            {'last_updated': '2026-02-30'}, {'last_updated': '2026-2-01'},
        ]
        for overrides in cases:
            with self.subTest(overrides=overrides):
                self.write_doc(**overrides)
                with self.assertRaises(ValueError):
                    self.tool.build(self.root)

    def test_rejects_missing_fields_without_overwriting_index(self):
        original = self.tool.build(self.root)
        old_index = (self.root / 'INDEX.md').read_bytes()
        path = self.write_doc()
        path.write_text(path.read_text(encoding='utf-8').replace('related_files: []\n', ''), encoding='utf-8')
        with self.assertRaises(ValueError):
            self.tool.build(self.root)
        self.assertEqual((self.root / 'INDEX.md').read_bytes(), old_index)
        self.assertEqual(len(original), 1)

    def test_rejects_duplicate_ids(self):
        self.write_doc('docs/guide/another.md')
        with self.assertRaises(ValueError):
            self.tool.build(self.root)

    def test_rejects_missing_related_files(self):
        self.write_doc(related_files=['src/missing.py'])
        with self.assertRaises(ValueError):
            self.tool.build(self.root)

    def test_rejects_unsafe_related_paths(self):
        for path in ['../outside', '/etc/passwd', 'C:\\outside.txt']:
            with self.subTest(path=path):
                self.write_doc(related_files=[path])
                with self.assertRaises(ValueError):
                    self.tool.build(self.root)

    def test_preserves_extra_existing_metadata_and_source_bytes(self):
        path = self.write_doc(owner='기존 문서 담당자', last_updated=__import__('datetime').date(2026, 10, 20))
        old = path.read_bytes()
        self.tool.build(self.root)
        self.assertEqual(self.tool.check(self.root)[0]['path'], 'docs/guide/getting-started.md')
        self.assertEqual(path.read_bytes(), old)

    def test_rejects_empty_docs(self):
        (self.root / 'docs/guide/getting-started.md').unlink()
        with self.assertRaises(ValueError):
            self.tool.build(self.root)

    def test_rejects_uncategorized_document(self):
        self.write_doc('docs/legacy.md')
        with self.assertRaises(ValueError):
            self.tool.build(self.root)

    def test_rejects_duplicate_yaml_keys(self):
        path = self.write_doc()
        path.write_text(path.read_text(encoding='utf-8').replace('id: guide-getting-started',
                        'id: guide-old\nid: guide-getting-started'), encoding='utf-8')
        with self.assertRaises(ValueError):
            self.tool.build(self.root)

    def test_rejects_handwritten_index_without_overwrite(self):
        index = self.root / 'INDEX.md'
        index.write_text('# 기존 색인\n\n지우면 안 되는 안내\n', encoding='utf-8')
        old = index.read_bytes()
        with self.assertRaises(ValueError):
            self.tool.build(self.root)
        self.assertEqual(index.read_bytes(), old)

    def test_check_detects_missing_extra_duplicate_and_stale_entries(self):
        import yaml
        expected = self.tool.build(self.root)
        variants = [[], expected + expected, [dict(expected[0], title='오래된 제목')],
                    expected + [dict(expected[0], path='docs/spec/missing.md')],
                    [dict(expected[0], body='색인에 넣으면 안 되는 본문')]]
        index = self.root / 'INDEX.md'
        for entries in variants:
            with self.subTest(entries=entries):
                index.write_text(self.tool.HEADER + '```yaml\n' + yaml.safe_dump({'docs': entries}, allow_unicode=True) + '```\n', encoding='utf-8')
                with self.assertRaises(ValueError):
                    self.tool.check(self.root)

    def test_check_rejects_duplicate_index_yaml_keys(self):
        self.tool.build(self.root)
        index = self.root / 'INDEX.md'
        text = index.read_text(encoding='utf-8')
        index.write_text(text.replace('docs:\n', 'docs: []\ndocs:\n', 1), encoding='utf-8')
        with self.assertRaises(ValueError):
            self.tool.check(self.root)

    def test_check_rejects_body_in_index(self):
        self.tool.build(self.root)
        index = self.root / 'INDEX.md'
        index.write_text(index.read_text(encoding='utf-8') + '\n추가 본문\n', encoding='utf-8')
        with self.assertRaises(ValueError):
            self.tool.check(self.root)

    def test_rejects_symlink_output(self):
        outside = self.root / 'untouched.md'
        outside.write_text('보존', encoding='utf-8')
        try:
            (self.root / 'INDEX.md').symlink_to(outside)
        except OSError:
            self.skipTest('Symbolic links unavailable on this host')
        with self.assertRaises(ValueError):
            self.tool.build(self.root)
        self.assertEqual(outside.read_text(encoding='utf-8'), '보존')

    def test_rejects_markdown_symlink(self):
        try:
            (self.root / 'docs/guide/linked.md').symlink_to(self.root / 'docs/guide/getting-started.md')
        except OSError:
            self.skipTest('Symbolic links unavailable on this host')
        with self.assertRaises(ValueError):
            self.tool.build(self.root)

    def test_build_is_deterministic_and_check_is_read_only(self):
        self.tool.build(self.root)
        old = (self.root / 'INDEX.md').read_bytes()
        self.tool.build(self.root)
        self.tool.check(self.root)
        self.assertEqual((self.root / 'INDEX.md').read_bytes(), old)

    def test_build_preserves_custom_yaml_content(self):
        self.tool.build(self.root)
        index = self.root / 'INDEX.md'
        generated = index.read_text(encoding='utf-8')
        variants = [generated.replace('docs:\n', 'notes: 보존할 안내\ndocs:\n', 1),
                    generated.replace('docs:\n', '# 보존할 분류 설명\ndocs:\n', 1),
                    generated.replace('- path:', '- notes: 보존할 문서 설명\n  path:', 1)]
        for text in variants:
            with self.subTest(text=text):
                index.write_text(text, encoding='utf-8')
                with self.assertRaises(ValueError):
                    self.tool.build(self.root)
                self.assertEqual(index.read_text(encoding='utf-8'), text)

    def test_allows_hash_inside_yaml_scalar(self):
        self.write_doc(summary='Canvas #1 캡처 동작을 설명한다')
        self.tool.build(self.root)
        self.assertEqual(self.tool.check(self.root)[0]['summary'], 'Canvas #1 캡처 동작을 설명한다')


if __name__ == '__main__':
    unittest.main()
