// ============================================================
//  Google Apps Script – MF 6S.180 Umfrage Backend
//
//  Setup:
//  1. Neue Google-Tabelle erstellen
//  2. Erweiterungen → Apps Script → diesen Code einfügen
//  3. SPREADSHEET_ID unten eintragen (aus der Tabellen-URL)
//  4. Bereitstellen → Neue Bereitstellung → Web-App
//     - Ausführen als: Ich (mein Google-Konto)
//     - Zugriff:       Jeder
//  5. Die Web-App-URL in js/app.js bei APPS_SCRIPT_URL eintragen
// ============================================================

const SPREADSHEET_ID = 'IHRE_GOOGLE_TABELLEN_ID_HIER';
const EMAIL_EMPFAENGER = 'urs.boegli@odermatt-lm.ch';

// Passwort für die Admin-Seite (admin.html). Bitte ändern!
// Dieses Passwort wird auf der Admin-Seite eingegeben, um alle
// Antworten abzurufen und als Excel zu exportieren.
const ADMIN_TOKEN = 'mf2026';

// Spaltentitel (wird automatisch in Zeile 1 geschrieben)
const HEADERS = [
  'Zeitstempel',
  'Vorname',
  'Nachname',
  'Telefon',
  'E-Mail',
  'Frage 1: Übersichtlichkeit Bedienelemente',
  'Frage 2: Vertrautheit mit Bedienung',
  'Frage 3: Handling tägliche Arbeiten',
  'Frage 4: Übersicht aus Kabine',
  'Frage 5: Gefühle (Auswahl)',
  'Frage 5: Gefühle (Andere)',
  'Weitere Bemerkungen',
];

// ============================================================
//  doGet – liefert alle Antworten als JSONP an die Admin-Seite
//  Aufruf: ...?action=export&token=PASSWORT&callback=fnName
// ============================================================
function doGet(e) {
  const params   = (e && e.parameter) ? e.parameter : {};
  const callback = params.callback || 'callback';

  // Antwort als JSONP verpacken (umgeht CORS-Beschränkungen)
  const reply = obj =>
    ContentService
      .createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  // Token prüfen
  if (params.token !== ADMIN_TOKEN) {
    return reply({ success: false, error: 'Ungültiges Passwort.' });
  }

  if (params.action === 'export') {
    try {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();

      if (lastRow < 1) {
        return reply({ success: true, headers: HEADERS, rows: [] });
      }

      const values  = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = values[0];
      const rows    = values.slice(1);

      return reply({ success: true, headers: headers, rows: rows });
    } catch (err) {
      return reply({ success: false, error: err.toString() });
    }
  }

  return reply({ success: false, error: 'Unbekannte Aktion.' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Google Tabelle öffnen
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getActiveSheet();

    // Kopfzeile schreiben falls Tabelle leer
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#C8102E')
        .setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    // Zeitstempel lesbar formatieren
    const ts = new Date(data.timestamp || Date.now());
    const tsFormatted = Utilities.formatDate(ts, 'Europe/Zurich', 'dd.MM.yyyy HH:mm:ss');

    // Datenzeile einfügen
    const gefuehle = (data.frage5 || []).join(', ');
    sheet.appendRow([
      tsFormatted,
      data.vorname      || '',
      data.nachname     || '',
      data.telefon      || '',
      data.email        || '',
      data.frage1       || '',
      data.frage2       || '',
      data.frage3       || '',
      data.frage4       || '',
      gefuehle,
      data.frage5_andere || '',
      data.bemerkungen  || '',
    ]);

    // Spaltenbreite automatisch anpassen
    sheet.autoResizeColumns(1, HEADERS.length);

    // E-Mail-Benachrichtigung senden
    const emailText = `
Neue Umfrage-Antwort – Massey Ferguson MF 6S.180 Dyna-VT
==========================================================

KONTAKTDATEN
  Vorname:   ${data.vorname}
  Nachname:  ${data.nachname}
  Telefon:   ${data.telefon}
  E-Mail:    ${data.email}

UMFRAGEANTWORTEN
  1. Übersichtlichkeit Bedienelemente: ${data.frage1}
  2. Vertrautheit mit Bedienung:       ${data.frage2}
  3. Handling tägliche Arbeiten:       ${data.frage3}
  4. Übersicht aus der Kabine:         ${data.frage4}
  5. Gefühle:                          ${gefuehle}${data.frage5_andere ? ' | Andere: ' + data.frage5_andere : ''}

BEMERKUNGEN
  ${data.bemerkungen || '(keine)'}

--
Eingegangen: ${tsFormatted}
    `.trim();

    MailApp.sendEmail({
      to:      EMAIL_EMPFAENGER,
      subject: `MF 6S.180 Umfrage – ${data.vorname} ${data.nachname}`,
      body:    emailText,
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Testfunktion – direkt in Apps Script ausführen zum Testen
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        vorname:      'Max',
        nachname:     'Mustermann',
        telefon:      '+41 79 123 45 67',
        email:        'max@beispiel.ch',
        frage1:       'Sehr gut',
        frage2:       'Sofort',
        frage3:       'Einfach',
        frage4:       'Zufrieden',
        frage5:       ['Freude', 'Vertrauen'],
        frage5_andere: '',
        bemerkungen:  'Tolles Fahrzeug!',
        timestamp:    new Date().toISOString(),
      })
    }
  };
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
