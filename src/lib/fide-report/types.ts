export type TableEntry = {
  // ?
  index: number;
  startingGroupPosition: number;
  gender: "m" | "f";
  title: string;
  // firstName, lastName
  name: string;
  fideRating: number;
  fideNation: string;
  fideId: string;
  // yyyy/00/00
  birthYear: Date;
  // X.0
  currentPoints: number;
  currentGroupPosition: number;
  results: Result[];
};

export type Result = {
  scheduled: Date;
  opponentGroupPosition: number;
  pieceColor: "w" | "b";
  result: "1" | "0" | "+" | "-";
};

export type TableEntryKeyValue = {
  [K in keyof TableEntry]: { id: K; data: TableEntry[K] };
}[keyof TableEntry];
