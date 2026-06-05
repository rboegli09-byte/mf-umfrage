# Massey Ferguson MF 6S.180 Dyna-VT – Umfrage Website

Mobiloptimierte Umfrage-Website für die Ausstellung – inklusive **Gewinnspiel**.
Kostenlos über **GitHub Pages** veröffentlichbar. Besucher füllen die Umfrage auf dem
**eigenen Handy** (QR-Code) aus, alle Antworten laufen **zentral** in einer kostenlosen
**Supabase**-Datenbank zusammen. Ein passwortgeschützter **Admin-Bereich** exportiert
alle Antworten als **Excel (.xlsx)** oder CSV.

---

## Projektstruktur

```
mf-survey/
├── index.html            ← Startseite
├── survey.html           ← Umfrageformular
├── thanks.html           ← Danke-Seite
├── qr.html               ← QR-Code Generator
├── admin.html            ← Admin-Bereich: Excel-/CSV-Export
├── supabase-setup.sql    ← EINMALIG in Supabase ausführen
├── css/style.css         ← Alle Stile
├── js/
│   ├── config.js         ← Supabase-URL & Key hier eintragen
│   ├── app.js            ← Formular-Logik (sendet an Supabase)
│   └── admin.js          ← Admin-/Export-Logik
└── images/
    └── hero.jpg          ← Ihr Hintergrundbild (selbst hinzufügen)
```

---

## Schritt 1 – Hintergrundbild hinzufügen

1. Foto des MF 6S.180 vorbereiten (Querformat, mind. 1920×1080 px empfohlen).
2. Datei **`hero.jpg`** nennen.
3. In den Ordner `images/` kopieren.

> Das Bild erscheint auf der Startseite und im QR-Code-Bereich.

---

## Schritt 2 – Datenbank einrichten (Supabase, kostenlos)

Damit alle Handys zentral in dieselbe Datenbank schreiben, brauchen wir einen einfachen
Backend-Dienst. Supabase ist dafür kostenlos und in wenigen Minuten eingerichtet.

### 2a) Projekt erstellen

1. Auf [supabase.com](https://supabase.com) ein kostenloses Konto erstellen / anmelden.
2. **New project** → Name z. B. `mf-umfrage`, Passwort vergeben, Region **Europe** wählen.
3. Warten, bis das Projekt bereit ist (~2 Min).

### 2b) Tabelle & Funktionen anlegen (nur EIN Schritt!)

1. Im Projekt links auf **SQL Editor** → **New query**.
2. Den **gesamten Inhalt** von `supabase-setup.sql` hineinkopieren.
3. **Wichtig:** Im Skript an zwei Stellen das Passwort `mf2026` durch ein eigenes ersetzen
   (es schützt den Excel-Export).
4. Auf **Run** klicken. Fertig – Tabelle, Sicherheitsregeln und Export-Funktion sind angelegt.

### 2c) Zugangsdaten in config.js eintragen

1. Im Projekt links auf **Project Settings → API**.
2. Kopieren Sie:
   - **Project URL** (z. B. `https://abcd1234.supabase.co`)
   - **anon / public** Key (langer Text, beginnt mit `ey…` oder `sb_publishable_…`)
3. Öffnen Sie `js/config.js` und tragen Sie beide Werte ein:
   ```javascript
   const SUPABASE_URL      = 'https://abcd1234.supabase.co';
   const SUPABASE_ANON_KEY = 'IHR_ANON_KEY';
   ```

> Der anon-Key darf öffentlich sein. Dank der Sicherheitsregeln kann damit nur **eingefügt**
> werden – die Antworten **lesen/exportieren** geht ausschliesslich mit Ihrem Passwort
> (serverseitig in der Datenbank geprüft).

---

## Schritt 3 – Auf GitHub veröffentlichen

### 3a) Repository

1. Auf [github.com](https://github.com) ein **neues Repository** erstellen.
2. Name: `mf-umfrage` · Sichtbarkeit: **Public** (für kostenlose GitHub Pages).

### 3b) Dateien hochladen

**GitHub Desktop (empfohlen):** Repository klonen, Dateien hineinkopieren, committen & pushen.
**Oder Web-Upload:** **Add file → Upload files**, alle Dateien (mit Ordnerstruktur) hochladen,
**Commit changes**.

### 3c) GitHub Pages aktivieren

1. Repository → **Settings → Pages**.
2. **Source:** Deploy from a branch · Branch **main** · Ordner **/ (root)** · **Save**.
3. Nach ~2 Min erreichbar unter:
   ```
   https://IHR-BENUTZERNAME.github.io/mf-umfrage/
   ```

---

## Schritt 4 – QR-Code erstellen

1. `qr.html` im Browser öffnen.
2. GitHub-Pages-URL eingeben: `https://IHR-BENUTZERNAME.github.io/mf-umfrage/`
3. **Generieren** → QR-Code als PNG herunterladen oder direkt drucken.

> **Empfehlung:** QR-Code mindestens in A5-Grösse drucken, damit er gut scannbar ist.
> Besucher scannen ihn mit dem Handy und füllen die Umfrage selbst aus.

---

## Schritt 5 – Auswertung: Excel exportieren

1. `admin.html` öffnen (z. B. `https://IHR-NAME.github.io/mf-umfrage/admin.html`).
2. Admin-Passwort eingeben (das aus `supabase-setup.sql`).
3. Alle Antworten erscheinen in einer Tabelle.
4. **Excel (.xlsx)** oder **CSV exportieren** klicken – die Datei wird heruntergeladen.
5. Mit **Alle löschen** können Sie nach dem Event die Daten zurücksetzen
   (vorher unbedingt exportieren!).

---

## Lokale Vorschau

```bash
# Python 3
python -m http.server 8080
# dann: http://localhost:8080
```

> Zum echten Senden/Exportieren müssen die Supabase-Zugangsdaten in `js/config.js`
> eingetragen sein.

---

## Technische Details

| Feature | Lösung |
|---|---|
| Hosting | GitHub Pages (kostenlos) |
| Datenbank | Supabase (PostgreSQL, Free Tier) |
| Senden | REST-Insert mit anon-Key (nur INSERT erlaubt) |
| Export | Passwortgeschützte DB-Funktion + SheetJS (.xlsx) im Browser |
| Sicherheit | Row Level Security; Lesen nur per Passwort (serverseitig) |
| QR-Code | qrcode.js (CDN) |
| Schrift | Inter (Google Fonts) |
| Kompatibilität | Alle modernen Browser, iOS Safari, Android Chrome |

---

## Häufige Probleme

**Die Umfrage meldet „konnte nicht gesendet werden":**
→ Sind `SUPABASE_URL` und `SUPABASE_ANON_KEY` in `js/config.js` korrekt eingetragen?
→ Wurde `supabase-setup.sql` im SQL-Editor ausgeführt?
→ Besteht eine Internetverbindung?

**Admin-Login sagt „Falsches Passwort":**
→ Das Passwort muss mit dem in `supabase-setup.sql` gesetzten übereinstimmen.
   Nach einer Änderung das SQL erneut ausführen (die Funktionen werden ersetzt).

**Das Hintergrundbild wird nicht angezeigt:**
→ Datei muss exakt `images/hero.jpg` heissen.

**GitHub Pages zeigt 404:**
→ 2–3 Min nach Aktivierung warten; `index.html` muss im Root liegen.
