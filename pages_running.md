# pages that are required till 31.08

## Admin

### Spieler verwalten

- Telefonnummer anzeigen für Rückfragen klären o. Ä.
- Gruppen einteilen nach Spieltag und DWZ, A und B Gruppe nach Spieltag und Elo
- bevorzugter Spieltag und sekundärer Spieltag anzeigen
- Paarungen generieren
- Hinweis: Personen ohne Elo können nicht A oder B spielen
- Spieler deaktivieren
- Verlegungen manuell eintragen können
- Email an Spieler senden, sobald die Paarungen final sind
- Spieler, die nicht bezahlt haben, anzeigen -> Email senden nach x Tagen

### Aufbauhelfer verwalten

- Telefonnummer anzeigen für Rückfragen klären o. Ä.
- Aufbauhelfer per Drag und Drop auf die Tage aufteilen
- vorsortiert nach bevorzugter Spieltag
- Alternativtage werden angezeigt
- Email versenden

### Eingabehelfer verwalten

- Telefonnummer anzeigen für Rückfragen klären o. Ä.
- Eingabehelfer einer oder mehrerer Gruppen zuweisen
- anzeigen, in welcher Gruppe der Eingabehelfer spielt
- anzeigen, wie viele Gruppen der Helfer eingeben möchte

### Schiedsrichter verwalten

- Telefonnummer anzeigen für Rückfragen klären o. Ä.
- Schiedsrichter den Spieltagen zuordnen
- Anzeigen der primären und sekundären Spieltage

### Turniergericht verwalten

- Telefonnummer anzeigen für Rückfragen klären o. Ä.
- einteilen in aktive Juroren (genau 3) und Nachrücker (genau 2)
- Hinweis: Schiedsrichter dürfen keine Juroren sein

### Elo-Bericht generieren

- Auswahl des Turniers, Gruppe und Monat (nur A- und B-Gruppe!)
- Ausgabe der .txt Datei im vorgegebenen Format

### Dzw-Bericht generieren

- Auswahl des Turniers

## authed

### Spieler

- Übersicht eigener Regeltermine
- Übersicht der Verschiebungen
- Ausstehende Überweisung des Startgelds
- Erinnerung an ausstehende Ergebnismeldungen

### Aufbauhelfer

- Übersicht aller zugeteilten Spieltage (Anreise ca. 30min vor Start)
- Übersicht der Paarungen mit Brettnummer zum Aufbauen der Bretter (auch Verschiebungen)
- Option: "ich kann nicht kommen" auswählbar
- wenn auch als Spieler angemeldet und Termin verschoben: Rückfrage nach Aufbau

### Eingabehelfer

- Übersicht der einzugebenen Gruppen
- Übersicht der ausstehenden Gruppen
- Link auf Partien: Vorauswahl der Ausgabe und Gruppe, sortiert nach Datum
- ggf. Möglichkeit der Vertretung wegen Krankheit

### Schiedsrichter

- Übersicht aller zugeteilten Spieltage
- Jeder Spieltag verlinkt auf die Partienseite zur Eingabe der Ergebnisse
- Erinnerung an ausstehende Ergebnismeldungen
- Option: "ich kann nicht kommen" auswählbar

### Turniergericht

- Übersicht der offenen Streitigkeiten

### Kalender

- Anzeige der eigenen Termine (Spieler, Aufbauhelfer, Schiedsrichter)
- Drag and Drop für Verschiebung auf mögliche Timeslots (mit Erklärtext)

### uebersicht

- TBD: einzelne Elemente der Seiten anzeigen

### partien/id

- Ergänzung einer Seitenleiste der Züge
- Ergänzung einer lightweight Engine (stockfish 16)

### partien

- visual cue für bereits eingegeben Partien
- visual cue für Partien in der Vergangenheit / Zukunft

- default spieler: Auswahl der eigenen Gruppe
- default Aufbauhelfer: Auswahl des Spieltages mit Verschiebungen
- default Eingabehelfer: Auswahl der eigenen Gruppe, sortiert nach Datum
- default Schiedsrichter: Auswahl des Spieltages mit Verschiebungen

## unauthed

### bestenliste

- nice-to-have: Migration der Tabelle letzte Jahre
- Gruppenbestenlisten nach Vorbild chessresults
- nice-to-have: Hall of Fame
- authed: Bestenliste der eigenen Gruppe
