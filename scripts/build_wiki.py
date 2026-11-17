"""Compile and validate entries/ Markdown files into data/wiki.json."""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENTRIES_DIR = ROOT / "entries"
PAPERS_DIR = ENTRIES_DIR / "papers"
SYNTHESES_DIR = ENTRIES_DIR / "syntheses"
OUTPUT_FILE = ROOT / "data" / "wiki.json"

KEBAB_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

PAPER_REQUIRED = {
    "id",
    "title",
    "venue",
    "category",
    "tags",
    "bottleneck_summary",
    "solution_summary",
    "combinable_modules",
    "related",
    "last_updated",
}

SYNTHESIS_REQUIRED = {
    "id",
    "title",
    "category",
    "tags",
    "source_papers",
    "bottleneck_summary",
    "solution_summary",
    "related",
    "last_updated",
}


def _strip_quotes(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and (
        (value[0] == '"' and value[-1] == '"') or (value[0] == "'" and value[-1] == "'")
    ):
        return value[1:-1]
    return value


def _parse_inline_list(raw: str) -> list[str]:
    inner = raw.strip()[1:-1].strip()
    if not inner:
        return []
    items: list[str] = []
    current: list[str] = []
    in_quote: str | None = None
    for ch in inner:
        if ch in ('"', "'"):
            if in_quote is None:
                in_quote = ch
            elif in_quote == ch:
                in_quote = None
            current.append(ch)
        elif ch == "," and in_quote is None:
            items.append(_strip_quotes("".join(current)))
            current = []
        else:
            current.append(ch)
    if current:
        items.append(_strip_quotes("".join(current)))
    return [item for item in items if item]


def parse_frontmatter_and_body(text: str, path: Path) -> tuple[dict, str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError(f"{path}: Missing opening '---' YAML frontmatter.")

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        raise ValueError(f"{path}: Missing closing '---' YAML frontmatter.")

    meta: dict = {}
    for line in lines[1:end_idx]:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if ":" not in stripped:
            raise ValueError(f"{path}: Invalid frontmatter line: {line}")
        key, raw_val = stripped.split(":", 1)
        key = key.strip()
        val = raw_val.strip()
        if val.startswith("[") and val.endswith("]"):
            meta[key] = _parse_inline_list(val)
        else:
            meta[key] = _strip_quotes(val)

    body = "\n".join(lines[end_idx + 1 :]).strip()
    return meta, body


def split_sections(body: str) -> list[dict[str, str]]:
    sections: list[dict[str, str]] = []
    current_heading = ""
    current_lines: list[str] = []

    for line in body.splitlines():
        if line.startswith("## "):
            if current_heading or current_lines:
                sections.append(
                    {
                        "heading": current_heading,
                        "content": "\n".join(current_lines).strip(),
                    }
                )
            current_heading = line[3:].strip()
            current_lines = []
        else:
            current_lines.append(line)

    if current_heading or current_lines:
        sections.append(
            {
                "heading": current_heading,
                "content": "\n".join(current_lines).strip(),
            }
        )
    return [s for s in sections if s["heading"]]


def load_entries(folder: Path, kind: str, required_fields: set[str]) -> list[dict]:
    if not folder.exists():
        return []
    entries: list[dict] = []
    for path in sorted(folder.glob("*.md")):
        slug = path.stem
        if not KEBAB_RE.match(slug):
            raise ValueError(
                f"{path}: Filename '{slug}' must be kebab-case (lowercase a-z, 0-9, '-')."
            )
        text = path.read_text(encoding="utf-8")
        meta, body = parse_frontmatter_and_body(text, path)

        missing = required_fields - set(meta.keys())
        if missing:
            raise ValueError(f"{path}: Missing required frontmatter fields: {sorted(missing)}")

        if meta["id"] != slug:
            raise ValueError(
                f"{path}: Frontmatter id '{meta['id']}' must match filename '{slug}'."
            )

        sections = split_sections(body)
        if not sections:
            raise ValueError(f"{path}: Must contain at least one '## ' section.")

        entry = {
            **meta,
            "kind": kind,
            "source_file": path.relative_to(ROOT).as_posix(),
            "sections": sections,
        }
        entries.append(entry)
    return entries


def validate_graph(papers: list[dict], syntheses: list[dict]) -> list[str]:
    warnings: list[str] = []
    all_entries = papers + syntheses
    by_id: dict[str, dict] = {}
    for entry in all_entries:
        eid = entry["id"]
        if eid in by_id:
            raise ValueError(f"Duplicate entry id detected: '{eid}'")
        by_id[eid] = entry

    paper_ids = {p["id"] for p in papers}
    for syn in syntheses:
        for pid in syn.get("source_papers", []):
            if pid not in paper_ids:
                raise ValueError(
                    f"Synthesis '{syn['id']}' references unknown source_paper '{pid}'."
                )

    for entry in all_entries:
        eid = entry["id"]
        for target in entry.get("related", []):
            if target not in by_id:
                raise ValueError(f"Entry '{eid}' has broken related link '{target}'.")
            if target == eid:
                warnings.append(f"Entry '{eid}' links to itself in related.")
            elif eid not in by_id[target].get("related", []):
                warnings.append(
                    f"One-way link: '{eid}' -> '{target}' (missing reverse link in '{target}')."
                )
        if not entry.get("related"):
            warnings.append(f"Orphan entry: '{eid}' has empty related list.")

    return warnings


def main() -> int:
    papers = load_entries(PAPERS_DIR, "paper", PAPER_REQUIRED)
    syntheses = load_entries(SYNTHESES_DIR, "synthesis", SYNTHESIS_REQUIRED)
    warnings = validate_graph(papers, syntheses)

    tag_counts: dict[str, int] = {}
    for item in papers + syntheses:
        for tag in item.get("tags", []):
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

    payload = {
        "meta": {
            "title": "Paper Bottleneck × Solution Synthesis Wiki",
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "paper_count": len(papers),
            "synthesis_count": len(syntheses),
            "tags": sorted(tag_counts.keys()),
        },
        "papers": papers,
        "syntheses": syntheses,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print(
        f"[OK] Built {OUTPUT_FILE.relative_to(ROOT).as_posix()} "
        f"({len(papers)} papers, {len(syntheses)} syntheses, {len(tag_counts)} tags)."
    )
    for warn in warnings:
        print(f"[WARN] {warn}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        raise SystemExit(1)
