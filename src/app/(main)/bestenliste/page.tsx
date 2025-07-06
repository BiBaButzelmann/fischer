export default async function Page() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bestenliste</h1>
      </div>
      <p className="text-lg text-muted-foreground">
        Die Bestenliste zeigt die Spieler mit den meisten Punkten.
      </p>
      <p className="text-lg text-muted-foreground mt-2">
        Die Punkte werden aus den Ergebnissen der Partien berechnet.
      </p>
    </div>
  );
}
