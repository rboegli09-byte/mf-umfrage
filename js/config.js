// ============================================================
//  Zentrale Konfiguration
// ============================================================
//
//  Die Antworten werden zentral in einer Supabase-Datenbank
//  gesammelt (kostenlos). So können Besucher die Umfrage auf
//  ihrem EIGENEN Handy ausfüllen und alle Antworten laufen an
//  einer Stelle zusammen.
//
//  EINRICHTUNG (einmalig, siehe README.md → Schritt 2):
//  1. Gratis-Projekt auf supabase.com erstellen.
//  2. Den Inhalt von supabase-setup.sql im SQL-Editor ausführen.
//  3. Unten die beiden Werte eintragen:
//       - SUPABASE_URL       (Project URL)
//       - SUPABASE_ANON_KEY  (anon / publishable key)
//
// ============================================================

const SUPABASE_URL      = 'https://xknknlsppivsnkaszzjm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_k19y9WoReu0Upxg5SahkQw_FRPK-h4t';

// Name der Tabelle (muss mit supabase-setup.sql übereinstimmen)
const TABLE_NAME = 'antworten';

// Spaltentitel für den Excel-/CSV-Export (Reihenfolge = Spalten)
const EXPORT_HEADERS = [
  'Zeitstempel',
  'Vorname',
  'Nachname',
  'Telefon',
  'E-Mail',
  'Frage 1: Probe gefahrener Traktor',
  'Frage 2: Übersichtlichkeit Bedienelemente',
  'Frage 3: Vertrautheit mit Bedienung',
  'Frage 4: Handling tägliche Arbeiten',
  'Frage 5: Übersicht aus Kabine',
  'Frage 6: Gefühle (Auswahl)',
  'Frage 6: Gefühle (Andere)',
  'Frage 7: Welchen MF gerne probefahren',
  'Frage 7: Andere (Freitext)',
  'Frage 8: Bist du Landwirt?',
  'Frage 9: Geplante Anschaffung',
  'Weitere Bemerkungen',
];

// Hinweis: Das Admin-Passwort wird NICHT hier gesetzt, sondern
// serverseitig in supabase-setup.sql (Funktion export_antworten).
// So ist es nicht im öffentlichen Quellcode sichtbar.

function isBackendConfigured() {
  return SUPABASE_URL.indexOf('http') === 0
    && SUPABASE_ANON_KEY.indexOf('IHR_') !== 0;
}
