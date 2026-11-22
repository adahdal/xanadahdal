#!/usr/bin/env python3
"""Install a skill from .agents/skills/ to a target agent environment."""

import argparse
import hashlib
import json
import shutil
import sys
from pathlib import Path

SKILLS_DIR = Path(".agents/skills")
LOCK_FILE = Path("skills-lock.json")

# Static targets (no --project-dir needed)
STATIC_TARGETS = {
    "claude-code": Path.home() / ".claude" / "skills",
    "project": Path(".claude") / "skills",
    "agents": SKILLS_DIR,
    "codex": Path.home() / ".codex" / "skills",
}

# Project-scoped targets (require --project-dir)
PROJECT_TARGETS = {
    "codex-project": ".codex/skills",
    "claude-project": ".claude/skills",
}

ALL_TARGETS = list(STATIC_TARGETS) + list(PROJECT_TARGETS)


def hash_skill(skill_path: Path) -> str:
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        return ""
    return hashlib.sha256(skill_md.read_bytes()).hexdigest()


def load_lock() -> dict:
    if LOCK_FILE.exists():
        return json.loads(LOCK_FILE.read_text())
    return {"version": "1", "skills": {}}


def save_lock(data: dict) -> None:
    LOCK_FILE.write_text(json.dumps(data, indent=2) + "\n")


def resolve_target_root(target_key: str, project_dir: str | None) -> Path:
    if target_key in STATIC_TARGETS:
        return STATIC_TARGETS[target_key]

    if target_key in PROJECT_TARGETS:
        if not project_dir:
            print(f"Error: --target {target_key} requires --project-dir <path>")
            sys.exit(1)
        base = Path(project_dir).expanduser().resolve()
        if not base.exists():
            print(f"Error: project-dir does not exist: {base}")
            sys.exit(1)
        return base / PROJECT_TARGETS[target_key]

    print(f"Unknown target '{target_key}'. Available: {', '.join(ALL_TARGETS)}")
    sys.exit(1)


def install_skill(skill_name: str, target_key: str, project_dir: str | None = None) -> None:
    skill_src = SKILLS_DIR / skill_name
    if not skill_src.exists():
        print(f"Error: skill '{skill_name}' not found in {SKILLS_DIR}/")
        sys.exit(1)

    skill_md = skill_src / "SKILL.md"
    if not skill_md.exists():
        print(f"Error: {skill_src}/SKILL.md missing")
        sys.exit(1)

    target_root = resolve_target_root(target_key, project_dir)
    target_dir = target_root / skill_name
    target_dir.mkdir(parents=True, exist_ok=True)

    for item in skill_src.rglob("*"):
        rel = item.relative_to(skill_src)
        dest = target_dir / rel
        if item.is_dir():
            dest.mkdir(parents=True, exist_ok=True)
        else:
            shutil.copy2(item, dest)

    lock = load_lock()
    lock["skills"][skill_name] = {
        "source": "local",
        "sourceType": "local",
        "skillPath": str(skill_md),
        "target": target_key,
        **({"projectDir": str(project_dir)} if project_dir else {}),
        "computedHash": hash_skill(skill_src),
    }
    save_lock(lock)

    print(f"✓  Installed '{skill_name}' → {target_dir}")
    print(f"   SKILL.md: {target_dir / 'SKILL.md'}")


def main():
    parser = argparse.ArgumentParser(description="Install a skill to an agent target")
    parser.add_argument("--skill", required=True, help="Skill name (directory under .agents/skills/)")
    parser.add_argument("--target", required=True, choices=ALL_TARGETS, help="Target environment")
    parser.add_argument("--project-dir", help="Project root for project-scoped targets (codex-project, claude-project)")
    args = parser.parse_args()
    install_skill(args.skill, args.target, args.project_dir)


if __name__ == "__main__":
    main()
