# pages: wer darf was?

## uebersicht

### unauthed

#### Anmeldephase

- Body

1. Willkommen, Gast!
2. Bis zum Ende der Anmeldephase sind es noch x Tage (evtl. mit grafischer Darstellung)
3. Guideline "Wie melde ich mich zum Turnier an?" (nice to have)

- Sidebar

1. partien
2. kalendar
3. Bestenlisten (nice to have)

- footer

1. Formular (nice to have)
2. Ansprechpersonen mit Kontaktdaten (Turnierleitung)

#### Turnierphase

- Body

1. Willkommen, Gast!
2. Text für Turniernachmeldung mit Warteliste:
   -> Nachrückerlogik (nice to have)

- Sidebar

1. partien
2. kalendar
3. Bestenlisten (nice to have)

- footer

1. Formular (nice to have)
2. Ansprechpersonen mit Kontaktdaten

#### kein Turnier

- Body

1. Willkommen, Gast!
2. Bestenliste erscheint auf homepage (nice to have)

- Sidebar

1. partien
2. Bestenlisten (nice to have)

- footer

1. Formular (nice to have)
2. Ansprechpersonen mit Kontaktdaten

### authed

#### Anmeldephase

- body

1. Willkommen, Name
2. Das Turnier beginnt in x Tagen

- sidebar

1. partien
2. kalendar
3. bestenliste (nice to have)
4. rollen bearbeiten
5. Turnierordnung
6. Profileinstellungen

- footer

1. Formular (nice to have)
2. Ansprechpersonen mit Kontaktdaten
3. Datenschutzerklärung

#### Turnierphase

- body

1. Willkommen, Name
2. Dies sind deine nächsten Termine: x y z am xten Tag
3. Das ist der aktuelle Stand in deiner Gruppe:
4. Für jede Rolle werden diverse Elemente geladen:
   1. Eingabehelfer: Folgende Eingaben stehen aus
   2. Schiedsrichter und Admin: folgende Ergebnismeldungen stehen aus
   3. Spieler: folgende Spiele sind verschoben:
   4. Juror: folgende Konflikte müssen geklärt werden: (nice to have)

- sidebar

1. partien
2. kalendar
3. bestenliste (nice to have)
4. Turnierordnung
5. Profileinstellungen

- footer

1. Formular (nice to have)
2. Ansprechpersonen mit Kontaktdaten
3. Datenschutzerklärung

## partien und partien/[partieId]

### unauthed

- keinen Zugriff auf partien/[partieId]

#### Anmeldephase

- vergangene Paarungen und Ergebnisse

#### Turnierphase

- vergange + aktuelle Paarungen und Ergebnisse

#### kein-Turnier

- vergange Paarungen und Ergebnisse

### authed

- unauthed Rechte und zusätzlich:

1. alle PGNs sehen (PW-geschützt)
2. eigene PGNs bearbeiten:

- Spieler darf eigene Spiele bearbeiten
- Eingabehelfer darf eigene Gruppe(n) bearbeiten

-> für diese zwei Rollen fällt die PW-Abfrage weg

## kalendar

### unauthed

- Termine alle Gruppen (nach Gruppen gruppierte Ansicht)
  -> Link auf tagesansicht mit vorausgewählten Datum
- keine Verschieberechte o. Ä.

#### authed

- Rechte wie unauthed und zusätzlich:

1. Partien verschieben: die Spieler selbst, Schiedsrichter, Admins
2. persönliche Termine: Termine für Aufbauhelfer, Spieler, Schiedsrichter

## tagesansicht
