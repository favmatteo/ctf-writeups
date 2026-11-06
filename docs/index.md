---
title: "Terminal // 0xRoot"
description: "Cybersecurity, CTF Writeups, Penetration Testing & Reverse Engineering notes."
---

<div class="terminal-banner">
<pre>
   ______  ________ ________    _       ______  ________________  __  ______  _____
  / ____/_  __/ ____/ ____/ |  / /   __  / __ \/  _/_  __/ ____/ / / / / __ \/ ___/
 / /     / / / /_  / /_   | | / / | / / / /_/ // /  / / / __/ / / / / /_/ /\__ \ 
/ /___  / / / __/ / __/   | |/ /| |/ / / _, _// /  / / / /___/ /_/ / ____/___/ / 
\____/ /_/ /_/   /_/      |___/ |___/ /_/ |_/___/ /_/ /_____/\____/_/    /____/  
                                                                                 
              [ SESSION INITIALIZED: 0xROOT@KALI-LINUX // TTY1 ]
</pre>
</div>

<p>
  <span class="terminal-badge">STATUS: ONLINE</span>
  <span class="terminal-badge blue">ACCESS: ROOT</span>
  <span class="terminal-badge yellow">ROLE: PENTESTER / CTF PLAYER</span>
  <span class="terminal-cursor"></span>
</p>

## `root@kali:~$ whoami`

Benvenuto nel mio terminale di sicurezza offensiva. Questo archivio raccoglie writeup tecnici dettagliati, note metodologiche e chain di exploit da challenge CTF (TryHackMe, HackTheBox, VulnHub) ed esercitazioni di penetration testing.

Tutti gli articoli sono stati strutturati secondo una metodologia standard:

- **Reconnaissance & OSINT:** Scansione porte, fingerprinting dei servizi e ricognizione iniziale.
- **Enumeration:** Directory busting, ispezione codice sorgente, analisi parametri e fuzzing.
- **Initial Foothold (Exploitation):** Sfruttamento vulnerabilità (RCE, LFI/RFI, SQLi, SSRF, Deserialization).
- **Privilege Escalation:** SUID binaries, cronjobs, misconfiguration sudo e kernel exploitation.
- **Post-Exploitation & Flags:** Esecuzione di comandi, persistenza e flag catturate.

---

## `root@kali:~$ ls -la ./latest-writeups/`

| Data | Challenge / Box | Piattaforma | Difficoltà | Vettore Principale | Read |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `2026-11` | **Infiltrate v1** | HackTheBox | <span class="terminal-badge yellow">Medium</span> | SSTI + Filter Bypass + SUID Abuse | [Read Writeup &rarr;](writeups/web-linux-infiltrate.md) |
| `2026-11` | **OverKnight** | TryHackMe | <span class="terminal-badge red">Hard</span> | Tar Wildcard Injection + Kernel Exploit | [Read Writeup &rarr;](writeups/linux-privesc-kernel-suid.md) |
| `ARCHIVE` | **Tutti i Writeup** | Varie | <span class="terminal-badge blue">All Levels</span> | Consultazione catalogo completo Notion & CTF | [Vai all'Indice &rarr;](writeups/index.md) |

---

## `root@kali:~$ cat /etc/motd`

```bash
[+] "There is no patch for human stupidity... but there is always a shell."
[+] Use search (Ctrl + K) to quickly find CVEs, tools, or machine names.
[+] All flags and sensitive tokens are wrapped in collapsible spoiler boxes.
```
