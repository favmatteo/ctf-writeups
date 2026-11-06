/**
 * terminal.js - Interactive Web Terminal for CTF Writeups
 * Matteo Favaro // favmatteo@kali:~$
 *
 * Richiamabile da pulsante flottante in basso a destra o tasto rapido ( ` )
 * Permette navigazione ed esecuzione comandi reali (cd, ls, cat, grep, whoami, stats, clear)
 */

(function () {
  "use strict";

  const WRITEUPS = [
    { slug: "0day", title: "0day", os: "Linux", date: "2026-10-30", desc: "Linux Kernel 3.13 exploit & Shellshock CVE-2014-6271" },
    { slug: "agent-sudo", title: "Agent Sudo", os: "Linux", date: "2026-09-15", desc: "User-Agent spoofing, Hash cracking & CVE-2019-14287" },
    { slug: "billing", title: "Billing", os: "Linux", date: "2026-11-04", desc: "Web enumeration, MySQL credential leak & PrivEsc" },
    { slug: "convertmyvideo", title: "ConvertMyVideo", os: "Linux", date: "2026-09-20", desc: "Command injection in video converter & cronjob privesc" },
    { slug: "dogcat", title: "dogcat", os: "Linux", date: "2026-09-25", desc: "LFI with PHP wrappers, Apache log poisoning & Docker breakout" },
    { slug: "gamingserver", title: "GamingServer", os: "Linux", date: "2026-10-31", desc: "Web fuzzing, dictionary attack & LXD container privesc" },
    { slug: "jump", title: "Jump", os: "Linux", date: "2026-10-20", desc: "Multi-user escalation chain (recon -> dev -> monitor -> ops -> root)" },
    { slug: "mr-robot", title: "Mr Robot", os: "Linux", date: "2026-09-10", desc: "WordPress reconnaissance, Base64 decoding, nmap interactive SUID" },
    { slug: "mustacchio", title: "Mustacchio", os: "Linux", date: "2026-10-15", desc: "XXE injection in XML form, SSH key extract, SUID PATH hijacking" },
    { slug: "operation-promotion", title: "Operation Promotion", os: "Linux", date: "2026-10-22", desc: "Corporate recruitment app, sudo privileges & root elevation" },
    { slug: "overpass", title: "Overpass", os: "Linux", date: "2026-09-18", desc: "Broken auth via cookies, John The Ripper & DNS hosts cronjob hijack" },
    { slug: "overpass-3-hosting", title: "Overpass 3 - Hosting", os: "Linux", date: "2026-09-22", desc: "NFS no_root_squash, GPG decryption & SUID exploitation" },
    { slug: "pickle-rick", title: "Pickle Rick", os: "Linux", date: "2026-08-30", desc: "Command panel bypass, reverse shell, sudo without password" },
    { slug: "road", title: "Road", os: "Linux", date: "2026-08-26", desc: "Password reset bypass, PHP reverse shell upload & LD_PRELOAD privesc" },
    { slug: "silver-platter", title: "Silver Platter", os: "Linux", date: "2026-11-06", desc: "Service discovery, initial exploitation & root access" },
    { slug: "support", title: "Support", os: "Linux", date: "2026-09-03", desc: "Support portal analysis, command injection via frontend parameter" },
    { slug: "the-blob-blog", title: "The Blob Blog", os: "Linux", date: "2026-09-28", desc: "Blog authentication, binary feedback exploitation & crontab root" },
    { slug: "the-marketplace", title: "The Marketplace", os: "Linux", date: "2026-10-05", desc: "Blind XSS via contact form, cookie hijacking & MySQL dump" },
    { slug: "tomghost", title: "Tomghost", os: "Linux", date: "2026-09-12", desc: "Ghostcat (CVE-2020-1938) AJP file read & John The Ripper GPG crack" },
    { slug: "tryheartme", title: "TryHeartMe", os: "Linux", date: "2026-09-03", desc: "JWT token manipulation, admin cookie tampering & web shop bypass" },
    { slug: "watcher", title: "Watcher", os: "Linux", date: "2026-10-27", desc: "LFI to reverse shell, sudo Toby, crontab Will & sudo root" },
    { slug: "windows-jump", title: "Windows Jump", os: "Windows", date: "2026-10-31", desc: "SMB enumeration, Winlogon credentials, Scheduled Tasks privesc" }
  ];

  function getBaseUrl() {
    const canonical = document.querySelector("link[rel='canonical']");
    if (canonical && canonical.href) {
      try {
        const u = new URL(canonical.href);
        const match = u.pathname.match(/^(\/[^\/]+\/)/);
        return match ? match[1] : "/";
      } catch (e) {}
    }
    return window.location.pathname.startsWith("/ctf-writeups") ? "/ctf-writeups/" : "/";
  }

  function resolveUrl(path) {
    const base = getBaseUrl().replace(/\/$/, "");
    const clean = path.replace(/^\//, "");
    return `${base}/${clean}`;
  }

  // Creazione interfaccia DOM del terminale
  function createTerminalUI() {
    if (document.getElementById("web-terminal-container")) return;

    const container = document.createElement("div");
    container.id = "web-terminal-container";
    container.innerHTML = `
      <!-- Bottone flottante per aprire il terminale -->
      <button class="term-fab" id="term-fab-toggle" type="button" aria-label="Apri terminale interattivo" title="Apri terminale (tasto rapido: \`)">
        <span class="term-fab-icon">&gt;_</span>
        <span class="term-fab-text">shell</span>
      </button>

      <!-- Finestra Terminale a scomparsa -->
      <div class="term-window" id="term-window" style="display: none;">
        <div class="term-win-bar">
          <div class="term-win-dots">
            <span class="term-dot red" id="term-btn-close" title="Chiudi"></span>
            <span class="term-dot yellow" id="term-btn-min" title="Riduci a icona"></span>
            <span class="term-dot green" id="term-btn-max" title="Ingrandisci"></span>
          </div>
          <div class="term-win-title">favmatteo@kali: ~ (zsh)</div>
          <button class="term-win-close-x" id="term-btn-x" type="button">✕</button>
        </div>
        <div class="term-win-body" id="term-win-body">
          <div class="term-screen" id="term-screen">
            <div class="term-banner">
              <span style="color:#00ff66;font-weight:bold;">┌──(favmatteo㉿kali)-[~]</span><br>
              <span style="color:#00ff66;font-weight:bold;">└─$</span> ./welcome.sh<br>
              <span style="color:#8b949e;">=====================================================================</span><br>
              <span style="color:#38bdf8;font-weight:bold;">Kali Linux Terminal v2.0 // CTF Interactive Portfolio</span><br>
              <span style="color:#8b949e;">Digita </span><span style="color:#00ff66;font-weight:bold;">help</span><span style="color:#8b949e;"> per i comandi, </span><span style="color:#00ff66;font-weight:bold;">ls</span><span style="color:#8b949e;"> per le macchine, </span><span style="color:#00ff66;font-weight:bold;">cd &lt;box&gt;</span><span style="color:#8b949e;"> per navigare.</span><br>
              <span style="color:#8b949e;">=====================================================================</span>
            </div>
            <div id="term-output-history"></div>
            <div class="term-prompt-line">
              <span class="term-prompt-label">favmatteo@kali:<span class="term-prompt-cwd">~</span>$&nbsp;</span>
              <input type="text" id="term-cmd-input" class="term-cmd-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    attachTerminalEvents();
  }

  // Gestione comandi e interazioni
  function attachTerminalEvents() {
    const fab = document.getElementById("term-fab-toggle");
    const win = document.getElementById("term-window");
    const closeBtn = document.getElementById("term-btn-close");
    const minBtn = document.getElementById("term-btn-min");
    const maxBtn = document.getElementById("term-btn-max");
    const xBtn = document.getElementById("term-btn-x");
    const input = document.getElementById("term-cmd-input");
    const body = document.getElementById("term-win-body");
    const historyDiv = document.getElementById("term-output-history");

    let isMaximized = false;
    let cmdHistory = [];
    let historyIndex = -1;

    function toggleTerminal() {
      if (win.style.display === "none" || !win.style.display) {
        win.style.display = "flex";
        input.focus();
        scrollToBottom();
      } else {
        win.style.display = "none";
      }
    }

    function scrollToBottom() {
      setTimeout(() => {
        body.scrollTop = body.scrollHeight;
      }, 10);
    }

    fab.addEventListener("click", toggleTerminal);
    closeBtn.addEventListener("click", toggleTerminal);
    minBtn.addEventListener("click", toggleTerminal);
    xBtn.addEventListener("click", toggleTerminal);

    maxBtn.addEventListener("click", () => {
      isMaximized = !isMaximized;
      win.classList.toggle("term-window--maximized", isMaximized);
      scrollToBottom();
    });

    body.addEventListener("click", (e) => {
      // Se non sta selezionando testo, metti a fuoco l'input
      if (!window.getSelection().toString()) {
        input.focus();
      }
    });

    // Tasto rapido da tastiera: backtick ( ` ) o Ctrl + `
    document.addEventListener("keydown", (e) => {
      // Ignora se l'utente sta scrivendo in un altro input fuori dal terminale
      const active = document.activeElement;
      const isInput = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
      if (isInput && active !== input) return;

      if (e.key === "`" || (e.ctrlKey && e.key === "~") || (e.ctrlKey && e.key === "\\")) {
        e.preventDefault();
        toggleTerminal();
      }
    });

    // Gestione input comandi
    input.addEventListener("keydown", (e) => {
      // Freccia Su: comando precedente
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (cmdHistory.length && historyIndex < cmdHistory.length - 1) {
          historyIndex++;
          input.value = cmdHistory[cmdHistory.length - 1 - historyIndex];
        }
        return;
      }

      // Freccia Giù: comando successivo
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          input.value = cmdHistory[cmdHistory.length - 1 - historyIndex];
        } else if (historyIndex === 0) {
          historyIndex = -1;
          input.value = "";
        }
        return;
      }

      // Tab completion
      if (e.key === "Tab") {
        e.preventDefault();
        handleTabCompletion(input);
        return;
      }

      // Invio comando
      if (e.key === "Enter") {
        const rawCmd = input.value.trim();
        input.value = "";
        historyIndex = -1;

        if (rawCmd) {
          cmdHistory.push(rawCmd);
        }

        executeCommand(rawCmd, historyDiv);
        scrollToBottom();
      }
    });
  }

  // Autocompletamento con Tab
  function handleTabCompletion(inputEl) {
    const val = inputEl.value;
    const tokens = val.split(" ");
    const lastToken = tokens[tokens.length - 1].toLowerCase();

    if (!lastToken) return;

    const availableCommands = ["help", "ls", "cd", "cat", "grep", "search", "whoami", "stats", "clear", "exit", "banner", "uname"];

    if (tokens.length === 1) {
      const match = availableCommands.find(c => c.startsWith(lastToken));
      if (match) {
        inputEl.value = match + " ";
      }
    } else if (tokens.length >= 2 && (tokens[0] === "cd" || tokens[0] === "cat")) {
      const match = WRITEUPS.find(w => w.slug.startsWith(lastToken) || w.title.toLowerCase().startsWith(lastToken));
      if (match) {
        tokens[tokens.length - 1] = match.slug;
        inputEl.value = tokens.join(" ") + " ";
      }
    }
  }

  // Esecuzione dei comandi da terminale
  function executeCommand(rawCmd, outputContainer) {
    const line = document.createElement("div");
    line.className = "term-history-entry";

    const promptSpan = document.createElement("div");
    promptSpan.className = "term-line-input";
    promptSpan.innerHTML = `<span class="term-prompt-prefix">favmatteo@kali:<span class="term-prompt-dir">~</span>$&nbsp;</span>${escapeHtml(rawCmd)}`;
    line.appendChild(promptSpan);

    if (!rawCmd) {
      outputContainer.appendChild(line);
      return;
    }

    const tokens = rawCmd.split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    const outSpan = document.createElement("div");
    outSpan.className = "term-line-output";

    switch (cmd) {
      case "help":
      case "?":
        outSpan.innerHTML = `
<span style="color:#00ff66;font-weight:bold;">Comandi di navigazione & portfolio:</span>
  <span style="color:#38bdf8;">ls [dir]</span>          - Elenca macchine e sezioni disponibili
  <span style="color:#38bdf8;">cd &lt;target&gt;</span>       - Naviga verso un writeup o pagina (es: 'cd 0day', 'cd about', 'cd ..')
  <span style="color:#38bdf8;">cat &lt;box&gt;</span>         - Mostra dettagli rapidi di una macchina (es: 'cat mr-robot')
  <span style="color:#38bdf8;">grep &lt;termine&gt;</span>     - Cerca macchine per parola chiave o tecnica (es: 'grep privesc')
  <span style="color:#38bdf8;">whoami</span>              - Mostra informazioni sull'autore e profili
  <span style="color:#38bdf8;">stats</span>               - Visualizza statistiche del portfolio CTF
  <span style="color:#38bdf8;">clear</span>               - Ripulisce lo schermo
  <span style="color:#38bdf8;">exit</span>                - Chiude la finestra del terminale
  <span style="color:#38bdf8;">uname -a</span>            - Informazioni di sistema`;
        break;

      case "ls":
      case "dir":
        const sub = args[0] ? args[0].toLowerCase() : "";
        if (sub === ".." || sub === "~" || sub === "/" || !sub) {
          let rowsHtml = `
<span style="color:#38bdf8;font-weight:bold;">📁 Directory principali:</span>
  <span style="color:#00ff66;">writeups/</span>    <span style="color:#00ff66;">about.md</span>    <span style="color:#00ff66;">index.md</span>

<span style="color:#38bdf8;font-weight:bold;">🎯 Macchine TryHackMe (${WRITEUPS.length} totali):</span>
<div class="term-ls-grid">`;
          WRITEUPS.forEach(w => {
            const osColor = w.os === "Windows" ? "#38bdf8" : "#00ff66";
            const targetUrl = resolveUrl(`writeups/${w.slug}/`);
            rowsHtml += `  <a href="${targetUrl}" class="term-ls-link" style="color:${osColor};">${w.slug}</a>`;
          });
          rowsHtml += `</div>
<span style="color:#8b949e;font-size:0.75rem;">Suggerimento: digita 'cd &lt;nome&gt;' o clicca su una macchina per aprire il writeup.</span>`;
          outSpan.innerHTML = rowsHtml;
        } else {
          outSpan.innerHTML = `<span style="color:#ff5f56;">ls: impossibile accedere a '${escapeHtml(args[0])}': No such file or directory</span>`;
        }
        break;

      case "cd":
        if (!args.length || args[0] === "~" || args[0] === "/" || args[0] === ".." || args[0] === "home") {
          outSpan.innerHTML = `<span style="color:#00ff66;">[+] Navigazione alla Home...</span>`;
          setTimeout(() => { window.location.href = resolveUrl(""); }, 300);
          break;
        }

        const target = args[0].toLowerCase().replace(/\/$/, "");

        if (target === "about" || target === "about.md") {
          outSpan.innerHTML = `<span style="color:#00ff66;">[+] Apertura pagina About...</span>`;
          setTimeout(() => { window.location.href = resolveUrl("about/"); }, 300);
          break;
        }

        if (target === "writeups" || target === "writeups/") {
          outSpan.innerHTML = `<span style="color:#00ff66;">[+] Apertura Indice Writeup...</span>`;
          setTimeout(() => { window.location.href = resolveUrl("writeups/"); }, 300);
          break;
        }

        // Cerca writeup corrispondente
        const found = WRITEUPS.find(w => w.slug === target || w.title.toLowerCase() === target || w.slug.includes(target));
        if (found) {
          outSpan.innerHTML = `<span style="color:#00ff66;">[+] Apertura writeup '${found.title}' (${found.os})...</span>`;
          setTimeout(() => { window.location.href = resolveUrl(`writeups/${found.slug}/`); }, 350);
        } else {
          outSpan.innerHTML = `<span style="color:#ff5f56;">cd: '${escapeHtml(args[0])}': Box non trovata. Digita 'ls' per l'elenco.</span>`;
        }
        break;

      case "cat":
        if (!args.length) {
          outSpan.innerHTML = `<span style="color:#ff5f56;">Uso: cat &lt;box-name&gt; (es: cat 0day, cat mr-robot)</span>`;
          break;
        }
        const catTarget = args[0].toLowerCase().replace(/\/$/, "");
        if (catTarget === "about" || catTarget === "about.md") {
          outSpan.innerHTML = `
<span style="color:#00ff66;font-weight:bold;">== About Matteo Favaro ==</span>
Autore e Security Researcher. Appunti di penetration testing per macchine vulnerabili TryHackMe.
• TryHackMe: matteo.favaro460
• GitHub: favmatteo
👉 Digita 'cd about' per aprire la pagina completa.`;
          break;
        }

        const catBox = WRITEUPS.find(w => w.slug === catTarget || w.slug.includes(catTarget));
        if (catBox) {
          outSpan.innerHTML = `
<span style="color:#00ff66;font-weight:bold;">== ${catBox.title} ==</span>
• OS: ${catBox.os}
• Piattaforma: TryHackMe
• Data Scansione: ${catBox.date}
• Sintesi: ${catBox.desc}
👉 <a href="${resolveUrl(`writeups/${catBox.slug}/`)}" style="color:#38bdf8;text-decoration:underline;">Apri report completo &rarr;</a> (o digita 'cd ${catBox.slug}')`;
        } else {
          outSpan.innerHTML = `<span style="color:#ff5f56;">cat: '${escapeHtml(args[0])}': File non trovato. Digita 'ls' per vedere le box.</span>`;
        }
        break;

      case "grep":
      case "search":
      case "find":
        if (!args.length) {
          outSpan.innerHTML = `<span style="color:#ff5f56;">Uso: grep &lt;termine&gt; (es: grep kernel, grep privesc, grep windows)</span>`;
          break;
        }
        const query = args.join(" ").toLowerCase();
        const matches = WRITEUPS.filter(w =>
          w.slug.includes(query) ||
          w.title.toLowerCase().includes(query) ||
          w.desc.toLowerCase().includes(query) ||
          w.os.toLowerCase().includes(query)
        );

        if (matches.length) {
          let resHtml = `<span style="color:#00ff66;">[+] Trovate ${matches.length} corrispondenze per '${escapeHtml(query)}':</span>\n`;
          matches.forEach(m => {
            const url = resolveUrl(`writeups/${m.slug}/`);
            resHtml += `• <a href="${url}" style="color:#38bdf8;font-weight:bold;">${m.title}</a> (${m.os}) - <span style="color:#8b949e;">${m.desc}</span>\n`;
          });
          outSpan.innerHTML = resHtml.trim();
        } else {
          outSpan.innerHTML = `<span style="color:#8b949e;">[-] Nessun risultato trovato per '${escapeHtml(query)}'.</span>`;
        }
        break;

      case "whoami":
        outSpan.innerHTML = `
<span style="color:#00ff66;font-weight:bold;">Matteo Favaro</span> // Security Enthusiast & Pentester
• TryHackMe: <a href="https://tryhackme.com/p/matteo.favaro460" target="_blank" style="color:#38bdf8;">matteo.favaro460</a>
• GitHub: <a href="https://github.com/favmatteo" target="_blank" style="color:#38bdf8;">favmatteo</a>
• Blog: <span style="color:#8b949e;">CTF Writeups & Penetration Testing Archive</span>`;
        break;

      case "stats":
        outSpan.innerHTML = `
<span style="color:#00ff66;font-weight:bold;">📊 Portfolio Statistics:</span>
  • Box Risolte:       <span style="color:#00ff66;font-weight:bold;">22</span>
  • Target Linux:      <span style="color:#00ff66;">21</span>
  • Target Windows:    <span style="color:#38bdf8;">1</span>
  • Piattaforma:       <span style="color:#ffbd2e;">TryHackMe (100%)</span>
  • Ultimo Target:     <span style="color:#e6edf3;">Silver Platter (2026-11-06)</span>`;
        break;

      case "clear":
      case "cls":
        outputContainer.innerHTML = "";
        return;

      case "exit":
      case "quit":
      case "close":
        const win = document.getElementById("term-window");
        if (win) win.style.display = "none";
        return;

      case "uname":
        outSpan.innerHTML = `Linux kali 6.12.0-kali1-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.12 (2026-11-06) x86_64 GNU/Linux`;
        break;

      case "banner":
        outSpan.innerHTML = `
<pre style="color:#00ff66;background:transparent;border:none;margin:0;padding:0;font-size:0.75rem;">
  ____ _____ _____  __        ______  ___ _____ _____ _   _ ____  ____  
 / ___|_   _|  ___| \\ \\      / /  _ \\|_ _|_   _| ____| | | |  _ \\/ ___| 
| |     | | | |_     \\ \\ /\\ / /| |_) || |  | | |  _| | | | | |_) \\___ \\ 
| |___  | | |  _|     \\ V  V / |  _ < | |  | | | |___| |_| |  __/ ___) |
 \\____| |_| |_|        \\_/\\_/  |_| \\_\\___| |_| |_____|\\___/|_|   |____/  
               [ Matteo Favaro // favmatteo@kali ]
</pre>`;
        break;

      default:
        outSpan.innerHTML = `<span style="color:#ff5f56;">bash: comando non trovato: '${escapeHtml(cmd)}'. Digita 'help' per la lista dei comandi.</span>`;
        break;
    }

    line.appendChild(outSpan);
    outputContainer.appendChild(line);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Supporto instant navigation e DOMContentLoaded
  if (typeof document$ !== "undefined") {
    document$.subscribe(createTerminalUI);
  } else {
    document.addEventListener("DOMContentLoaded", createTerminalUI);
  }
})();
