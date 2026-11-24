-- Datenbereinigung: Keine Wertung ist NULL, nicht 0. Bisher speicherte das
-- Anmeldeformular ein geleertes Wertungsfeld als 0, und 0 diente als Behelf für
-- Spieler mit FIDE-ID ohne Elo im FIDE-Bericht. Läuft vor den CHECK-Constraints,
-- sonst schlägt ADD CONSTRAINT an diesen Zeilen fehl. Idempotent.
UPDATE "participant" SET "fide_rating" = NULL WHERE "fide_rating" <= 0;
--> statement-breakpoint
UPDATE "participant" SET "dwz_rating" = NULL WHERE "dwz_rating" <= 0;
--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_dwz_rating_positive" CHECK ("participant"."dwz_rating" > 0);--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_fide_rating_positive" CHECK ("participant"."fide_rating" > 0);
