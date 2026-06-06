// ============================================================
//  Admin-Seite – lädt alle Antworten aus Supabase (zentral)
//  und exportiert sie als Excel (.xlsx) oder CSV.
//
//  Das Passwort wird serverseitig in der Datenbank geprüft
//  (Funktion export_antworten in supabase-setup.sql).
// ============================================================

let currentRows = [];     // Array von Antwort-Objekten aus Supabase
let currentPw   = '';     // zuletzt verwendetes Passwort (für Refresh/Löschen)
let chartInstances = [];  // aktive Chart.js-Diagramme (zum Aufräumen)

// Fragen mit fester Antwort-Reihenfolge für die Diagramme
const STAT_FRAGEN = [
  { key:'traktor', titel:'Probe gefahrener Traktor', multi:false,
    optionen:['MF 4710','MF 6S.180 Dyna-VT'] },
  { key:'frage1', titel:'Frage 1: Übersichtlichkeit Bedienelemente', multi:false,
    optionen:['Sehr gut','Gut','Mittel','Schlecht','Sehr schlecht'] },
  { key:'frage2', titel:'Frage 2: Vertrautheit mit Bedienung', multi:false,
    optionen:['Sofort','Nach kurzer Einweisung','Eher schwierig','Sehr schwierig'] },
  { key:'frage3', titel:'Frage 3: Handling tägliche Arbeiten', multi:false,
    optionen:['Sehr einfach','Einfach','Durchschnittlich','Eher kompliziert','Sehr kompliziert'] },
  { key:'frage4', titel:'Frage 4: Übersicht aus Kabine', multi:false,
    optionen:['Sehr zufrieden','Zufrieden','Neutral','Unzufrieden','Sehr unzufrieden'] },
  { key:'frage5', titel:'Frage 5: Gefühle (Mehrfachauswahl)', multi:true,
    optionen:['Stolz','Vertrauen','Freude','Gleichgültigkeit','Unsicherheit','Frust'] },
  { key:'frage6', titel:'Frage 6: Welchen MF gerne probefahren', multi:false,
    optionen:['5M Serie','5S Serie','6S Serie','7S Serie','Andere'] },
];

// Farbpalette (MF-Stil: Rot-Töne, Grau, Schwarz)
const CHART_COLORS = [
  '#C8102E','#E8384F','#F2849A','#1A1A1A','#737373',
  '#D0D0D0','#9E0B24','#FF8FA3','#404040','#FBCAD3'
];

const loginCard   = document.getElementById('loginCard');
const dataCard    = document.getElementById('dataCard');
const tokenInput  = document.getElementById('tokenInput');
const loginBtn    = document.getElementById('loginBtn');
const loginError  = document.getElementById('loginError');
const statusLine  = document.getElementById('statusLine');
const tableWrap   = document.getElementById('tableWrap');
const countBadge  = document.getElementById('countBadge');

// ── Supabase-RPC aufrufen ─────────────────────────────────────
async function rpc(fnName, pw) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fnName, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pw: pw }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body && body.message) ? body.message : ('Fehler ' + res.status);
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ── Antwort-Objekt → Tabellenzeile ────────────────────────────
function toRow(a) {
  const ts = a.erstellt_am ? new Date(a.erstellt_am).toLocaleString('de-CH') : '';
  return [
    ts,
    a.vorname || '',
    a.nachname || '',
    a.telefon || '',
    a.email || '',
    a.traktor || '',
    a.frage1 || '',
    a.frage2 || '',
    a.frage3 || '',
    a.frage4 || '',
    a.frage5 || '',
    a.frage5_andere || '',
    a.frage6 || '',
    a.frage6_andere || '',
    a.bemerkungen || '',
  ];
}

