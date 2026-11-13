-- Custom SQL migration file, put your code below! --

-- Datenreparatur: Bis hierhin wertete die Deaktivierung nur die Partien der ersten
-- gefundenen Teilnahme kampflos (ohne ORDER BY in der Praxis die des ältesten
-- Turniers). Offene Partien deaktivierter Teilnehmer im aktuellen Turnier blieben
-- deshalb offen. Diese Statements spiegeln computeForfeitResults (src/lib/forfeit.ts)
-- und sind idempotent. Abgeschlossene Turniere bleiben unberührt.

-- Offene Partie, nur Weiß deaktiviert: Schwarz gewinnt kampflos.
UPDATE "game" g
SET "result" = '-:+'
FROM "participant" w, "participant" b, "tournament" t
WHERE g."white_player_id" = w."id"
  AND g."black_player_id" = b."id"
  AND g."tournament_id" = t."id"
  AND t."stage" <> 'done'
  AND g."result" IS NULL
  AND w."deleted_at" IS NOT NULL
  AND b."deleted_at" IS NULL;

-- Offene Partie, nur Schwarz deaktiviert: Weiß gewinnt kampflos.
UPDATE "game" g
SET "result" = '+:-'
FROM "participant" w, "participant" b, "tournament" t
WHERE g."white_player_id" = w."id"
  AND g."black_player_id" = b."id"
  AND g."tournament_id" = t."id"
  AND t."stage" <> 'done'
  AND g."result" IS NULL
  AND w."deleted_at" IS NULL
  AND b."deleted_at" IS NOT NULL;

-- Beide deaktiviert: offene und kampflose Partien werden -:-.
UPDATE "game" g
SET "result" = '-:-'
FROM "participant" w, "participant" b, "tournament" t
WHERE g."white_player_id" = w."id"
  AND g."black_player_id" = b."id"
  AND g."tournament_id" = t."id"
  AND t."stage" <> 'done'
  AND w."deleted_at" IS NOT NULL
  AND b."deleted_at" IS NOT NULL
  AND (g."result" IS NULL OR g."result" IN ('+:-', '-:+'));

-- Die Deaktivierung ist ab jetzt turnierbezogen; das Profil selbst bleibt aktiv.
UPDATE "profile" SET "deleted_at" = NULL;
