-- Custom SQL migration file, put your code below! --

-- Data migration: pgn.value speichert ab jetzt nur noch die Zugfolge (Movetext ohne
-- Header und ohne Ergebnis-Token). Die Header sind abgeleitete Daten und werden bei
-- jeder Ausgabe aus den aktuellen Partie-, Teilnehmer- und Turnierdaten erzeugt
-- (src/lib/pgn). Gespeicherte Header waren teils veraltet oder nur Platzhalter ("?").
-- Idempotent: Zeilen ohne Header-Block und ohne Ergebnis-Token bleiben unverändert.

UPDATE "pgn"
SET "value" = btrim(regexp_replace(regexp_replace("value",
  '^(\s*\[[^\n]*\]\s*\n)+', ''),
  '\s*(1-0|0-1|1/2-1/2|\*)\s*$', ''))
WHERE "value" ~ '^\s*\[' OR "value" ~ '(1-0|0-1|1/2-1/2|\*)\s*$';
