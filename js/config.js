// ============================================================
//  Zentrale Konfiguration
// ============================================================
//
//  Diese Umfrage funktioniert OHNE Backend/Server.
//  Alle Antworten werden lokal im Browser gespeichert
//  (localStorage) und können auf der Admin-Seite als Excel
//  oder CSV exportiert werden.
//
//  WICHTIG: Die Daten liegen nur auf dem GERÄT, auf dem die
//  Umfrage ausgefüllt wird. Betreiben Sie die Umfrage daher
//  an einem gemeinsamen Gerät (Tablet/Laptop am Stand).
//
// ============================================================

// Schlüssel, unter dem die Antworten im Browser gespeichert werden
const STORAGE_KEY = 'mf_umfrage_antworten';

// Einfaches Passwort für die Admin-Seite (admin.html).
// Bitte ändern. Hinweis: Dies ist ein einfacher Schutz im
// Browser, keine serverseitige Sicherheit.
const ADMIN_PASSWORT = 'mf2026';

// Spaltentitel für den Excel-/CSV-Export (Reihenfolge = Spalten)
const EXPORT_HEADERS = [
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
