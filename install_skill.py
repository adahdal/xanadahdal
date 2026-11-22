#!/usr/bin/env python3
"""Install a skill from .agents/skills/ to a target agent environment."""

import argparse
import hashlib
import json
import os
import shutil
import sys
from pathlib import Path

SKILLS_DIR = Path(".agents/skills")
LOCK_FILE = Path("skills-lock.json")

TARGETS = {
    "claude-code": Path.home() / ".claude" / "skills",
    "project": Path(".claude") / "skills",
    "agents": SKILLS_DIR,
}


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


def install_skill(skill_name: str, target_key: str) -> None:
    skill_src = SKILLS_DIR / skill_name
    if not skill_src.exists():
        print(f"Error: skill '{skill_name}' not found in {SKILLS_DIR}/")
        sys.exit(1)

    skill_md = skill_src / "SKILL.md"
    if not skill_md.exists():
        print(f"Error: {skill_src}/SKILL.md missing")
        sys.exit(1)

    target_root = TARGETS.get(target_key)
    if target_root is None:
        print(f"Unknown target '{target_key}'. Available: {', '.join(TARGETS)}")
        sys.exit(1)

    target_dir = target_root / skill_name
    target_dir.mkdir(parents=True, exist_ok=True)

    # Copy skill files
    for item in skill_src.rglob("*"):
        rel = item.relative_to(skill_src)
        dest = target_dir / rel
        if item.is_dir():
            dest.mkdir(parents=True, exist_ok=True)
        else:
            shutil.copy2(item, dest)

    # Update lock file
    lock = load_lock()
    lock["skills"][skill_name] = {
        "source": "local",
        "sourceType": "local",
        "skillPath": str(skill_md),
        "target": target_key,
        "computedHash": hash_skill(skill_src),
    }
    save_lock(lock)

    print(f"✓  Installed '{skill_name}' → {target_dir}")
    print(f"   SKILL.md: {target_dir / 'SKILL.md'}")


def main():
    parser = argparse.ArgumentParser(description="Install a skill to an agent target")
    parser.add_argument("--skill", required=True, help="Skill name (directory under .agents/skills/)")
    parser.add_argument("--target", required=True, choices=list(TARGETS), help="Target environment")
    args = parser.parse_args()
    install_skill(args.skill, args.target)


if __name__ == "__main__":
    main()
