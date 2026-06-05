// ============================================================
//  Admin-Seite – lädt alle Umfrage-Antworten und exportiert
//  sie als Excel (.xlsx) oder CSV.
//
//  Datenabruf via JSONP (umgeht CORS bei Google Apps Script).
//  APPS_SCRIPT_URL kommt aus js/config.js.
// ============================================================

let currentData = null; // { headers: [...], rows: [[...], ...] }

const loginCard   = document.getElementById('loginCard');
const dataCard    = document.getElementById('dataCard');
const tokenInput  = document.getElementById('tokenInput');
const loginBtn    = document.getElementById('loginBtn');
const loginError  = document.getElementById('loginError');
const statusLine  = document.getElementById('statusLine');
const tableWrap   = document.getElementById('tableWrap');
const countBadge  = document.getElementById('countBadge');

// ── JSONP-Abruf ───────────────────────────────────────────────
function fetchData(token) {
  return new Promise((resolve, reject) => {
    const cbName = 'mfCallback_' + Date.now();
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Zeitüberschreitung – Verbindung fehlgeschlagen.'));
    }, 20000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[cbName] = data => { cleanup(); resolve(data); };

    const script = document.createElement('script');
    script.src = APPS_SCRIPT_URL
      + '?action=export'
      + '&token=' + encodeURIComponent(token)
      + '&callback=' + cbName;
    script.onerror = () => { cleanup(); reject(new Error('Netzwerkfehler.')); };
    document.body.appendChild(script);
  });
}

// ── Login / Daten laden ───────────────────────────────────────
async function login() {
  const token = tokenInput.value.trim();
  loginError.textContent = '';

  if (!token) {
    loginError.textContent = 'Bitte Passwort eingeben.';
    return;
  }

  if (APPS_SCRIPT_URL === 'IHRE_GOOGLE_APPS_SCRIPT_URL_HIER_EINTRAGEN') {
    loginError.textContent = 'Backend nicht konfiguriert (APPS_SCRIPT_URL in js/config.js fehlt).';
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Lädt…';

  try {
    const res = await fetchData(token);
    if (!res.success) {
      loginError.textContent = res.error || 'Anmeldung fehlgeschlagen.';
      return;
    }
    currentData = res;
    sessionStorage.setItem('mf_admin_token', token);
    showData(res);
  } catch (err) {
    loginError.textContent = err.message;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Anmelden';
  }
}

// ── Daten anzeigen ────────────────────────────────────────────
function showData(data) {
  loginCard.classList.add('hidden');
  dataCard.classList.remove('hidden');

  const count = data.rows.length;
  countBadge.textContent = count + (count === 1 ? ' Antwort' : ' Antworten');
  statusLine.textContent = count === 0
    ? 'Noch keine Umfrage-Antworten vorhanden.'
    : 'Geladen am ' + new Date().toLocaleString('de-CH');

  // Tabelle bauen
  if (count === 0) { tableWrap.innerHTML = ''; return; }

  let html = '<table class="data-table"><thead><tr>';
  data.headers.forEach(h => { html += '<th>' + escapeHtml(h) + '</th>'; });
  html += '</tr></thead><tbody>';
  data.rows.forEach(row => {
    html += '<tr>';
    data.headers.forEach((_, i) => {
      html += '<td>' + escapeHtml(formatCell(row[i])) + '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  tableWrap.innerHTML = html;
}

function formatCell(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Excel-Export (.xlsx) ──────────────────────────────────────
function exportXlsx() {
  if (!currentData || currentData.rows.length === 0) {
    alert('Keine Daten zum Exportieren.');
    return;
  }
  const aoa = [currentData.headers, ...currentData.rows];
  const ws  = XLSX.utils.aoa_to_sheet(aoa);

  // Spaltenbreiten automatisch
  ws['!cols'] = currentData.headers.map((h, i) => {
    let max = String(h).length;
    currentData.rows.forEach(r => {
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
  if (!currentData || currentData.rows.length === 0) {
    alert('Keine Daten zum Exportieren.');
    return;
  }
  const esc = v => {
    const s = (v === null || v === undefined) ? '' : String(v);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [currentData.headers.map(esc).join(';')];
  currentData.rows.forEach(r => {
    lines.push(currentData.headers.map((_, i) => esc(r[i])).join(';'));
  });
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

async function refresh() {
  const token = sessionStorage.getItem('mf_admin_token');
  if (!token) return;
  statusLine.textContent = 'Aktualisiere…';
  try {
    const res = await fetchData(token);
    if (res.success) { currentData = res; showData(res); }
  } catch (err) {
    statusLine.textContent = 'Fehler: ' + err.message;
  }
}

function logout() {
  sessionStorage.removeItem('mf_admin_token');
  currentData = null;
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
document.getElementById('btnLogout').addEventListener('click', logout);

// Auto-Login wenn Token in dieser Session vorhanden
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('mf_admin_token');
  if (saved) { tokenInput.value = saved; login(); }
});
