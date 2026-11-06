---
title: "CTF Writeups Archive"
description: "Catalogo completo dei writeup CTF e macchine risolte."
---

# `root@kali:~$ find ./writeups/ -type f -name "*.md"`

Benvenuto nell'archivio dei writeup CTF. Tutti i report includono la scansione preliminare, l'analisi del vettore di attacco, i payload utilizzati e il percorso di privilege escalation.

Le flag e i dati sensibili sono protetti da blocchi collassabili spoiler (`???+ success "Flag"`), così puoi consultare il percorso logico senza spoilerarti la soluzione finale.

---

## Writeups in Evidenza (Esempi Format Standard)

### 1. [Web & Linux - Infiltrate v1](web-linux-infiltrate.md)
- **Piattaforma:** HackTheBox
- **Target OS:** Linux (Ubuntu 22.04 LTS)
- **Tag:** `Web`, `SSTI`, `Flask`, `Jinja2-Bypass`, `SUID`, `GTFOBins`
- **Sintesi:** Sfruttamento di una SSTI in un'applicazione Flask con filtri regex sui caratteri speciali, acquisizione di reverse shell come `www-data` e privilege escalation tramite un binario SUID personalizzato vulnerabile a path injection.

### 2. [Linux - Kernel & SUID PrivEsc (OverKnight)](linux-privesc-kernel-suid.md)
- **Piattaforma:** TryHackMe
- **Target OS:** Linux (Debian 11)
- **Tag:** `PrivEsc`, `Tar-Wildcard`, `Cronjob`, `Capabilities`, `Linux-Internal`
- **Sintesi:** Dalla compromissione iniziale come utente `lowpriv` attraverso un cronjob mal configurato con `tar *` wildcard injection, fino all'escalation completa a `root` abusando di capabilities POSIX non standard su un interprete Python.

---

## Catalogo Writeup Importati da Notion (23 Macchine)

| Challenge / Macchina | Piattaforma | Link Report |
| :--- | :--- | :--- |
| **0day** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](0day.md) |
| **[INCOMPLETO] PaperWork** | <span class="terminal-badge blue">HackTheBox</span> | [`Apri Writeup &rarr;`](incompleto-paperwork.md) |
| **Agent Sudo** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](agent-sudo.md) |
| **Billing** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](billing.md) |
| **ConvertMyVideo** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](convertmyvideo.md) |
| **dogcat** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](dogcat.md) |
| **GamingServer** | <span class="terminal-badge ">CTF / Lab</span> | [`Apri Writeup &rarr;`](gamingserver.md) |
| **Jump** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](jump.md) |
| **Mr Robot** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](mr-robot.md) |
| **Mustacchio** | <span class="terminal-badge ">CTF / Lab</span> | [`Apri Writeup &rarr;`](mustacchio.md) |
| **Operation Promotion** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](operation-promotion.md) |
| **Overpass** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](overpass.md) |
| **Overpass 3 - Hosting** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](overpass-3-hosting.md) |
| **Pickle Rick** | <span class="terminal-badge ">CTF / Lab</span> | [`Apri Writeup &rarr;`](pickle-rick.md) |
| **Road** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](road.md) |
| **Silver Platter** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](silver-platter.md) |
| **Support** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](support.md) |
| **The Blob Blog** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](the-blob-blog.md) |
| **The Marketplace** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](the-marketplace.md) |
| **Tomghost** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](tomghost.md) |
| **TryHeartMe** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](tryheartme.md) |
| **Watcher** | <span class="terminal-badge ">CTF / Lab</span> | [`Apri Writeup &rarr;`](watcher.md) |
| **Windows Jump** | <span class="terminal-badge red">TryHackMe</span> | [`Apri Writeup &rarr;`](windows-jump.md) |

---

## Procedura di Aggiornamento

Per aggiungere o sincronizzare nuovi writeup esportati da Notion:

```bash
# 1. Copia o estrai lo zip in ./notion_export/
# 2. Esegui lo script:
python3 scripts/import_notion.py

# 3. Testa in locale:
mkdocs serve
```
