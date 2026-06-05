// ============================================================
//  MF 6S.180 Umfrage – Formular-Logik
//  Konfiguration: APPS_SCRIPT_URL unten eintragen
// ============================================================

const APPS_SCRIPT_URL = 'IHRE_GOOGLE_APPS_SCRIPT_URL_HIER_EINTRAGEN';

// ── Radio-Buttons: visuelle Auswahl ──────────────────────────
document.querySelectorAll('.radio-group').forEach(group => {
  group.querySelectorAll('.radio-option').forEach(option => {
    const input = option.querySelector('input[type="radio"]');
    input.addEventListener('change', () => {
      group.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      // Fehler wegräumen sobald eine Auswahl getroffen
      const errId = 'err-' + input.name;
      clearError(errId);
    });
  });
});

// ── Checkboxen: visuelle Auswahl ─────────────────────────────
document.querySelectorAll('.checkbox-group .checkbox-item').forEach(item => {
  const input = item.querySelector('input[type="checkbox"]');
  input.addEventListener('change', () => {
    item.classList.toggle('selected', input.checked);
    clearError('err-frage5');
  });
});

// ── "Andere"-Textfeld ein-/ausblenden ────────────────────────
const cbAndere   = document.getElementById('cb-andere');
const andereText = document.getElementById('andere-text');
const itemAndere = document.getElementById('item-andere');

if (cbAndere) {
  cbAndere.addEventListener('change', () => {
    itemAndere.classList.toggle('selected', cbAndere.checked);
    andereText.classList.toggle('hidden', !cbAndere.checked);
    if (cbAndere.checked) andereText.focus();
  });
}

// ── DSGVO-Checkbox ───────────────────────────────────────────
const dsgvoInput = document.getElementById('dsgvo');
const dsgvoItem  = document.getElementById('dsgvo-item');

if (dsgvoInput) {
  dsgvoInput.addEventListener('change', () => {
    dsgvoItem.classList.toggle('checked', dsgvoInput.checked);
    clearError('err-dsgvo');
  });
}

// ── Text-Inputs: Fehler bei Eingabe wegräumen ─────────────────
['vorname','nachname','telefon','email'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => {
    el.classList.remove('is-error');
    clearError('err-' + id);
  });
});

// ── Validierung ───────────────────────────────────────────────
function validate() {
  let ok = true;

  // Pflichtfelder Text
  const fields = [
    { id: 'vorname',  msg: 'Bitte geben Sie Ihren Vornamen ein.' },
    { id: 'nachname', msg: 'Bitte geben Sie Ihren Nachnamen ein.' },
    { id: 'telefon',  msg: 'Bitte geben Sie Ihre Telefonnummer ein.' },
    { id: 'email',    msg: 'Bitte geben Sie Ihre E-Mail-Adresse ein.' },
  ];

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el.value.trim()) {
      showError('err-' + f.id, f.msg);
      el.classList.add('is-error');
      ok = false;
    }
  });

  // E-Mail-Format
  const emailEl = document.getElementById('email');
  if (emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
    showError('err-email', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    emailEl.classList.add('is-error');
    ok = false;
  }

  // Radio-Fragen
  const radioFragen = ['frage1','frage2','frage3','frage4'];
  radioFragen.forEach((name, i) => {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      showError('err-' + name, `Bitte beantworten Sie Frage ${i + 1}.`);
      ok = false;
    }
  });

  // Frage 5 (mind. eine Checkbox)
  const f5 = document.querySelectorAll('input[name="frage5"]:checked');
  if (f5.length === 0) {
    showError('err-frage5', 'Bitte wählen Sie mindestens eine Option.');
    ok = false;
  }

  // DSGVO
  if (!dsgvoInput.checked) {
    showError('err-dsgvo', 'Bitte stimmen Sie der Datenschutzerklärung zu.');
    ok = false;
  }

  return ok;
}

// ── Formulardaten sammeln ─────────────────────────────────────
function collectData() {
  const radio = name => {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  };

  const frage5Values = Array.from(
    document.querySelectorAll('input[name="frage5"]:checked')
  ).map(el => el.value);

  return {
    vorname:      document.getElementById('vorname').value.trim(),
    nachname:     document.getElementById('nachname').value.trim(),
    telefon:      document.getElementById('telefon').value.trim(),
    email:        document.getElementById('email').value.trim(),
    frage1:       radio('frage1'),
    frage2:       radio('frage2'),
    frage3:       radio('frage3'),
    frage4:       radio('frage4'),
    frage5:       frage5Values.filter(v => v !== 'Andere'),
    frage5_andere: (cbAndere && cbAndere.checked) ? andereText.value.trim() : '',
    bemerkungen:  document.getElementById('bemerkungen').value.trim(),
    timestamp:    new Date().toISOString(),
  };
}

// ── Formular absenden ─────────────────────────────────────────
const form       = document.getElementById('surveyForm');
const submitBtn  = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitLoader = document.getElementById('submitLoader');
const submitIcon = document.getElementById('submitIcon');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) {
      // Zum ersten Fehler scrollen
      const firstErr = document.querySelector('.field-error:not(:empty)');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    const data = collectData();

    try {
      if (APPS_SCRIPT_URL === 'IHRE_GOOGLE_APPS_SCRIPT_URL_HIER_EINTRAGEN') {
        // Fallback: nur lokale Bestätigung (kein Backend konfiguriert)
        console.warn('Apps Script URL nicht konfiguriert – Daten werden nur lokal angezeigt.');
        console.table(data);
        await new Promise(r => setTimeout(r, 800)); // kurze Demo-Pause
      } else {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Google Apps Script benötigt no-cors
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      window.location.href = 'thanks.html';
    } catch (err) {
      setLoading(false);
      alert('Fehler beim Senden. Bitte versuchen Sie es erneut.\n\n' + err.message);
    }
  });
}

// ── Hilfsfunktionen ───────────────────────────────────────────
function setLoading(on) {
  submitBtn.disabled = on;
  submitText.textContent = on ? 'Wird gesendet…' : 'Umfrage absenden';
  submitLoader.classList.toggle('hidden', !on);
  submitIcon.classList.toggle('hidden', on);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}
