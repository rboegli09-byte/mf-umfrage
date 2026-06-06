-- ============================================================
--  Supabase-Setup für die MF 6S.180 Umfrage
--  ------------------------------------------------------------
--  Einmalig ausführen:
--  Supabase → Ihr Projekt → SQL Editor → "New query" →
--  diesen gesamten Inhalt einfügen → "Run".
--
--  WICHTIG: Ändern Sie das Passwort unten ('mf2026') auf ein
--  eigenes. Es schützt den Excel-Export auf der Admin-Seite.
-- ============================================================

-- 1) Tabelle für die Antworten
create table if not exists public.antworten (
  id            bigint generated always as identity primary key,
  erstellt_am   timestamptz not null default now(),
  vorname       text,
  nachname      text,
  telefon       text,
  email         text,
  traktor       text,   -- Welchen Traktor Probe gefahren
  landwirt      text,   -- Bist du Landwirt? (Ja/Nein)
  anschaffung   text,   -- Geplante Anschaffung (2026/2027/2028/später/unentschlossen)
  frage1        text,
  frage2        text,
  frage3        text,
  frage4        text,
  frage5        text,   -- Mehrfachauswahl, kommasepariert
  frage5_andere text,
  frage6        text,   -- Welchen MF gerne probefahren
  frage6_andere text,   -- Freitext bei "Andere"
  bemerkungen   text
);

-- 2) Row Level Security aktivieren
alter table public.antworten enable row level security;

-- 3) Rechte zurücksetzen: niemand darf direkt lesen
revoke all on table public.antworten from anon, authenticated;

-- 4) Jeder (anonym) darf eine Antwort EINFÜGEN (Umfrage absenden)
grant insert on table public.antworten to anon;

drop policy if exists "umfrage_insert" on public.antworten;
create policy "umfrage_insert"
  on public.antworten
  for insert
  to anon
  with check (true);

-- 5) Passwortgeschützter Export (liest alle Antworten)
--    SECURITY DEFINER = umgeht RLS, prüft aber zuerst das Passwort.
create or replace function public.export_antworten(pw text)
returns setof public.antworten
language plpgsql
security definer
set search_path = public
as $$
begin
  if pw <> 'mf2026' then          -- <<< HIER PASSWORT ÄNDERN
    raise exception 'Falsches Passwort';
  end if;
  return query select * from public.antworten order by erstellt_am;
end;
$$;

grant execute on function public.export_antworten(text) to anon;

-- 6) Passwortgeschütztes Löschen aller Antworten (für Reset nach dem Event)
create or replace function public.delete_antworten(pw text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if pw <> 'mf2026' then          -- <<< HIER GLEICHES PASSWORT
    raise exception 'Falsches Passwort';
  end if;
  delete from public.antworten where id is not null;  -- WHERE nötig (Supabase-Schutz)
end;
$$;

grant execute on function public.delete_antworten(text) to anon;

-- Fertig. Die Umfrage kann jetzt Antworten speichern,
-- der Export funktioniert nur mit dem Passwort.
