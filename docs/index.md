---
title: "Home // CTF Writeups"
description: "Archivio di writeup e note di sicurezza per macchine TryHackMe risolte da favmatteo."
---

# CTF Writeups // favmatteo

Benvenuto nel mio archivio personale di writeup per le macchine CTF risolte principalmente sulla piattaforma **TryHackMe**.

In ogni articolo vengono documentate le fasi della compromissione:
- **Ricognizione & Scansione:** identificazione delle porte e delle versioni dei servizi esposti.
- **Enumerazione:** directory busting, analisi delle risposte HTTP, ispezione dei parametri e ricerca di vulnerabilità.
- **Initial Foothold (Exploit):** sfruttamento del vettore d'attacco per ottenere la prima shell utente.
- **Privilege Escalation:** enumerazione interna di permessi SUID, cronjob, capabilities o misconfiguration per ottenere l'accesso come `root`.

> Le flag all'interno dei writeup sono intenzionalmente oscurate (`THM{********}`) per rispettare le regole delle challenge e non spoilerare le soluzioni.

---

## Indice Rapido delle Macchine

Puoi utilizzare la barra di ricerca in alto (o la scorciatoia ++ctrl+k++) per cercare rapidamente qualsiasi comando, porta, CVE o nome di macchina.

Per consultare l'elenco completo con tutti i report:

👉 **[Vai all'Archivio Completo dei Writeup](writeups/index.md)**
