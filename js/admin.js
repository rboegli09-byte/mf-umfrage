// ============================================================
//  Admin-Seite – lädt alle Antworten aus Supabase (zentral)
//  und exportiert sie als Excel (.xlsx) oder CSV.
//
//  Das Passwort wird serverseitig in der Datenbank geprüft
//  (Funktion export_antworten in supabase-setup.sql).
// ============================================================

let currentRows = [];     // Array von Antwort-Objekten aus Supabase
let currentPw   = '';     // zuletzt verwendetes Passwort (für Refresh/Löschen)

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