// ── Login + Daten laden ───────────────────────────────────────
async function login() {
  const pw = tokenInput.value.trim();
  loginError.textContent = '';

  if (!pw) { loginError.textContent = 'Bitte Passwort eingeben.'; return; }

  if (!isBackendConfigured()) {
    loginError.textContent = 'Backend nicht konfiguriert (SUPABASE_URL / KEY in js/config.js fehlen).';
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Lädt…';

  try {
    const rows = await rpc('export_antworten', pw);
    currentPw = pw;
    currentRows = Array.isArray(rows) ? rows : [];
    sessionStorage.setItem('mf_admin_pw', pw);
    zeigeDaten();
  } catch (err) {
    // Datenbank wirft bei falschem Passwort eine Exception (Status 400)
    if (/passwort/i.test(err.message)) {
      loginError.textContent = 'Falsches Passwort.';
    } else {
      loginError.textContent = 'Fehler beim Laden: ' + err.message;
    }
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Anmelden';
  }
}

// ── Daten anzeigen ────────────────────────────────────────────
function zeigeDaten() {
  loginCard.classList.add('hidden');
  dataCard.classList.remove('hidden');

  const count = currentRows.length;
  countBadge.textContent = count + (count === 1 ? ' Antwort' : ' Antworten');
  statusLine.textContent = count === 0
    ? 'Noch keine Umfrage-Antworten vorhanden.'
    : 'Geladen am ' + new Date().toLocaleString('de-CH');

  // Auswertung / Diagramme aktualisieren
  renderStatistik();

  if (count === 0) { tableWrap.innerHTML = ''; return; }

  let html = '<table class="data-table"><thead><tr>';
  EXPORT_HEADERS.forEach(h => { html += '<th>' + escapeHtml(h) + '</th>'; });
  html += '</tr></thead><tbody>';
  currentRows.forEach(a => {
    html += '<tr>';
    toRow(a).forEach(cell => { html += '<td>' + escapeHtml(cell) + '</td>'; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  tableWrap.innerHTML = html;
}

function escapeHtml(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Auswertung / Kreisdiagramme ───────────────────────────────
function renderStatistik() {
  const total = currentRows.length;
  const totalEl = document.getElementById('statTotal');
  if (totalEl) totalEl.textContent = total;

  const grid = document.getElementById('chartsGrid');
  if (!grid) return;

  // Alte Diagramme aufräumen
  chartInstances.forEach(c => c.destroy());
  chartInstances = [];
  grid.innerHTML = '';

  if (total === 0) {
    grid.innerHTML = '<p class="charts-empty">Sobald Antworten vorliegen, erscheinen hier die Diagramme.</p>';
    return;
  }

  STAT_FRAGEN.forEach(frage => {
    // Antworten zählen
    const counts = {};
    frage.optionen.forEach(o => { counts[o] = 0; });

    currentRows.forEach(row => {
      const raw = row[frage.key];
      if (!raw) return;
      const werte = frage.multi
        ? String(raw).split(',').map(s => s.trim()).filter(Boolean)
        : [String(raw).trim()];
      werte.forEach(w => {
        if (counts[w] === undefined) counts[w] = 0; // unerwartete Werte trotzdem zeigen
        counts[w]++;
      });
    });

    // Nur Optionen mit mind. 1 Nennung ins Diagramm
    const labels = Object.keys(counts).filter(k => counts[k] > 0);
    const data   = labels.map(l => counts[l]);
    const summe  = data.reduce((a, b) => a + b, 0);

    // Box bauen
    const box = document.createElement('div');
    box.className = 'chart-box';
    const h3 = document.createElement('h3');
    h3.textContent = frage.titel;
    box.appendChild(h3);

    if (summe === 0) {
      const p = document.createElement('p');
      p.className = 'chart-noanswer';
      p.textContent = 'Keine Antworten.';
      box.appendChild(p);
      grid.appendChild(box);
      return;
    }

    const canvas = document.createElement('canvas');
    box.appendChild(canvas);
    grid.appendChild(box);

    const chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12 }, padding: 10, boxWidth: 14 },
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const v = ctx.parsed;
                const pct = Math.round((v / summe) * 100);
                return ' ' + ctx.label + ': ' + v + ' (' + pct + '%)';
              },
            },
          },
        },
      },
    });
    chartInstances.push(chart);
  });
}

// ── Aktualisieren ─────────────────────────────────────────────
async function refresh() {
  if (!currentPw) return;
  statusLine.textContent = 'Aktualisiere…';
  try {
    const rows = await rpc('export_antworten', currentPw);
    currentRows = Array.isArray(rows) ? rows : [];
    zeigeDaten();
  } catch (err) {
    statusLine.textContent = 'Fehler: ' + err.message;
  }
}

// ── Excel-Export (.xlsx) ──────────────────────────────────────
function exportXlsx() {
  if (currentRows.length === 0) { alert('Keine Daten zum Exportieren.'); return; }

  const aoa = [EXPORT_HEADERS, ...currentRows.map(toRow)];
  const ws  = XLSX.utils.aoa_to_sheet(aoa);

  ws['!cols'] = EXPORT_HEADERS.map((h, i) => {
    let max = String(h).length;
    aoa.slice(1).forEach(r => {
      const len = r[i] ? String(r[i]).length : 0;
      if (len > max) max = len;
    });
    return { wch: Math.min(max + 2, 50) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Umfrage');
  XLSX.writeFile(wb, 'mf-umfrage_' + dateStamp() + '.xlsx');
}

// ── CSV-Export ────────────────────────────────────────────────
function exportCsv() {
  if (currentRows.length === 0) { alert('Keine Daten zum Exportieren.'); return; }

  const esc = v => {
    const s = (v === null || v === undefined) ? '' : String(v);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [EXPORT_HEADERS.map(esc).join(';')];
  currentRows.forEach(a => { lines.push(toRow(a).map(esc).join(';')); });

  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'mf-umfrage_' + dateStamp() + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

function dateStamp() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// ── Alle Antworten löschen (passwortgeprüft in der DB) ────────
async function alleLoeschen() {
  if (currentRows.length === 0) { alert('Es sind keine Antworten vorhanden.'); return; }
  const ok = confirm(
    'Wirklich ALLE ' + currentRows.length + ' Antworten aus der Datenbank löschen?\n\n' +
    'Exportieren Sie vorher das Excel! Dieser Vorgang kann nicht rückgängig gemacht werden.'
  );
  if (!ok) return;

  try {
    await rpc('delete_antworten', currentPw);
    await refresh();
    alert('Alle Antworten wurden gelöscht.');
  } catch (err) {
    alert('Löschen fehlgeschlagen: ' + err.message);
  }
}

function logout() {
  sessionStorage.removeItem('mf_admin_pw');
  currentPw = '';
  currentRows = [];
  tokenInput.value = '';
  dataCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
}

// ── Event-Listener ────────────────────────────────────────────
loginBtn.addEventListener('click', login);
tokenInput.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
document.getElementById('btnXlsx').addEventListener('click', exportXlsx);
document.getElementById('btnCsv').addEventListener('click', exportCsv);
document.getElementById('btnRefresh').addEventListener('click', refresh);
document.getElementById('btnClear').addEventListener('click', alleLoeschen);
document.getElementById('btnLogout').addEventListener('click', logout);

// Auto-Login, falls Passwort in dieser Session vorhanden
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('mf_admin_pw');
  if (saved) { tokenInput.value = saved; login(); }
});
