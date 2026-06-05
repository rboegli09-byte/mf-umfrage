# Massey Ferguson MF 6S.180 Dyna-VT – Umfrage Website

Einfache, mobiloptimierte Umfrage-Website für die Ausstellung.
Kostenlos über **GitHub Pages** veröffentlichbar, Daten werden in **Google Sheets** gespeichert und per E-Mail zugestellt.

---

## Projektstruktur

```
mf-survey/
├── index.html          ← Startseite
├── survey.html         ← Umfrageformular
├── thanks.html         ← Danke-Seite
├── qr.html             ← QR-Code Generator
├── css/style.css       ← Alle Stile
├── js/app.js           ← Formular-Logik (URL hier eintragen!)
├── images/
│   └── hero.jpg        ← Ihr Hintergrundbild (selbst hinzufügen)
└── backend/
    └── Code.gs         ← Google Apps Script (Backend)
```

---

## Schritt 1 – Hintergrundbild hinzufügen

1. Bereiten Sie ein Foto des MF 6S.180 vor (Querformat, mind. 1920×1080 px empfohlen).
2. Benennen Sie die Datei **`hero.jpg`**.
3. Kopieren Sie die Datei in den Ordner `images/`.

> Das Bild erscheint auf der Startseite, der QR-Code-Seite und als visueller Hintergrund.

---

## Schritt 2 – Google Sheets Backend einrichten

### 2a) Google Tabelle erstellen

1. Öffnen Sie [sheets.google.com](https://sheets.google.com) und erstellen Sie eine neue leere Tabelle.
2. Kopieren Sie die **Tabellen-ID** aus der URL:
   `https://docs.google.com/spreadsheets/d/**HIER_IST_DIE_ID**/edit`

### 2b) Apps Script einrichten

1. Klicken Sie in der Tabelle auf **Erweiterungen → Apps Script**.
2. Löschen Sie den vorhandenen Code und fügen Sie den Inhalt von `backend/Code.gs` ein.
3. Tragen Sie Ihre Tabellen-ID ein:
   ```javascript
   const SPREADSHEET_ID = 'IHRE_GOOGLE_TABELLEN_ID_HIER';
   ```
4. Klicken Sie auf **Speichern** (Disketten-Symbol).

### 2c) Als Web-App bereitstellen

1. Klicken Sie auf **Bereitstellen → Neue Bereitstellung**.
2. Klicken Sie auf das Zahnrad-Symbol und wählen Sie **Web-App**.
3. Einstellungen:
   - **Beschreibung:** MF Umfrage
   - **Ausführen als:** Ich (Ihr Google-Konto)
   - **Zugriff:** Jeder
4. Klicken Sie auf **Bereitstellen** und kopieren Sie die **Web-App-URL**.

### 2d) URL in app.js eintragen

Öffnen Sie `js/app.js` und ersetzen Sie den Platzhalter:

```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/IHRE_URL/exec';
```

### 2e) Backend testen

1. Klicken Sie im Apps Script Editor auf **Ausführen → testDoPost**.
2. Prüfen Sie die Google Tabelle – eine Testzeile sollte erscheinen.
3. Prüfen Sie den E-Mail-Eingang bei `urs.boegli@odermatt-lm.ch`.

### CSV/Excel-Export aus Google Sheets

1. Öffnen Sie Ihre Google Tabelle.
2. Klicken Sie auf **Datei → Herunterladen → Microsoft Excel (.xlsx)** oder **CSV**.

---

## Schritt 3 – Auf GitHub veröffentlichen

### 3a) GitHub Repository erstellen

1. Öffnen Sie [github.com](https://github.com) und erstellen Sie ein **neues Repository**.
2. Name: `mf-survey` (oder beliebig)
3. Sichtbarkeit: **Public** (für kostenlose GitHub Pages)

### 3b) Dateien hochladen

**Option A – GitHub Desktop (empfohlen für Einsteiger):**
1. Laden Sie [GitHub Desktop](https://desktop.github.com/) herunter.
2. Klonen Sie das Repository lokal.
3. Kopieren Sie alle Dateien aus diesem Ordner in das geklonte Verzeichnis.
4. Committen und pushen Sie die Änderungen.

**Option B – GitHub Web-Upload:**
1. Klicken Sie auf **Add file → Upload files**.
2. Laden Sie alle Dateien hoch (Ordnerstruktur beachten).
3. Klicken Sie auf **Commit changes**.

### 3c) GitHub Pages aktivieren

1. Öffnen Sie das Repository auf GitHub.
2. Klicken Sie auf **Settings → Pages**.
3. Unter **Source:** wählen Sie **Deploy from a branch**.
4. Branch: **main**, Ordner: **/ (root)**.
5. Klicken Sie auf **Save**.
6. Nach ca. 2 Minuten ist die Website unter dieser URL erreichbar:
   ```
   https://IHR-BENUTZERNAME.github.io/mf-survey/
   ```

---

## Schritt 4 – QR-Code erstellen

1. Öffnen Sie `qr.html` in einem Browser (lokal oder auf GitHub Pages).
2. Geben Sie Ihre GitHub-Pages-URL ein:
   `https://IHR-BENUTZERNAME.github.io/mf-survey/`
3. Klicken Sie auf **Generieren**.
4. Laden Sie den QR-Code als PNG herunter oder drucken Sie ihn direkt aus.

> **Empfehlung:** Drucken Sie den QR-Code mindestens in A5-Grösse, damit er gut scannbar ist.

---

## Lokale Vorschau

Öffnen Sie `index.html` direkt im Browser – das Formular funktioniert auch ohne Backend (Daten werden nur in der Konsole angezeigt).

Für eine vollständige lokale Vorschau mit einem einfachen HTTP-Server:
```bash
# Python 3
python -m http.server 8080
# dann: http://localhost:8080
```

---

## Technische Details

| Feature | Lösung |
|---|---|
| Hosting | GitHub Pages (kostenlos) |
| Datenspeicherung | Google Sheets + Apps Script |
| E-Mail-Versand | Google Apps Script MailApp |
| CSV/Excel-Export | Google Sheets Download |
| QR-Code | qrcode.js (CDN) |
| Schrift | Inter (Google Fonts) |
| Kompatibilität | Alle modernen Browser, iOS Safari, Android Chrome |

---

## Häufige Probleme

**Das Formular sendet, aber es kommt keine E-Mail an:**
→ Prüfen Sie, ob die Web-App-URL korrekt in `js/app.js` eingetragen ist.
→ Prüfen Sie, ob Google Apps Script die nötigen Berechtigungen hat (beim ersten Bereitstellen).

**Das Hintergrundbild wird nicht angezeigt:**
→ Stellen Sie sicher, dass die Datei exakt `images/hero.jpg` heisst.

**GitHub Pages zeigt eine 404-Seite:**
→ Warten Sie 2–3 Minuten nach dem Aktivieren von GitHub Pages.
→ Stellen Sie sicher, dass `index.html` im Root-Verzeichnis liegt.
