# redirect behavior

- welcome

  - unauthed -> no redirect
  - authed ->
    - tournament is in registration phase ->
      - user is registered (one or more roles) -> uebersicht
      - user is not registered -> anmeldung
    - tournament is not in registration phase -> uebersicht

- anmeldung

  - unauthed -> welcome
  - authed -> no redirect
  - done -> uebersicht

- uebersicht

  - unauthed -> no redirect
  - authed -> no redirect

- games

  - unauthed -> no redirect (disallow actions (view only))
  - authed -> no redirect

- pgn

  - unauthed -> games
  - authed -> no redirect
    - game belongs to user -> no redirect + allow edit
    - game belongs to referee -> no redirect + allow edit
    - game belongs to other users -> no redirect
      - demand password
        - correct -> no redirect
        - incorrect -> games
  - done -> games

- login
  - unauthed -> no redirect
  - authed / done ->
    - tournament is in registration phase ->
      - user is registered (one or more roles) -> uebersicht
      - user is not registered -> anmeldung
    - tournament is not in registration phase -> uebersicht
- register

  - unauthed -> no redirect
  - authed / done ->
    - tournament is in registration phase ->
      - user is registered (one or more roles) -> uebersicht
      - user is not registered -> anmeldung
    - tournament is not in registration phase -> uebersicht

- admin
  - unauthed -> login maybe redirect url?
  - authed -> no redirect
