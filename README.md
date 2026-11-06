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
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-2ea44f.svg?style=flat-square&logo=github)](https://favmatteo.github.io/ctf-writeups/)

Un blog statico completo e minimale in stile **hacker / terminale** per raccogliere, organizzare e pubblicare i propri writeup di CTF esportati direttamente da **Notion**.

Basato su **Python**, **MkDocs** e il tema **mkdocs-material**, include uno script intelligente di parsing e automazione, stili CSS personalizzati in tema dark terminal e deploy diretto su GitHub Pages con `mkdocs gh-deploy`.

---

## ⚡ Caratteristiche Principali

- 💻 **Stile Terminale Scuro:** Palette `slate` con sfondo scuro (`#0a0c10`), font monospace (`JetBrains Mono`), accenti verde terminale (`#00ff66`), badge dedicati e widget interattivo con ciclo casuale delle macchine.
- 🔄 **Parser Automatico da Notion (`scripts/import_notion.py`):**
  - Rimuove automaticamente i lunghi identificatori esadecimali (UUID a 32 caratteri) generati da Notion nei nomi di file e cartelle.
  - Estrae automaticamente gli archivi `.zip` posti in `notion_export/`.
  - Esclude automaticamente bozze o note incomplete (es. file con tag `[INCOMPLETO]`).
  - Copia e organizza tutte le immagini collegate in `docs/writeups/assets/<slug>/`, sistemando i link relativi e risolvendo i caratteri URL-encoded (`%20`).
  - Normalizza i linguaggi dei blocchi di codice (converte i tag errati di Notion come `basic` o blocchi non tipizzati in `bash` quando rileva prompt o tool di pentesting).
  - Rigenera in automatico la tabella dell'archivio in `docs/writeups/index.md` e sincronizza il menu di navigazione in `mkdocs.yaml`.
- 🛡️ **Censura Automatica delle Flag:** Doppia protezione attiva (sia durante l'importazione Notion che a runtime nel browser) che individua e oscura in automatico qualsiasi flag in chiaro (`THM{...}`, `FLAG{...}`, `HTB{...}`) trasformandola in `THM{****************}`.
- ✨ **Autocorrezione Ortografica & Ripristino:** Modulo intelligente (`docs/javascripts/corrector.js`) che corregge automaticamente al volo i refusi tipici di battitura e i termini di cybersecurity (es. *privilege escalation*, accenti, doppie), preservando intatti blocchi di codice e comandi. Include un pulsante terminale a fine articolo per visualizzare o ripristinare il testo originale in qualsiasi momento.
- 🔍 **Ricerca Full-Text Istantanea:** Plugin di ricerca integrato con autocompletamento e suggerimenti in tempo reale.
- 🚀 **Deploy Rapido con `mkdocs gh-deploy`:** Compilazione e pubblicazione sul branch `gh-pages` con un singolo comando locale.

---

## 📁 Struttura del Progetto

```text
PersonalBlog/
├── docs/
│   ├── about.md                  # Pagina About: bio e profili ufficiali
│   ├── index.md                  # Home Page: ultimi writeup per data e widget target
│   ├── javascripts/
│   │   └── corrector.js          # Autocorrezione ortografica e censura runtime flag
│   ├── stylesheets/
│   │   └── extra.css             # CSS custom (tema terminale dark, tabelle, badge)
│   └── writeups/
│       ├── index.md              # Indice completo dei writeup
│       ├── assets/               # Immagini dei writeup organizzate per cartella macchina
│       └── <writeup-importati>.md# Writeup generati dal parser Notion
├── notion_export/                # Cartella per estrarre o salvare gli export di Notion
├── scripts/
│   └── import_notion.py          # Script Python per il parsing e importazione
├── mkdocs.yaml                   # Configurazione principale MkDocs
├── requirements.txt              # Dipendenze Python
└── README.md                     # Documentazione del progetto
```
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

Il metodo più veloce e affidabile per pubblicare il blog senza dipendere dai runner cloud:

```bash
# Esegui il deploy direttamente da terminale
.venv/bin/mkdocs gh-deploy
```

Questo comando compila il sito in locale in 2 secondi e carica i file HTML pronti direttamente sul branch `gh-pages` di GitHub.

### Configurazione su GitHub (solo la prima volta):
1. Vai su **Settings** &rarr; **Pages** del tuo repository `ctf-writeups`.
2. Sotto **Build and deployment**:
   - **Source:** seleziona **Deploy from a branch**.
   - **Branch:** seleziona **`gh-pages`** e cartella **`/ (root)`**.
3. Clicca su **Save**.

Il tuo blog sarà online all'indirizzo:
👉 **`https://favmatteo.github.io/ctf-writeups/`**

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
```text
[+] User Flag: THM{****************}
[+] Root Flag: THM{****************}
```
````

---

## 📜 Licenza & Disclaimer

Questo archivio è rilasciato per scopi puramente educativi e di security research. Tutte le tecniche descritte sono applicate su challenge CTF autorizzate e macchine vulnerabili in laboratorio (TryHackMe).
