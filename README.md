# Massey Ferguson MF 6S.180 Dyna-VT – Umfrage Website

Einfache, mobiloptimierte Umfrage-Website für die Ausstellung – inklusive **Gewinnspiel**.
Kostenlos über **GitHub Pages** veröffentlichbar. **Kein Backend / kein Server nötig:**
Die Antworten werden direkt im Browser gespeichert und über einen passwortgeschützten
**Admin-Bereich** als **Excel (.xlsx)** oder CSV exportiert.

---

## ⚠️ Wichtig: So funktioniert die Datenspeicherung

Da es kein Backend gibt, werden alle Antworten **lokal im Browser des Geräts** gespeichert,
auf dem die Umfrage ausgefüllt wird (Technik: `localStorage`).

| Betriebsart | Funktioniert? |
|---|---|
| **Gemeinsames Gerät am Stand** (Tablet/Laptop), alle füllen dort aus | ✅ Ja – empfohlen |
| Jeder Besucher füllt per QR-Code auf dem **eigenen Handy** aus | ❌ Nein – Daten bleiben verstreut auf den Besucher-Handys |

**Empfehlung:** Stellen Sie ein **Tablet oder einen Laptop** am Ausstellungsstand bereit,
auf dem die Umfrage geöffnet ist. Alle Teilnehmer füllen am selben Gerät aus. Am Ende
exportieren Sie auf genau diesem Gerät das Excel über die Admin-Seite.

> Der QR-Code ist trotzdem praktisch: Damit öffnen Sie die Umfrage schnell auf dem
> Stand-Tablet, oder Sie zeigen die Startseite her. Für die zentrale Auswertung muss aber
> auf **einem** Gerät ausgefüllt werden.

---

## Projektstruktur

```
mf-survey/
├── index.html          ← Startseite
├── survey.html         ← Umfrageformular
├── thanks.html         ← Danke-Seite
├── qr.html             ← QR-Code Generator
├── admin.html          ← Admin-Bereich: Excel-/CSV-Export
├── css/style.css       ← Alle Stile
├── js/
│   ├── config.js       ← Einstellungen (Passwort, Spalten)
│   ├── app.js          ← Formular-Logik (speichert lokal)
│   └── admin.js        ← Admin-/Export-Logik
└── images/
    └── hero.jpg        ← Ihr Hintergrundbild (selbst hinzufügen)
```

---

## Schritt 1 – Hintergrundbild hinzufügen

1. Bereiten Sie ein Foto des MF 6S.180 vor (Querformat, mind. 1920×1080 px empfohlen).
2. Benennen Sie die Datei **`hero.jpg`**.
3. Kopieren Sie die Datei in den Ordner `images/`.

> Das Bild erscheint auf der Startseite und im QR-Code-Bereich.

---

## Schritt 2 – Admin-Passwort festlegen (optional, empfohlen)

Öffnen Sie `js/config.js` und ändern Sie das Passwort für die Admin-Seite:

```javascript
const ADMIN_PASSWORT = 'mf2026';   // <-- bitte ändern!
```

> Hinweis: Dies ist ein einfacher Schutz im Browser (keine serverseitige Sicherheit).
> Er verhindert, dass jemand am Stand versehentlich die Admin-Seite öffnet oder Daten löscht.
> Die Admin-Seite ist nur über die direkte URL `.../admin.html` erreichbar und für
> Suchmaschinen gesperrt (`noindex`).

---

## Schritt 3 – Auf GitHub veröffentlichen

### 3a) GitHub Repository erstellen

1. Öffnen Sie [github.com](https://github.com) und erstellen Sie ein **neues Repository**.
2. Name: `mf-umfrage` (oder beliebig)
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
6. Nach ca. 2 Minuten ist die Website erreichbar:
   ```
   https://IHR-BENUTZERNAME.github.io/mf-umfrage/
   ```

---

## Schritt 4 – QR-Code erstellen

1. Öffnen Sie `qr.html` in einem Browser (lokal oder auf GitHub Pages).
2. Geben Sie Ihre GitHub-Pages-URL ein:
   `https://IHR-BENUTZERNAME.github.io/mf-umfrage/`
3. Klicken Sie auf **Generieren**.
4. Laden Sie den QR-Code als PNG herunter oder drucken Sie ihn direkt aus.

> **Empfehlung:** Drucken Sie den QR-Code mindestens in A5-Grösse, damit er gut scannbar ist.

---

## Schritt 5 – Auswertung: Excel exportieren

1. Öffnen Sie auf dem **Stand-Gerät** (auf dem ausgefüllt wurde) die Seite `admin.html`,
   z. B. `https://IHR-NAME.github.io/mf-umfrage/admin.html`.
2. Geben Sie das Admin-Passwort ein.
3. Sie sehen alle Antworten in einer Tabelle. Klicken Sie auf **Excel (.xlsx)** oder
   **CSV exportieren** – die Datei wird heruntergeladen.
4. Mit **Alle löschen** können Sie nach dem Export die Daten für die nächste Veranstaltung
   zurücksetzen (vorher unbedingt exportieren!).

---

## Lokale Vorschau

Öffnen Sie `index.html` direkt im Browser – alles funktioniert ohne Server.

Für eine saubere lokale Vorschau mit einem einfachen HTTP-Server:
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
| Backend | Keines – läuft vollständig im Browser |
| Datenspeicherung | `localStorage` (auf dem ausfüllenden Gerät) |
| Excel-Export | SheetJS (xlsx) im Browser, Admin-Seite |
| QR-Code | qrcode.js (CDN) |
| Schrift | Inter (Google Fonts) |
| Kompatibilität | Alle modernen Browser, iOS Safari, Android Chrome |

---

## Häufige Probleme

**Auf der Admin-Seite werden keine Antworten angezeigt:**
→ Antworten werden nur auf dem **Gerät** gespeichert, auf dem ausgefüllt wurde.
   Öffnen Sie die Admin-Seite auf genau diesem Gerät (und im selben Browser).
→ Im privaten/Inkognito-Modus wird `localStorage` beim Schliessen gelöscht – nicht verwenden.

**Das Hintergrundbild wird nicht angezeigt:**
→ Stellen Sie sicher, dass die Datei exakt `images/hero.jpg` heisst.

**GitHub Pages zeigt eine 404-Seite:**
→ Warten Sie 2–3 Minuten nach dem Aktivieren von GitHub Pages.
→ Stellen Sie sicher, dass `index.html` im Root-Verzeichnis liegt.
