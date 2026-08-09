#!/usr/bin/env python3
"""Install external SKILL.md files into .devin/skills/.

Usage:
    python3 .devin/skills/install_external_skills.py

It expects a sibling `skill-sources.json` that lists repos and filters.
To add a new source, add it to the JSON and re-run.
"""

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SKILL_ROOT = REPO_ROOT / ".devin" / "skills"
WORK_DIR = Path.home() / ".skill-audit"


def slugify(name: str) -> str:
    """Turn a skill name/path piece into a safe directory name."""
    return re.sub(r"[^a-z0-9_-]+", "-", name.lower()).strip("-")


def clone(repo_url: str) -> Path:
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    repo_name = Path(repo_url.rstrip("/")).name
    target = WORK_DIR / repo_name
    if not (target / ".git").exists():
        print(f"Cloning {repo_url}...")
        subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, str(target)],
            check=True,
            capture_output=True,
            text=True,
        )
    return target


def find_skills(source: Path, include: list[str], exclude: list[str]) -> list[Path]:
    """Return matching SKILL.md paths under source, applying include/exclude globs."""
    matches = []
    for skill_file in source.rglob("SKILL.md"):
        rel = skill_file.relative_to(source).as_posix()
        if any(part.startswith(".") for part in skill_file.relative_to(source).parts):
            continue
        if any(re.search(p, rel) for p in exclude):
            continue
        if include and not any(re.search(p, rel) for p in include):
            continue
        matches.append(skill_file)
    return matches


def skill_name(skill_file: Path, source: Path, repo_name: str) -> str:
    """Derive a unique install directory name for a SKILL.md."""
    rel_parts = skill_file.relative_to(source).parts[:-1]  # drop SKILL.md
    filtered = [p for p in rel_parts if p not in ("skills", ".agents", "skill-sources")]
    if filtered:
        name = "-".join([repo_name] + filtered)
    else:
        name = repo_name
    return slugify(name)


def install(skill_file: Path, source: Path, repo_name: str) -> Path:
    name = skill_name(skill_file, source, repo_name)
    dest_dir = SKILL_ROOT / name
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_file = dest_dir / "SKILL.md"
    print(f"Installing {skill_file.relative_to(source)} -> {dest_file.relative_to(REPO_ROOT)}")
    shutil.copy2(skill_file, dest_file)
    return dest_file


def main():
    config_file = REPO_ROOT / ".devin" / "skill-sources.json"
    if not config_file.exists():
        print(f"Create {config_file} first. Example:")
        print(json.dumps({
            "sources": [
                {
                    "repo": "https://github.com/DietrichGebert/ponytail",
                    "include": [r"^ponytail/skills/"],
                    "exclude": [r"\.openclaw"],
                }
            ]
        }, indent=2))
        sys.exit(1)

    config = json.loads(config_file.read_text())
    installed = []
    for entry in config.get("sources", []):
        repo_url = entry["repo"]
        include = entry.get("include", [])
        exclude = entry.get("exclude", [r"test/fixtures", r"/tests?/", r"\.openclaw"])
        source = clone(repo_url)
        for skill_file in find_skills(source, include, exclude):
            installed.append(str(install(skill_file, source, Path(repo_url).name)))

    print(f"\nInstalled {len(installed)} skills to {SKILL_ROOT.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
