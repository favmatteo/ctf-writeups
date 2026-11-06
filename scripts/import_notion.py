#!/usr/bin/env python3
"""
scripts/import_notion.py
========================
Parser e importatore automatico dei writeup CTF esportati da Notion per MkDocs.

- Estrae eventuali file .zip in `./notion_export/`
- Esclude file contrassegnati come [INCOMPLETO]
- Rimuove gli hash esadecimali casuali generati da Notion nei nomi di file e titoli
- Sposta e riorganizza le immagini collegate in `docs/writeups/assets/<slug>/`
- Normalizza la sintassi dei blocchi di codice (da 'basic' o non tipizzati a 'bash')
- Rigenera l'indice pulito in `docs/writeups/index.md`
- Aggiorna il menu di navigazione in `mkdocs.yaml`
"""

import os
import re
import sys
import shutil
import zipfile
import urllib.parse
from pathlib import Path

NOTION_UUID_PATTERN = re.compile(r'[\s_]+[0-9a-fA-F]{32}$')

def clean_title_and_slug(filename: str):
    stem = Path(filename).stem
    cleaned_title = NOTION_UUID_PATTERN.sub('', stem).strip()
    slug = re.sub(r'[^\w\s-]', '', cleaned_title).strip().lower()
    slug = re.sub(r'[-\s]+', '-', slug)
    if not slug:
        slug = "writeup"
    return cleaned_title, slug

def extract_zips_if_any(source_dir: Path):
    zip_files = list(source_dir.glob("*.zip"))
    for zf in zip_files:
        print(f"[+] Estrazione archivio zip: {zf.name}...")
        with zipfile.ZipFile(zf, 'r') as zip_ref:
            zip_ref.extractall(source_dir)

def normalize_code_blocks(content: str) -> str:
    lines = content.split('\n')
    new_lines = []
    in_block = False
    current_lang = ""
    block_lines = []

    for line in lines:
        if line.startswith('```'):
            if not in_block:
                in_block = True
                current_lang = line[3:].strip()
                block_lines = []
            else:
                in_block = False
                first_few_lines = "\n".join(block_lines[:5]).lower()
                has_bash_indicators = any(x in first_few_lines for x in [
                    "kali@", "root@", "$ sudo", "$ nmap", "$ cat", "$ ffuf", "$ curl",
                    "# whoami", "starting nmap", "uid=", "gid=", "msf exploit("
                ])
                if current_lang in ["basic", "jsx", "", "plain text", "txt"]:
                    if has_bash_indicators:
                        current_lang = "bash"
                    elif current_lang == "plain text":
                        current_lang = "text"
                    elif current_lang == "basic":
                        current_lang = "bash"
                    elif not current_lang:
                        current_lang = "text"

                new_lines.append(f"```{current_lang}")
                new_lines.extend(block_lines)
                new_lines.append("```")
                current_lang = ""
                block_lines = []
        else:
            if in_block:
                block_lines.append(line)
            else:
                new_lines.append(line)

    if in_block:
        new_lines.append(f"```{current_lang}")
        new_lines.extend(block_lines)
        new_lines.append("```")

    return "\n".join(new_lines)

def process_images_and_links(
    content: str,
    source_file_dir: Path,
    slug: str,
    assets_dest_dir: Path,
    link_mapping: dict
) -> tuple[str, int]:
    target_asset_dir = assets_dest_dir / slug
    image_count = 0
    md_img_pat = re.compile(r'!\[(.*?)\]\((.*?)\)')

    def replace_image(match):
        nonlocal image_count
        alt = match.group(1)
        raw_path = match.group(2).strip()
        if raw_path.startswith(('http://', 'https://', '//', 'data:')):
            return match.group(0)

        decoded_path = urllib.parse.unquote(raw_path)
        candidates = [
            source_file_dir / decoded_path,
            source_file_dir.parent / decoded_path,
            source_file_dir / Path(decoded_path).name,
        ]
        found_src = None
        for cand in candidates:
            if cand.is_file():
                found_src = cand
                break
        if not found_src:
            matches = list(source_file_dir.glob(f"**/{Path(decoded_path).name}"))
            if matches:
                found_src = matches[0]

        if found_src and found_src.is_file():
            target_asset_dir.mkdir(parents=True, exist_ok=True)
            safe_name = re.sub(r'\s+', '-', found_src.name)
            dest_file = target_asset_dir / safe_name
            shutil.copy2(found_src, dest_file)
            image_count += 1
            return f'![{alt}](assets/{slug}/{safe_name})'
        return match.group(0)

    content = md_img_pat.sub(replace_image, content)

    md_link_pat = re.compile(r'\[(.*?)\]\((.*?)\)')
    def replace_link(match):
        text = match.group(1)
        url = match.group(2).strip()
        if url.startswith(('http://', 'https://', '#', 'mailto:')):
            return match.group(0)
        decoded_url = urllib.parse.unquote(url)
        for old_ref, new_slug in link_mapping.items():
            if old_ref in decoded_url or Path(decoded_url).name == old_ref:
                return f'[{text}]({new_slug}.md)'
        return match.group(0)

    content = md_link_pat.sub(replace_link, content)
    return content, image_count

