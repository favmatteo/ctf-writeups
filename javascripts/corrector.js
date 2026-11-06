/**
 * corrector.js - Sistema automatico di correzione ortografica e censura flag
 * CTF Writeups // Matteo Favaro
 *
 * 1. Censura automatica preventiva delle flag (THM{...}, FLAG{...}, HTB{...})
 * 2. Correzione ortografica automatica dei refusi frequenti (italiano & terminologia cybersecurity)
 * 3. Pulsante a fine pagina per ripristinare il testo originale o riapplicare le correzioni
 */

(function () {
  "use strict";

  // Dizionario di correzione ortografica (chiave in minuscolo -> valore corretto)
  const DICTIONARY = {
    // Termini cybersecurity & privilege escalation
    "privelage": "privilege",
    "priveleage": "privilege",
    "privileage": "privilege",
    "escaltion": "escalation",
    "esclation": "escalation",
    "vulernabile": "vulnerabile",
    "vulernabili": "vulnerabili",
    "vulnerabbile": "vulnerabile",
    "esegubile": "eseguibile",
    "esegubili": "eseguibili",
    "posisamo": "possiamo",
    "posiamo": "possiamo",
    "corrrettamente": "correttamente",
    "corettamente": "correttamente",
    "ispezioanndo": "ispezionando",
    "ispezioando": "ispezionando",
    "analiziamo": "analizziamo",
    "agigungere": "aggiungere",
    "aggingere": "aggiungere",
    "correzzione": "correzione",
    "correzzioni": "correzioni",
    "autenticazzione": "autenticazione",
    "autenticazzioni": "autenticazioni",
    "configurazzione": "configurazione",
    "configurazzioni": "configurazioni",
    "informazzione": "informazione",
    "informazzioni": "informazioni",
    "eseguizzione": "esecuzione",
    "eseguizzioni": "esecuzioni",
    "inizilizzazione": "inizializzazione",
    "inizializzazzione": "inizializzazione",
    "reconnassaince": "reconnaissance",
    "ricongnizione": "ricognizione",
    "ricongnizioni": "ricognizioni",
    "intressante": "interessante",
    "intressanti": "interessanti",
    "raggiungibbile": "raggiungibile",
    "raggiungibbili": "raggiungibili",

    // Accenti e parole comuni della lingua italiana
    "vulnerabilita": "vulnerabilità",
    "funzionalita": "funzionalità",
    "proprieta": "proprietà",
    "possibilita": "possibilità",
    "attivita": "attività",
    "perche": "perché",
    "poiche": "poiché",
    "affinche": "affinché",
    "qualchecosa": "qualcosa",
    "qualcunaltro": "qualcun altro",
    "daccordo": "d'accordo"
  };

  // Funzione che rispetta la capitalizzazione originale
  function matchCase(original, target) {
    if (original === original.toUpperCase()) {
      return target.toUpperCase();
    }
    if (original[0] === original[0].toUpperCase()) {
      return target.charAt(0).toUpperCase() + target.slice(1);
    }
    return target.toLowerCase();
  }

  // Censura automatica di emergenza per qualsiasi flag raw trovata nel DOM
  function autoCensorFlags(root) {
    const flagPattern = /\b(THM|thm|FLAG|flag|HTB|htb)\{([A-Za-z0-9_\-\.\$]{4,})\}/g;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (tag === "script" || tag === "style" || tag === "textarea") {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodesToReplace = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (flagPattern.test(node.nodeValue)) {
        nodesToReplace.push(node);
      }
      flagPattern.lastIndex = 0;
    }

    nodesToReplace.forEach(node => {
      node.nodeValue = node.nodeValue.replace(flagPattern, (match, prefix, content) => {
        // Se è già asteriscata non toccarla
        if (/^\*+$/.test(content)) return match;
        return `${prefix}{********************************}`;
      });
    });
  }

  // Correzione ortografica sui nodi di testo escludendo codice e script
  function autoSpellcheck(root) {
    // Regex dinamica per trovare tutte le parole del dizionario
    const keys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);
    const regex = new RegExp(`\\b(${keys.join("|")})\\b`, "gi");

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          // NON toccare codice, comandi o script per preservare integrità tecnica
          if (
            tag === "code" ||
            tag === "pre" ||
            tag === "script" ||
            tag === "style" ||
            tag === "textarea" ||
            tag === "svg" ||
            parent.closest("pre") ||
            parent.closest("code") ||
            parent.closest(".terminal-card") ||
            parent.closest(".terminal-spell-card")
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const matchedNodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (regex.test(node.nodeValue)) {
        matchedNodes.push(node);
      }
      regex.lastIndex = 0;
    }

    let totalCorrections = 0;

    matchedNodes.forEach(node => {
      const text = node.nodeValue;
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      regex.lastIndex = 0;
      while ((match = regex.exec(text)) !== null) {
        const raw = match[0];
        const lowerKey = raw.toLowerCase();
        const replacement = matchCase(raw, DICTIONARY[lowerKey]);

        // Aggiunge il testo prima del match
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
        }

        // Crea span con testo corretto e metadati per il ripristino
        const span = document.createElement("span");
        span.className = "spell-fix";
        span.dataset.original = raw;
        span.dataset.corrected = replacement;
        span.title = `Testo originale: "${raw}" (corretto automaticamente)`;
        span.textContent = replacement;
        frag.appendChild(span);

        totalCorrections++;
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.substring(lastIndex)));
      }

      if (node.parentNode) {
        node.parentNode.replaceChild(frag, node);
      }
    });

    return totalCorrections;
  }

  // Iniezione widget a fondo pagina con pulsante di ripristino
  function renderSpellWidget(container, count) {
    // Rimuove eventuale widget precedente se presente
    const oldWidget = container.querySelector(".terminal-spell-card");
    if (oldWidget) oldWidget.remove();

    if (count === 0) return;

    const widget = document.createElement("div");
    widget.className = "terminal-spell-card";
    widget.innerHTML = `
      <div class="terminal-spell-bar">
        <span class="spell-dot green"></span>
        <span class="spell-title">spellcheck-daemon // autocorrect</span>
        <span class="spell-badge" id="spell-status-badge">${count} correzioni applicate</span>
      </div>
      <div class="terminal-spell-content">
        <div class="spell-desc">
          ✨ <strong>Correzione ortografica automatica attiva</strong>: ${count} refuso/i o imperfezioni sono stati corretti automaticamente nel testo.
        </div>
        <div class="spell-action-row">
          <button class="spell-restore-btn" id="spell-toggle-btn" type="button">
            <span class="btn-icon">↺</span> <span class="btn-label">Ripristina versione originale</span>
          </button>
          <span class="spell-hint">Passa il cursore sulle parole con sottolineatura verde per vedere il testo originario.</span>
        </div>
      </div>
    `;

    container.appendChild(widget);

    let isOriginalMode = false;
    const toggleBtn = widget.querySelector("#spell-toggle-btn");
    const badge = widget.querySelector("#spell-status-badge");

    toggleBtn.addEventListener("click", () => {
      isOriginalMode = !isOriginalMode;
      const allSpans = container.querySelectorAll(".spell-fix");

      if (isOriginalMode) {
        allSpans.forEach(el => {
          el.textContent = el.dataset.original;
          el.classList.add("spell-fix--restored");
          el.title = `Testo originale non corretto (clicca sotto per ripristinare la correzione)`;
        });
        toggleBtn.innerHTML = `<span class="btn-icon">✓</span> <span class="btn-label">Riapplica correzioni automatiche</span>`;
        badge.textContent = "versione originale attiva";
        badge.classList.add("spell-badge--warn");
      } else {
        allSpans.forEach(el => {
          el.textContent = el.dataset.corrected;
          el.classList.remove("spell-fix--restored");
          el.title = `Testo originale: "${el.dataset.original}" (corretto automaticamente)`;
        });
        toggleBtn.innerHTML = `<span class="btn-icon">↺</span> <span class="btn-label">Ripristina versione originale</span>`;
        badge.textContent = `${count} correzioni applicate`;
        badge.classList.remove("spell-badge--warn");
      }
    });
  }

  // Esecuzione principale
  function initPageCorrections() {
    const article = document.querySelector(".md-content article") || document.querySelector(".md-content");
    if (!article) return;

    // 1. Censura automatica di sicurezza
    autoCensorFlags(article);

    // 2. Correzione ortografica
    const count = autoSpellcheck(article);

    // 3. Widget e pulsante di ripristino a fine pagina
    renderSpellWidget(article, count);
  }

  // Supporto sia al caricamento iniziale sia a navigation.instant di MkDocs Material
  if (typeof document$ !== "undefined") {
    document$.subscribe(initPageCorrections);
  } else {
    document.addEventListener("DOMContentLoaded", initPageCorrections);
  }

  // Funzione globale per filtrare in tempo reale la tabella dell'indice
  window.filterMachines = function () {
    const input = document.getElementById("machine-filter-input");
    if (!input) return;
    const query = input.value.toLowerCase().trim();
    const table = document.querySelector(".md-typeset table");
    if (!table) return;
    const rows = table.querySelectorAll("tbody tr");
    let matchCount = 0;

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      if (!query || text.includes(query)) {
        row.style.display = "";
        matchCount++;
      } else {
        row.style.display = "none";
      }
    });

    const countEl = document.getElementById("machine-filter-count");
    if (countEl) {
      countEl.innerText = query ? `${matchCount} di ${rows.length} trovate` : `${rows.length} macchine`;
    }
  };
})();
