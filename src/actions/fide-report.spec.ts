import { generateTable } from "@/lib/fide-report";
import { expect, test } from "vitest";

test("Table", () => {
  const table = generateTable([
    {
      index: 1,
      startingGroupPosition: 1,
      gender: "m",
      title: "",
      name: "Mueller,Kai",
      fideRating: 1960,
      fideNation: "GER",
      fideId: "12939455",
      birthYear: new Date(1996, 1, 1), // Month/day are 00 in example, using 01 here.
      currentPoints: 2.0,
      currentGroupPosition: 1,
      results: [
        {
          scheduled: new Date(2017, 9, 16),
          opponentGroupPosition: 10,
          pieceColor: "w",
          result: "1",
        },
        {
          scheduled: new Date(2017, 9, 23),
          opponentGroupPosition: 2,
          pieceColor: "w",
          result: "1",
        },
      ],
    },
  ]);

  console.log(table);

  expect(table).toBe(
    `         1         2         3         4         5         6         7         8         9        10        11
12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
DDD SSSS sTTT NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN RRRR FFF IIIIIIIIIII BBBB/BB/BB PPPP RRRR  1111 1 1  2222 2 2 
001    1 m    Mueller,Kai                       1960 GER    12939455 1996/00/00  2.0    1    10 w 1     2 w 1 `,
  );
});