def import_writeups(source_dir: Path, dest_dir: Path, assets_dir: Path, update_nav: bool = True):
    source_dir = Path(source_dir).resolve()
    dest_dir = Path(dest_dir).resolve()
    assets_dir = Path(assets_dir).resolve()

    if not source_dir.exists():
        print(f"[-] Cartella sorgente '{source_dir}' non trovata!")
        return []

    dest_dir.mkdir(parents=True, exist_ok=True)
    assets_dir.mkdir(parents=True, exist_ok=True)
    extract_zips_if_any(source_dir)

    all_md_files = [
        f for f in source_dir.glob("**/*.md")
        if "__MACOSX" not in f.parts and not f.name.startswith("._")
    ]

    link_mapping = {}
    valid_files = []

    for f in all_md_files:
        clean_title, slug = clean_title_and_slug(f.name)
        # Salta indice root di Notion "CTF <hash>.md"
        if clean_title.upper() == "CTF" and len(f.name) > 30:
            continue
        # Salta file incompleti
        if "incompleto" in f.name.lower() or "incompleto" in clean_title.lower():
            print(f"[!] Escluso file incompleto: {f.name}")
            continue

        link_mapping[f.name] = slug
        link_mapping[f.stem] = slug
        link_mapping[clean_title] = slug
        valid_files.append((f, clean_title, slug))

    imported_records = []

    for f, clean_title, slug in sorted(valid_files, key=lambda x: x[1].lower()):
        print(f"[+] Importazione: {clean_title} ({slug}.md)")
        content = f.read_text(encoding="utf-8", errors="replace")

        lines = content.split('\n')
        if lines and lines[0].startswith('# '):
            h1_clean = NOTION_UUID_PATTERN.sub('', lines[0][2:].strip()).strip()
            lines[0] = f"# {h1_clean}"
            content = '\n'.join(lines)
        else:
            content = f"# {clean_title}\n\n" + content

        content = normalize_code_blocks(content)
        content, img_count = process_images_and_links(
            content=content,
            source_file_dir=f.parent,
            slug=slug,
            assets_dest_dir=assets_dir,
            link_mapping=link_mapping
        )

        frontmatter = (
            f"---\n"
            f'title: "{clean_title}"\n'
            f'description: "CTF Writeup - {clean_title} (TryHackMe)"\n'
            f"---\n\n"
        )
        final_content = frontmatter + content
        dest_file = dest_dir / f"{slug}.md"
        dest_file.write_text(final_content, encoding="utf-8")

        imported_records.append({
            "title": clean_title,
            "slug": slug,
            "file": f"{slug}.md",
            "platform": "TryHackMe"
        })

    update_writeups_index(dest_dir, imported_records)
    if update_nav:
        update_mkdocs_nav(imported_records)

    print(f"[✓] Importati {len(imported_records)} writeup con successo.")
    return imported_records

def update_writeups_index(dest_dir: Path, records: list):
    index_path = dest_dir / "index.md"
    rows = []
    for r in sorted(records, key=lambda x: x["title"].lower()):
        title = r["title"]
        slug = r["slug"]
        rows.append(f"| **{title}** | TryHackMe | [Leggi writeup →]({slug}.md) |")

    table_md = "\n".join(rows) if rows else "| Nessun writeup disponibile | - | - |"

    content = f"""---
title: "Indice Writeup"
description: "Archivio completo dei writeup CTF TryHackMe risolti."
---

# Archivio Writeup CTF

Raccolta dei report e delle soluzioni per le macchine risolte su **TryHackMe**. Ciascun articolo descrive il flusso completo: ricognizione, scansione delle porte, enumerazione dei servizi, exploitation e privilege escalation.

Le flag all'interno dei testi sono oscurate per preservare la sfida delle challenge.

---

| Macchina / Stanza | Piattaforma | Link |
| :--- | :--- | :--- |
{table_md}
"""
    index_path.write_text(content, encoding="utf-8")

def update_mkdocs_nav(records: list):
    target_files = [Path("mkdocs.yaml"), Path("mkdocs.yml")]
    for yaml_path in target_files:
        if not yaml_path.exists() or yaml_path.is_symlink():
            continue

        content = yaml_path.read_text(encoding="utf-8")
        lines = [
            "nav:",
            "  - Home: index.md",
            "  - Writeups:",
            "      - Indice Generale: writeups/index.md"
        ]
        for r in sorted(records, key=lambda x: x["title"].lower()):
            safe_title = r['title'].replace('"', '\\"')
            lines.append(f'      - "{safe_title}": writeups/{r["file"]}')

        lines.append("  - About: about.md")
        nav_block = "\n".join(lines) + "\n"

        if "nav:" in content:
            new_content = re.sub(r'nav:\s*\n.*', nav_block, content, flags=re.DOTALL)
        else:
            new_content = content.rstrip() + "\n\n" + nav_block

        yaml_path.write_text(new_content, encoding="utf-8")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Import Notion CTF Writeups")
    parser.add_argument("--source", "-s", default="./notion_export")
    parser.add_argument("--dest", "-d", default="./docs/writeups")
    parser.add_argument("--assets", "-a", default="./docs/writeups/assets")
    parser.add_argument("--no-nav", action="store_true")

    args = parser.parse_args()
    import_writeups(
        source_dir=Path(args.source),
        dest_dir=Path(args.dest),
        assets_dir=Path(args.assets),
        update_nav=not args.no_nav
    )
