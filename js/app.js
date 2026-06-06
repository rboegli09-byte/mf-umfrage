// ============================================================
//  MF 6S.180 Umfrage – Formular-Logik
//  Hinweis: APPS_SCRIPT_URL wird in js/config.js gesetzt
//  (config.js muss vor app.js geladen werden).
// ============================================================

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

// ── Frage 6 "Andere"-Textfeld ein-/ausblenden ───────────────
const frage6AndereText = document.getElementById('frage6-andere-text');
document.querySelectorAll('input[name="frage6"]').forEach(r => {
  r.addEventListener('change', () => {
    const show = r.checked && r.value === 'Andere';
    if (frage6AndereText) {
      frage6AndereText.classList.toggle('hidden', !show);
      if (show) frage6AndereText.focus();
    }
  });
});
if (frage6AndereText) {
  frage6AndereText.addEventListener('input', () => clearError('err-frage6'));
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

  // Probefahrt-Traktor (Pflicht)
  if (!document.querySelector('input[name="traktor"]:checked')) {
    showError('err-traktor', 'Bitte wählen Sie den probegefahrenen Traktor.');
    ok = false;
  }

  // Landwirt (Pflicht)
  if (!document.querySelector('input[name="landwirt"]:checked')) {
    showError('err-landwirt', 'Bitte beantworten Sie diese Frage.');
    ok = false;
  }

  // Anschaffung (Pflicht)
  if (!document.querySelector('input[name="anschaffung"]:checked')) {
    showError('err-anschaffung', 'Bitte wählen Sie einen Zeitpunkt.');
    ok = false;
  }

  // Radio-Fragen
  const radioFragen = ['frage1','frage2','frage3','frage4'];
  radioFragen.forEach(name => {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      showError('err-' + name, 'Bitte beantworten Sie diese Frage.');
      ok = false;
    }
  });

  // Frage 5 (mind. eine Checkbox)
  const f5 = document.querySelectorAll('input[name="frage5"]:checked');
  if (f5.length === 0) {
    showError('err-frage5', 'Bitte wählen Sie mindestens eine Option.');
    ok = false;
  }

  // Frage 6 (Pflicht, Einfachauswahl)
  const f6 = document.querySelector('input[name="frage6"]:checked');
  if (!f6) {
    showError('err-frage6', 'Bitte beantworten Sie diese Frage.');
    ok = false;
  } else if (f6.value === 'Andere' && !frage6AndereText.value.trim()) {
    showError('err-frage6', 'Bitte geben Sie an, welchen MF Sie gerne probefahren würden.');
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
    traktor:      radio('traktor'),
    landwirt:     radio('landwirt'),
    anschaffung:  radio('anschaffung'),
    frage1:       radio('frage1'),
    frage2:       radio('frage2'),
    frage3:       radio('frage3'),
    frage4:       radio('frage4'),
    frage5:       frage5Values.filter(v => v !== 'Andere'),
    frage5_andere: (cbAndere && cbAndere.checked) ? andereText.value.trim() : '',
    frage6:       radio('frage6'),
    frage6_andere: (radio('frage6') === 'Andere' && frage6AndereText) ? frage6AndereText.value.trim() : '',
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

    if (!isBackendConfigured()) {
      setLoading(false);
      alert('Die Umfrage ist noch nicht mit der Datenbank verbunden.\n\n'
        + 'Bitte SUPABASE_URL und SUPABASE_ANON_KEY in js/config.js eintragen (siehe README).');
      return;
    }

    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/' + TABLE_NAME, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          erstellt_am:   data.timestamp,
          vorname:       data.vorname,
          nachname:      data.nachname,
          telefon:       data.telefon,
          email:         data.email,
          traktor:       data.traktor,
          landwirt:      data.landwirt,
          anschaffung:   data.anschaffung,
          frage1:        data.frage1,
          frage2:        data.frage2,
          frage3:        data.frage3,
          frage4:        data.frage4,
          frage5:        (data.frage5 || []).join(', '),
          frage5_andere: data.frage5_andere,
          frage6:        data.frage6,
          frage6_andere: data.frage6_andere,
          bemerkungen:   data.bemerkungen,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        // E-Mail bereits verwendet (Unique-Verletzung)
        if (res.status === 409 || txt.includes('23505') || /duplicate key|unique/i.test(txt)) {
          setLoading(false);
          const emailEl = document.getElementById('email');
          emailEl.classList.add('is-error');
          showError('err-email',
            'Diese E-Mail-Adresse wurde bereits verwendet. Pro Person ist nur eine Teilnahme möglich.');
          document.getElementById('err-email').scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        throw new Error('Server-Antwort ' + res.status + ' ' + txt);
      }

      window.location.href = 'thanks.html';
    } catch (err) {
      setLoading(false);
      alert('Die Antwort konnte nicht gesendet werden.\n\n'
        + 'Bitte prüfen Sie die Internetverbindung und versuchen Sie es erneut.\n\n'
        + '(' + err.message + ')');
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
