-- Custom SQL migration file, put your code below! --

-- Data migration: "½" im PGN-Bestand durch das standardkonforme "1/2" ersetzen.
-- Einige PGNs aus 2025 tragen "½-½" im Result-Tag und als Ergebnis-Token. Das ist
-- kein gültiges PGN; sie ließen sich bisher nur laden, weil der Client vor jedem
-- loadPgn "½" ersetzt hat. Diese Toleranz entfällt, deshalb wird der Bestand hier
-- einmalig bereinigt. Idempotent: nach dem Lauf enthält keine Zeile mehr "½".

UPDATE "pgn"
SET "value" = replace("value", '½', '1/2')
WHERE "value" LIKE '%½%';
