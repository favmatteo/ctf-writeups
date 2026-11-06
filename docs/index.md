---
title: "Home // CTF Writeups"
description: "Archivio di writeup e note di sicurezza per macchine TryHackMe risolte da Matteo Favaro (matteo.favaro460)."
---

# CTF Writeups // Matteo Favaro

Benvenuto nel mio archivio personale di writeup per le macchine CTF risolte sulla piattaforma **TryHackMe**.

In ogni articolo vengono documentate le fasi della compromissione: ricognizione, scansione delle porte, enumerazione, exploit per l'initial foothold e privilege escalation per ottenere l'accesso root.

> Le flag all'interno dei testi sono oscurate (`THM{********}`) per preservare le challenge.

---

## `favmatteo@kali:~$ ./ctf-stats.sh --summary`

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-number" id="stats-total">22</div>
    <div class="stat-label">Box Risolte</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="stats-linux">21</div>
    <div class="stat-label">Target Linux</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="stats-windows">1</div>
    <div class="stat-label">Target Windows</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">100%</div>
    <div class="stat-label">TryHackMe</div>
  </div>
</div>

---

## `favmatteo@kali:~$ ./latest-writeups.sh --limit 6`

Le ultime macchine analizzate ordinate per data di scansione reale:

| Data Scansione | Macchina / Box | Piattaforma | Link Report |
| :--- | :--- | :--- | :--- |
| `2026-11-06` | **Silver Platter** | TryHackMe | [Leggi writeup →](writeups/silver-platter.md) |
| `2026-11-04` | **Billing** | TryHackMe | [Leggi writeup →](writeups/billing.md) |
| `2026-10-31` | **Windows Jump** | TryHackMe | [Leggi writeup →](writeups/windows-jump.md) |
| `2026-10-31` | **GamingServer** | TryHackMe | [Leggi writeup →](writeups/gamingserver.md) |
| `2026-10-30` | **0day** | TryHackMe | [Leggi writeup →](writeups/0day.md) |
| `2026-10-27` | **Watcher** | TryHackMe | [Leggi writeup →](writeups/watcher.md) |

---

## `favmatteo@kali:~$ shuf -n 1 targets.txt --auto-cycle`

<div class="terminal-card">
  <div class="terminal-bar">
    <span class="term-dot red"></span>
    <span class="term-dot yellow"></span>
    <span class="term-dot green"></span>
    <span class="term-title">bash - favmatteo@kali: ~</span>
  </div>
  <div class="terminal-body">
    <div class="terminal-cmd">favmatteo@kali:~$ ./random-target.sh</div>
    <div class="terminal-output">
      [+] Target estratto: <a id="random-box-link" href="writeups/silver-platter.md" class="random-box-title">Silver Platter</a>
      <button class="random-btn" id="reroll-btn" onclick="triggerManualReroll()">🎲 Reroll</button>
      <span class="random-timer" id="random-timer">prossimo tra 8s...</span>
    </div>
  </div>
</div>

<script>
(function() {
  const writeups = [
    { title: "0day", url: "writeups/0day.md" },
    { title: "Agent Sudo", url: "writeups/agent-sudo.md" },
    { title: "Billing", url: "writeups/billing.md" },
    { title: "ConvertMyVideo", url: "writeups/convertmyvideo.md" },
    { title: "dogcat", url: "writeups/dogcat.md" },
    { title: "GamingServer", url: "writeups/gamingserver.md" },
    { title: "Jump", url: "writeups/jump.md" },
    { title: "Mr Robot", url: "writeups/mr-robot.md" },
    { title: "Mustacchio", url: "writeups/mustacchio.md" },
    { title: "Operation Promotion", url: "writeups/operation-promotion.md" },
    { title: "Overpass", url: "writeups/overpass.md" },
    { title: "Overpass 3 - Hosting", url: "writeups/overpass-3-hosting.md" },
    { title: "Pickle Rick", url: "writeups/pickle-rick.md" },
    { title: "Road", url: "writeups/road.md" },
    { title: "Silver Platter", url: "writeups/silver-platter.md" },
    { title: "Support", url: "writeups/support.md" },
    { title: "The Blob Blog", url: "writeups/the-blob-blog.md" },
    { title: "The Marketplace", url: "writeups/the-marketplace.md" },
    { title: "Tomghost", url: "writeups/tomghost.md" },
    { title: "TryHeartMe", url: "writeups/tryheartme.md" },
    { title: "Watcher", url: "writeups/watcher.md" },
    { title: "Windows Jump", url: "writeups/windows-jump.md" }
  ];

  let currentIndex = 0;
  let countdown = 8;
  let timerInterval = null;
  let isScrambling = false;
  const chars = "!<>-_\\/[]{}—=+*^?#________";

  function fastScramble(element, finalText, onComplete) {
    isScrambling = true;
    let frame = 0;
    const totalFrames = 8;
    const interval = setInterval(() => {
      frame++;
      element.innerText = finalText
        .split("")
        .map((ch, i) => (i < frame ? ch : chars[Math.floor(Math.random() * chars.length)]))
        .join("");

      if (frame >= totalFrames) {
        clearInterval(interval);
        element.innerText = finalText;
        isScrambling = false;
        if (onComplete) onComplete();
      }
    }, 20);
  }

  function startCountdown() {
    if (timerInterval) clearInterval(timerInterval);
    countdown = 8;
    updateTimerText();

    timerInterval = setInterval(() => {
      if (isScrambling) return;
      countdown--;
      updateTimerText();
      if (countdown <= 0) {
        pickNextTarget();
      }
    }, 1000);
  }

  function updateTimerText() {
    const timerEl = document.getElementById("random-timer");
    if (timerEl) {
      timerEl.innerText = `prossimo tra ${countdown}s...`;
    }
  }

  function pickNextTarget() {
    const linkEl = document.getElementById("random-box-link");
    if (!linkEl) return;

    if (timerInterval) clearInterval(timerInterval);

    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * writeups.length);
    } while (nextIndex === currentIndex && writeups.length > 1);

    currentIndex = nextIndex;
    const target = writeups[currentIndex];

    fastScramble(linkEl, target.title, () => {
      linkEl.href = target.url;
      startCountdown();
    });
  }

  window.triggerManualReroll = function() {
    if (isScrambling) return;
    pickNextTarget();
  };

  // Avvio al caricamento della pagina: sincronizza indice iniziale e avvia timer
  const initialLink = document.getElementById("random-box-link");
  if (initialLink) {
    const found = writeups.findIndex(w => w.title === initialLink.innerText.trim());
    if (found !== -1) currentIndex = found;
  }
  setTimeout(startCountdown, 300);
})();
</script>

---

## Archivio Completo

Per visualizzare la lista completa e accedere a tutti i report disponibili:

👉 **[Apri l'Indice Generale dei Writeup](writeups/index.md)**
