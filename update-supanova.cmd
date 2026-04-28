@echo off
REM Pull latest supanova-design-skill from upstream.
REM Junctions in %USERPROFILE%\.claude\skills\ auto-reflect updates.
git -C "%~dp0external\supanova-design-skill" pull --ff-only
