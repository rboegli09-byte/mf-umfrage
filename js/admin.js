// ============================================================
//  Admin-Seite – zeigt alle lokal gespeicherten Umfrage-
//  Antworten und exportiert sie als Excel (.xlsx) oder CSV.
//
//  Kein Backend nötig: Daten kommen aus localStorage
//  (Schlüssel STORAGE_KEY aus js/config.js).
// ============================================================

let currentRows = []; // Array von Antwort-Objekten

const loginCard   = document.getElementById('loginCard');
const dataCard    = document.getElementById('dataCard');
const tokenInput  = document.getElementById('tokenInput');
const loginBtn    = document.getElementById('loginBtn');
const loginError  = document.getElementById('loginError');
const statusLine  = document.getElementById('statusLine');
const tableWrap   = document.getElementById('tableWrap');
const countBadge  = document.getElementById('countBadge');

// ── Antworten aus localStorage lesen ──────────────────────────
function ladeAntworten() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

// ── Ein Antwort-Objekt in eine Tabellenzeile umwandeln ────────
function toRow(a) {
  const ts = a.timestamp ? new Date(a.timestamp) : null;
  const tsText = ts ? ts.toLocaleString('de-CH') : '';
  const gefuehle = Array.isArray(a.frage5) ? a.frage5.join(', ') : (a.frage5 || '');
  return [
    tsText,
    a.vorname || '',
    a.nachname || '',
    a.telefon || '',
    a.email || '',
    a.frage1 || '',
    a.frage2 || '',
    a.frage3 || '',
    a.frage4 || '',
    gefuehle,
    a.frage5_andere || '',
    a.bemerkungen || '',
  ];
}

// ── Login (einfacher Passwortschutz im Browser) ───────────────
function login() {
  const pw = tokenInput.value.trim();
  loginError.textContent = '';

  if (!pw) {
    loginError.textContent = 'Bitte Passwort eingeben.';
    return;
  }
  if (pw !== ADMIN_PASSWORT) {
    loginError.textContent = 'Falsches Passwort.';
    return;
  }

  sessionStorage.setItem('mf_admin_ok', '1');
  zeigeDaten();
}

// ── Daten anzeigen ────────────────────────────────────────────
function zeigeDaten() {
  loginCard.classList.add('hidden');
  dataCard.classList.remove('hidden');

  currentRows = ladeAntworten();
  const count = currentRows.length;

  countBadge.textContent = count + (count === 1 ? ' Antwort' : ' Antworten');
  statusLine.textContent = count === 0
    ? 'Noch keine Umfrage-Antworten auf diesem Gerät gespeichert.'
    : 'Stand: ' + new Date().toLocaleString('de-CH');

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

// ── Excel-Export (.xlsx) ──────────────────────────────────────
function exportXlsx() {
  if (currentRows.length === 0) { alert('Keine Daten zum Exportieren.'); return; }

  const aoa = [EXPORT_HEADERS, ...currentRows.map(toRow)];
  const ws  = XLSX.utils.aoa_to_sheet(aoa);

  // Spaltenbreiten automatisch
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

  // BOM für korrekte Umlaute in Excel
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

// ── Alle Antworten löschen ────────────────────────────────────
function alleLoeschen() {
  if (currentRows.length === 0) { alert('Es sind keine Antworten vorhanden.'); return; }
  const ok = confirm(
    'Wirklich ALLE ' + currentRows.length + ' Antworten auf diesem Gerät löschen?\n\n' +
    'Exportieren Sie vorher das Excel! Dieser Vorgang kann nicht rückgängig gemacht werden.'
  );
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  zeigeDaten();
}

function logout() {
  sessionStorage.removeItem('mf_admin_ok');
  tokenInput.value = '';
  dataCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
}

// ── Event-Listener ────────────────────────────────────────────
loginBtn.addEventListener('click', login);
tokenInput.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
document.getElementById('btnXlsx').addEventListener('click', exportXlsx);
document.getElementById('btnCsv').addEventListener('click', exportCsv);
document.getElementById('btnRefresh').addEventListener('click', zeigeDaten);
document.getElementById('btnClear').addEventListener('click', alleLoeschen);
document.getElementById('btnLogout').addEventListener('click', logout);

// Bereits in dieser Session angemeldet?
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('mf_admin_ok') === '1') zeigeDaten();
});
