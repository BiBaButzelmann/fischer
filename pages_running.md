# pages that are required till 31.08

## mandatory

### Admin

#### Spieler verwalten

- Gruppen einteilen nach Spieltag und DWZ, A und B Gruppe nach Spieltag und Elo
- bevorzugter Spieltag und sekundärer Spieltag anzeigen
- Paarungen generieren
- Hinweis: Personen ohne Elo können nicht A oder B spielen
- Spieler deaktivieren
- Verlegungen manuell eintragen können
- Email an Spieler senden, sobald die Paarungen final sind

#### Aufbauhelfer verwalten

- Funktioniert erst, wenn die Gruppen erstellt worden sind
- Aufbauhelfer per Drag und Drop auf die Tage aufteilen
- vorsortiert nach bevorzugter Spieltag
- Wenn Aufbauhelfer spielt, dieser Spieltag präferiert
- Alternativtage werden angezeigt
- Email versenden, sobald final

#### Eingabehelfer verwalten

- Funktioniert erst, wenn die Gruppen erstellt worden sind
- Eingabehelfer einer oder mehrerer Gruppen zuweisen
- anzeigen, in welcher Gruppe der Eingabehelfer spielt
- anzeigen, wie viele Gruppen der Helfer eingeben möchte

#### Schiedsrichter verwalten

- Funktioniert erst, wenn die Gruppen erstellt worden sind
- Schiedsrichter den Spieltagen zuordnen, darf nicht eigene Gruppe
- Anzeigen der primären und sekundären Spieltage

#### Turniergericht verwalten

- einteilen in aktive Juroren (genau 3) und Nachrücker (genau 2)
- Hinweis: Schiedsrichter dürfen keine Juroren sein

#### Elo-Bericht generieren

- Auswahl des Turniers, Gruppe und Monat (nur A- und B-Gruppe!)
- Ausgabe der .txt Datei im vorgegebenen Format
- tatsächliches Datum zählt

#### Dzw-Bericht generieren

- Auswahl des Turniers
- Am Ende des Turniers gibt es einen DWZ Bericht für alle Gruppen

### authed

#### Spieler

- Erinnerung an ausstehende Ergebnismeldungen

#### Aufbauhelfer

- Übersicht der Paarungen mit Brettnummer zum Aufbauen der Bretter (auch Verschiebungen)
- Disclaimer: bei Verhinderung bitte an Turnierleitung melden, immer!

#### Eingabehelfer

- Übersicht der einzugebenen Gruppen
- Übersicht der ausstehenden Spiele: Partie nicht pgn
- Vorauswahl der Ausgabe und Gruppe, sortiert nach Datum
- visual cue für bereits eingegeben Partien
- visual cue für Partien in der Vergangenheit / Zukunft

#### Schiedsrichter

- Möglichkeit der Partienergebnismeldung für alle Gruppen
- Übersicht der ausstehenden Ergebnismeldungen

#### Kalender

- reintroduce to unauthed
- Anzeige der eigenen Termine (Spieler: game, Aufbauhelfer: Spieltag, Schiedsrichter)
- unauthed: Wann spielt welche Gruppe: Spieltag
- Drag and Drop für Verschiebung auf mögliche Timeslots (mit Erklärtext)
- Email Benachrichtung an beide Spieler
- möglich sind: Alle Dienstage, Donnerstage, Freitage außer Feiertage

#### uebersicht

- TBD: einzelne Elemente der Seiten anzeigen

#### partien

- so lassen wie es ist, und dann neue Views für:

- default spieler: Auswahl der eigenen Gruppe
- default Aufbauhelfer: Auswahl des Spieltages mit Verschiebungen
- default Eingabehelfer: Auswahl der eigenen Gruppe, sortiert nach Datum
- default Schiedsrichter: Auswahl des Spieltages mit Verschiebungen

### unauthed

#### ergebnisse

- Gruppenbestenlisten nach Vorbild chessresults

## optional

### Admin

#### Spieler verwalten

- Telefonnummer anzeigen für Rückfragen klären o. Ä.
- Spieler, die nicht bezahlt haben, anzeigen -> Email senden nach x Tagen

#### Aufbauhelfer verwalten

- Telefonnummer anzeigen für Rückfragen klären o. Ä.

#### Eingabehelfer verwalten

- Telefonnummer anzeigen für Rückfragen klären o. Ä.

#### Schiedsrichter verwalten

- Telefonnummer anzeigen für Rückfragen klären o. Ä.

#### Turniergericht verwalten

- Telefonnummer anzeigen für Rückfragen klären o. Ä.
- Drag and Drop

### authed

#### Spieler

- Übersicht der Termine als Tabelle
- Ausstehende Überweisung des Startgelds

#### Aufbauhelfer

- Übersicht aller zugeteilten Spieltage (Anreise ca. 30min vor Start)
- auch als Spieler angemeldet und Termin verschoben: Rückfrage nach Aufbau

#### Eingabehelfer

- Möglichkeit der Vertretung wegen Krankheit

#### Schiedsrichter

- Übersicht aller zugeteilten Spieltage
- "ich kann nicht kommen" auswählbar

#### Turniergericht

- Übersicht der offenen Streitigkeiten
- danke, dass du so ein geiler Atze bist

#### partien/id

- Ergänzung einer Seitenleiste der Züge
- Ergänzung einer lightweight Engine (stockfish 16)

### unauthed

#### bestenliste

- Migration der Tabelle letzte Jahre
- Hall of Fame
