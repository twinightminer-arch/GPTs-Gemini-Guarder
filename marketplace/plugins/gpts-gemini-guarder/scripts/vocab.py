#!/usr/bin/env python3
"""Plain JSON vocabulary store. Python standard library only."""
import argparse
import csv
import json
import os
import sys
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path


def directory(value):
    return Path(value).expanduser().resolve() if value else (Path.home() / "Documents" / "GPT Salad Vocabulary").resolve()


def now():
    return datetime.now(timezone.utc).isoformat()


def path_for(root, entry_id):
    return root / "entries" / (str(uuid.UUID(entry_id)) + ".json")


def read(root, entry_id):
    return json.loads(path_for(root, entry_id).read_text(encoding="utf-8"))


def write_atomic(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=".pending-", suffix=".json")
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as out:
            json.dump(value, out, ensure_ascii=False, indent=2)
            out.write("\n")
            out.flush()
            os.fsync(out.fileno())
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def entries(root):
    for path in sorted((root / "entries").glob("*.json")):
        yield json.loads(path.read_text(encoding="utf-8"))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dir", help="Vocabulary directory")
    sub = p.add_subparsers(dest="command", required=True)
    add = sub.add_parser("add"); add.add_argument("--input", help="UTF-8 JSON file; otherwise stdin")
    get = sub.add_parser("get"); get.add_argument("id")
    listing = sub.add_parser("list"); listing.add_argument("--query", default="")
    update = sub.add_parser("update"); update.add_argument("id"); update.add_argument("--revision", type=int, required=True); update.add_argument("--input", help="UTF-8 JSON patch file; otherwise stdin")
    fav = sub.add_parser("favorite"); fav.add_argument("id"); fav.add_argument("--meaning-id"); fav.add_argument("--off", action="store_true"); fav.add_argument("--revision", type=int, required=True)
    archive = sub.add_parser("archive"); archive.add_argument("id"); archive.add_argument("--revision", type=int, required=True)
    export = sub.add_parser("export"); export.add_argument("--format", choices=["json", "csv"], required=True); export.add_argument("--output", required=True)
    a = p.parse_args()
    root = directory(a.dir)
    if a.command == "add":
        item = json.loads(Path(a.input).read_text(encoding="utf-8-sig")) if a.input else json.load(sys.stdin)
        if item.get("entry_type") not in {"word", "phrase", "sentence", "question"} or not item.get("source_text"):
            raise ValueError("entry_type and source_text are required")
        item["id"] = str(uuid.UUID(item["id"])) if item.get("id") else str(uuid.uuid4())
        for meaning in item.get("meanings", []):
            meaning["id"] = str(uuid.UUID(meaning["id"])) if meaning.get("id") else str(uuid.uuid4())
            meaning.setdefault("favorite", False)
        target = path_for(root, item["id"])
        if target.exists():
            raise FileExistsError("Entry exists; use update with revision")
        item.update(revision=1, created_at=now(), updated_at=now())
        item.setdefault("favorite", False); item.setdefault("notes", ""); item.setdefault("tags", []); item.setdefault("archived", False)
        write_atomic(target, item)
        print(json.dumps({"id": item["id"], "path": str(target), "revision": 1}, ensure_ascii=False))
    elif a.command == "get":
        print(json.dumps(read(root, a.id), ensure_ascii=False, indent=2))
    elif a.command == "list":
        q = a.query.casefold()
        print(json.dumps([{"id": x["id"], "source_text": x["source_text"], "entry_type": x["entry_type"], "favorite": x.get("favorite"), "archived": x.get("archived"), "revision": x["revision"]} for x in entries(root) if q in x["source_text"].casefold()], ensure_ascii=False, indent=2))
    elif a.command in {"update", "favorite", "archive"}:
        target = path_for(root, a.id); old = read(root, a.id)
        if old["revision"] != a.revision:
            raise ValueError(f"Revision conflict: current={old['revision']}")
        item = dict(old)
        if a.command == "update":
            patch = json.loads(Path(a.input).read_text(encoding="utf-8-sig")) if a.input else json.load(sys.stdin)
            forbidden = {"id", "revision", "created_at", "updated_at"}
            if forbidden.intersection(patch):
                raise ValueError("Immutable fields in patch")
            item.update(patch)
        elif a.command == "favorite":
            if a.meaning_id:
                match = next((m for m in item.get("meanings", []) if m["id"] == a.meaning_id), None)
                if match is None: raise ValueError("Meaning not found")
                match["favorite"] = not a.off
            else:
                item["favorite"] = not a.off
        else:
            item["archived"] = True
        item["revision"] += 1; item["updated_at"] = now()
        write_atomic(target, item)
        print(json.dumps({"id": item["id"], "path": str(target), "revision": item["revision"]}, ensure_ascii=False))
    elif a.command == "export":
        out = Path(a.output).expanduser().resolve(); out.parent.mkdir(parents=True, exist_ok=True)
        rows = list(entries(root))
        if a.format == "json":
            write_atomic(out, rows)
        else:
            with out.open("w", encoding="utf-8-sig", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=["id", "entry_type", "source_text", "source_language", "target_language", "favorite", "archived", "notes", "tags", "meanings"])
                writer.writeheader()
                for x in rows:
                    writer.writerow({k: json.dumps(x.get(k), ensure_ascii=False) if k in {"tags", "meanings"} else x.get(k, "") for k in writer.fieldnames})
        print(json.dumps({"count": len(rows), "path": str(out)}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as error:
        print(f"error: {error}", file=sys.stderr)
        sys.exit(1)
