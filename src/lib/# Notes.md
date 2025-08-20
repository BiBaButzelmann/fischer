# Notes

## game action

delete roundRobinPairs and use bergerFide instead

in pairsInRound.forEach checken:
does player for the index exist in in players list
yes -> good
no -> set undefined for participantId

---

## standings

remove:

```ts
games.forEach((game) => {
  if (!playerStats.has(game.whiteParticipantId)) {
    playerStats.set(game.whiteParticipantId, {
      participantId: game.whiteParticipantId,
      points: 0,
      gamesPlayed: 0,
      sonnebornBerger: 0,
    });
  }

  if (!playerStats.has(game.blackParticipantId)) {
    playerStats.set(game.blackParticipantId, {
      participantId: game.blackParticipantId,
      points: 0,
      gamesPlayed: 0,
      sonnebornBerger: 0,
    });
  }
});
```

just give a player a point if the other player is null

## game schema

make participant ids nullable

## fide-report action

if participant id is null -> skip

results (163 in fide report )
rausziehen, wenn eine der participants null ist
