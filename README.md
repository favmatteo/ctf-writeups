# 🏴‍☠️ Terminal CTF // Personal Writeups Blog

```text
   ______  ________ ________    _       ______  ________________  __  ______  _____
  / ____/_  __/ ____/ ____/ |  / /   __  / __ \/  _/_  __/ ____/ / / / / __ \/ ___/
 / /     / / / /_  / /_   | | / / | / / / /_/ // /  / / / __/ / / / / /_/ /\__ \ 
/ /___  / / / __/ / __/   | |/ /| |/ / / _, _// /  / / / /___/ /_/ / ____/___/ / 
\____/ /_/ /_/   /_/      |___/ |___/ /_/ |_/___/ /_/ /_____/\____/_/    /____/  
                                                                                 
              [ 0xROOT // OFFENSIVE SECURITY & CTF ARCHIVE ]
```

[![MkDocs](https://img.shields.io/badge/MkDocs-1.6.1-green.svg?style=flat-square&logo=markdown)](https://www.mkdocs.org/)
[![Material for MkDocs](https://img.shields.io/badge/Material%20for%20MkDocs-9.8.0-00ff66.svg?style=flat-square&logo=materialformkdocs)](https://squidfunk.github.io/mkdocs-material/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?style=flat-square&logo=python)](https://www.python.org/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Pages-Automated%20CI%2FCD-2ea44f.svg?style=flat-square&logo=githubactions)](https://github.com/features/actions)

Un blog statico completo e minimale in stile **hacker / terminale** per raccogliere, organizzare e pubblicare i propri writeup di CTF (TryHackMe, HackTheBox, VulnHub) esportati direttamente da **Notion**.

Basato su **Python**, **MkDocs** e il tema **mkdocs-material**, include uno script intelligente di parsing e automazione, stili CSS personalizzati (CRT scanlines, neon glow, cursore lampeggiante) e una pipeline GitHub Actions già pronta per il deploy automatico su GitHub Pages.

---

## ⚡ Caratteristiche Principali

- 💻 **Stile Terminale Scuro:** Palette `slate` con sfondo rigorosamente scuro (`#0a0a0a`), font monospace (`JetBrains Mono` / `Fira Code`), accenti verde neon (`#00ff66`), cursore lampeggiante ed effetti scanline CRT leggeri.
- 🔄 **Parser Automatico da Notion (`scripts/import_notion.py`):**
  - Rimuove automaticamente i lunghi identificatori esadecimali (UUID a 32 caratteri) generati da Notion nei nomi di file e cartelle.
  - Estrae automaticamente gli archivi `.zip` posti in `notion_export/`.
  - Copia e organizza tutte le immagini collegate in `docs/writeups/assets/<slug>/`, sistemando i link relativi e risolvendo i caratteri URL-encoded (`%20`).
  - Normalizza i linguaggi dei blocchi di codice (converte i tag errati di Notion come `basic` o blocchi vuoti in `bash` quando rileva prompt o tool di pentesting).
  - Converte i callout e le emoji di Notion in blocchi di admonition nativi di MkDocs Material.
  - Rigenera in automatico la tabella dell'archivio in `docs/writeups/index.md` e aggiorna il menu di navigazione in `mkdocs.yaml`.
- 🚩 **Spoiler Box per Flag:** Supporto integrato ai blocchi collassabili `pymdownx.details` (`???+ success "Flag"`) per non spoilerare le flag durante la lettura.
- 🔍 **Ricerca Full-Text Istantanea:** Plugin di ricerca integrato con autocompletamento e suggerimenti in tempo reale.
- 🚀 **Deploy Automatico su GitHub Pages:** Pipeline GitHub Actions configurata su `.github/workflows/deploy.yml` che compila il sito e lo pubblica automaticamente ad ogni push sul branch `main`.

---

## 📁 Struttura del Progetto

```text
PersonalBlog/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD: build e deploy automatico su GitHub Pages
├── docs/
│   ├── about.md                  # Pagina About: bio, certificazioni e toolkit
│   ├── index.md                  # Home Page con banner ASCII art e ultimi articoli
│   ├── stylesheets/
│   │   └── extra.css             # CSS custom (tema terminale, glow, animazioni)
│   └── writeups/
│       ├── index.md              # Indice/catalogo completo dei writeup
│       ├── assets/               # Immagini dei writeup organizzate per macchina
│       ├── web-linux-infiltrate.md        # Esempio realistico Linux / Web
│       ├── linux-privesc-kernel-suid.md   # Esempio realistico Linux PrivEsc
│       └── <writeup-importati>.md         # Writeup generati dal parser Notion
├── notion_export/                # Cartella per estrarre o salvare gli Zip di Notion
├── scripts/
│   └── import_notion.py          # Script Python per il parsing e importazione
├── mkdocs.yaml                   # Configurazione principale MkDocs
├── requirements.txt              # Dipendenze Python
└── README.md                     # Documentazione del progetto
```

---

## 🛠️ Prerequisiti e Installazione Locale

### 1. Clona il repository

```bash
git clone https://github.com/favmatteo/ctf-writeups.git
cd ctf-writeups
```

### 2. Crea e attiva un Virtual Environment

```bash
# Creazione del venv
python3 -m venv .venv

# Attivazione (Linux / macOS)
source .venv/bin/activate

# Su Windows (PowerShell):
# .venv\Scripts\Activate.ps1
```

### 3. Installa le dipendenze

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 📥 Flusso di Importazione da Notion

Quando vuoi aggiungere nuovi writeup documentati su Notion:

1. In Notion, apri la pagina o il database dei tuoi CTF.
2. Clicca sui tre puntini `...` in alto a destra &rarr; **Export**.
3. Seleziona:
   - **Export format:** `Markdown & CSV`
   - **Include content:** `Everything` (o `Include subpages`)
4. Posiziona il file `.zip` esportato (oppure estraine il contenuto) dentro la cartella `./notion_export/`:

```bash
# Esempio: copia lo zip esportato da Notion
cp ~/Downloads/Export-*.zip ./notion_export/
```

5. Esegui lo script di conversione:

```bash
python3 scripts/import_notion.py
```

Lo script provvederà a:
- Decomprimere lo zip (se presente).
- Eliminare tutti gli ID esadecimali Notion dai file Markdown.
- Copiare e riorganizzare tutte le immagini in `docs/writeups/assets/<slug>/`.
- Aggiornare i link alle immagini e le referenze interne tra pagine.
- Aggiornare il catalogo in `docs/writeups/index.md`.
- Sincronizzare la voce `Archivio Notion` nella navigazione di `mkdocs.yaml`.

---

## 🖥️ Avvio del Server Locale di Sviluppo

Per testare e visualizzare il blog localmente in tempo reale con live-reload:

```bash
mkdocs serve
```

Apri il browser su:
```text
http://127.0.0.1:8000/
```

Per verificare che la build sia esente da errori di sintassi o link rotti:

```bash
mkdocs build --strict
```

---

## 🌐 Pubblicazione su GitHub Pages

### 1. Configura `mkdocs.yaml`
Apri `mkdocs.yaml` e imposta il tuo username e il nome della repository:

```yaml
site_url: "https://favmatteo.github.io/ctf-writeups/"
repo_name: "favmatteo/ctf-writeups"
repo_url: "https://github.com/favmatteo/ctf-writeups"
```

### 2. Abilita GitHub Actions per GitHub Pages
1. Vai sulla pagina della tua repository su GitHub.
2. Clicca su **Settings** &rarr; **Pages** (nel menu a sinistra).
3. Sotto la voce **Build and deployment**:
   - Imposta **Source** su **GitHub Actions**.

### 3. Effettua il Push sul branch `main`

```bash
git add .
git commit -m "feat: aggiornamento writeup blog"
git push origin main
```

La GitHub Action `.github/workflows/deploy.yml` verrà avviata automaticamente:
- Installerà le dipendenze.
- Eseguirà l'importatore Notion (se sono presenti nuovi file).
- Compilerà il sito statico.
- Lo pubblicherà direttamente sull'URL `https://favmatteo.github.io/ctf-writeups/`.

---

## 📝 Struttura Consigliata per i Writeup CTF

Tutti i writeup seguono la metodologia standard del penetration testing:

````markdown
---
title: "Nome Box (Piattaforma)"
description: "Sintesi dell'attacco e tecniche usate."
---

# Nome Box

<p>
  <span class="terminal-badge yellow">Difficulty: Medium</span>
  <span class="terminal-badge blue">OS: Linux</span>
  <span class="terminal-badge">Tags: Web, SSTI, SUID</span>
</p>

## [+] Reconnaissance
Scansione porte con Nmap e rilevamento servizi esposti.

## [+] Enumeration
Fuzzing cartelle web (ffuf/gobuster), analisi parametri, ispezione codice sorgente.

## [+] Exploitation
Sfruttamento vulnerabilità per ottenere la reverse shell iniziale.

## [+] Privilege Escalation
Analisi permessi SUID, cronjob, capabilities o vulnerabilità kernel per diventare root.

## [+] Flag
???+ success "User & Root Flag"
    ```text
    [+] User Flag: THM{user_flag_here}
    [+] Root Flag: THM{root_flag_here}
    ```
````

---

## 📜 Licenza & Disclaimer

Questo archivio è rilasciato per scopi puramente educativi e di security research. Tutte le tecniche descritte sono applicate su challenge CTF autorizzate e macchine vulnerabili in laboratorio (HackTheBox, TryHackMe, VulnHub).
