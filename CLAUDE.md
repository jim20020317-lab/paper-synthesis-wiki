# CLAUDE.md

This project uses `AGENTS.md` as the single source of truth for project purpose, architecture, content schemas, naming rules, and AI workflows.

**Before making any edits or adding new paper/synthesis entries, please read and strictly follow [`AGENTS.md`](./AGENTS.md).**

Quick reminders:
- All editable content lives in `entries/papers/*.md` and `entries/syntheses/*.md` (UTF-8, `kebab-case` filenames).
- Never edit `data/wiki.json` manually; always run `python scripts/build_wiki.py` after editing `entries/`.
- Maintain bidirectional `related` links between entries.
