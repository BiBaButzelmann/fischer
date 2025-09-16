import { describe, test, expect } from "vitest";
import { calculateStandings } from "../standings";
import type { Game } from "@/db/types/game";
import type { ParticipantWithRating } from "@/db/types/participant";

describe("Sonneborn-Berger Calculation", () => {
  test("should calculate correct Sonneborn-Berger scores for round robin tournament example", () => {
    // Test data based on the provided example:
    // Cross-table results:
    //             A  B  C  D  E  F  G   Points
    // Player A   -  ½  ½  1  1  1  1     5
    //        B   ½  -  ½  ½  1  1  1     4.5
    //        C   ½  ½  -  ½  ½  1  1     4
    //        D   0  ½  ½  -  1  1  1     4
    //        E   0  0  ½  0  -  1  1     2.5
    //        F   0  0  0  0  0  -  1     1
    //        G   0  0  0  0  0  0  -     0

    const participants: ParticipantWithRating[] = [
      {
        id: 1,
        dwzRating: null,
        fideRating: null,
        profile: {
          id: 1,
          userId: "a",
          firstName: "Spieler",
          lastName: "A",
          deletedAt: null,
          phoneNumber: "",
          email: "a@test.com",
        },
      },
      {
        id: 2,
        dwzRating: null,
        fideRating: null,
        profile: {
          id: 2,
          userId: "b",
          firstName: "Spieler",
          lastName: "B",
          deletedAt: null,
          phoneNumber: "",
          email: "b@test.com",
        },
      },
      {
        id: 3,
        dwzRating: null,
        fideRating: null,
        profile: {
          id: 3,
          userId: "c",
          firstName: "Spieler",
          lastName: "C",
          deletedAt: null,
          phoneNumber: "",
          email: "c@test.com",
        },
      },
      {
        id: 4,
        dwzRating: null,
        fideRating: null,
        profile: {
          id: 4,
          userId: "d",
          firstName: "Spieler",
          lastName: "D",
          deletedAt: null,
          phoneNumber: "",
          email: "d@test.com",
        },
      },
      {
        id: 5,
        dwzRating: null,
        fideRating: null,
        profile: {
          id: 5,
          userId: "e",
          firstName: "Spieler",
          lastName: "E",
          deletedAt: null,
          phoneNumber: "",
          email: "e@test.com",
        },
      },
      {
        id: 6,
        dwzRating: null,
        fideRating: null,
        profile: {
          id: 6,
          userId: "f",
          firstName: "Spieler",
          lastName: "F",
          deletedAt: null,
          phoneNumber: "",
          email: "f@test.com",
        },
      },
      {
        id: 7,
        dwzRating: null,
        fideRating: null,
        profile: {
          id: 7,
          userId: "g",
          firstName: "Spieler",
          lastName: "G",
          deletedAt: null,
          phoneNumber: "",
          email: "g@test.com",
        },
      },
    ];

    const games: Game[] = [
      // A vs B: ½ (A: ½, B: ½)
      {
        id: 1,
        whiteParticipantId: 1,
        blackParticipantId: 2,
        result: "½-½",
        round: 1,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // A vs C: ½ (A: ½, C: ½)
      {
        id: 2,
        whiteParticipantId: 1,
        blackParticipantId: 3,
        result: "½-½",
        round: 2,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // A vs D: 1 (A: 1, D: 0)
      {
        id: 3,
        whiteParticipantId: 1,
        blackParticipantId: 4,
        result: "1:0",
        round: 3,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // A vs E: 1 (A: 1, E: 0)
      {
        id: 4,
        whiteParticipantId: 1,
        blackParticipantId: 5,
        result: "1:0",
        round: 4,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // A vs F: 1 (A: 1, F: 0)
      {
        id: 5,
        whiteParticipantId: 1,
        blackParticipantId: 6,
        result: "1:0",
        round: 5,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // A vs G: 1 (A: 1, G: 0)
      {
        id: 6,
        whiteParticipantId: 1,
        blackParticipantId: 7,
        result: "1:0",
        round: 6,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // B vs C: ½ (B: ½, C: ½)
      {
        id: 7,
        whiteParticipantId: 2,
        blackParticipantId: 3,
        result: "½-½",
        round: 1,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // B vs D: ½ (B: ½, D: ½)
      {
        id: 8,
        whiteParticipantId: 2,
        blackParticipantId: 4,
        result: "½-½",
        round: 2,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // B vs E: 1 (B: 1, E: 0)
      {
        id: 9,
        whiteParticipantId: 2,
        blackParticipantId: 5,
        result: "1:0",
        round: 3,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // B vs F: 1 (B: 1, F: 0)
      {
        id: 10,
        whiteParticipantId: 2,
        blackParticipantId: 6,
        result: "1:0",
        round: 4,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // B vs G: 1 (B: 1, G: 0)
      {
        id: 11,
        whiteParticipantId: 2,
        blackParticipantId: 7,
        result: "1:0",
        round: 5,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // C vs D: ½ (C: ½, D: ½)
      {
        id: 12,
        whiteParticipantId: 3,
        blackParticipantId: 4,
        result: "½-½",
        round: 1,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // C vs E: ½ (C: ½, E: ½)
      {
        id: 13,
        whiteParticipantId: 3,
        blackParticipantId: 5,
        result: "½-½",
        round: 2,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // C vs F: 1 (C: 1, F: 0)
      {
        id: 14,
        whiteParticipantId: 3,
        blackParticipantId: 6,
        result: "1:0",
        round: 3,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // C vs G: 1 (C: 1, G: 0)
      {
        id: 15,
        whiteParticipantId: 3,
        blackParticipantId: 7,
        result: "1:0",
        round: 4,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // D vs E: 1 (D: 1, E: 0)
      {
        id: 16,
        whiteParticipantId: 4,
        blackParticipantId: 5,
        result: "1:0",
        round: 1,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // D vs F: 1 (D: 1, F: 0)
      {
        id: 17,
        whiteParticipantId: 4,
        blackParticipantId: 6,
        result: "1:0",
        round: 2,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // D vs G: 1 (D: 1, G: 0)
      {
        id: 18,
        whiteParticipantId: 4,
        blackParticipantId: 7,
        result: "1:0",
        round: 3,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // E vs F: 1 (E: 1, F: 0)
      {
        id: 19,
        whiteParticipantId: 5,
        blackParticipantId: 6,
        result: "1:0",
        round: 1,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // E vs G: 1 (E: 1, G: 0)
      {
        id: 20,
        whiteParticipantId: 5,
        blackParticipantId: 7,
        result: "1:0",
        round: 2,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
      // F vs G: 1 (F: 1, G: 0)
      {
        id: 21,
        whiteParticipantId: 6,
        blackParticipantId: 7,
        result: "1:0",
        round: 1,
        tournamentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        groupId: 1,
        pgnId: null,
        boardNumber: null,
      },
    ];

    const standings = calculateStandings(games, participants);

    standings.forEach((player, index) => {
      const participant = participants.find(
        (p) => p.id === player.participantId,
      )!;
      const name = `${participant.profile.firstName} ${participant.profile.lastName}`;
      console.log(
        `${index + 1}. ${name}: ${player.points} pts, SB = ${player.sonnebornBerger}`,
      );
    });
    console.log("\n");

    // Find players by their names
    const playerA = standings.find((p) => p.participantId === 1)!;
    const playerB = standings.find((p) => p.participantId === 2)!;
    const playerC = standings.find((p) => p.participantId === 3)!;
    const playerD = standings.find((p) => p.participantId === 4)!;
    const playerE = standings.find((p) => p.participantId === 5)!;
    const playerF = standings.find((p) => p.participantId === 6)!;
    const playerG = standings.find((p) => p.participantId === 7)!;

    // Verify points are correct
    expect(playerA.points).toBe(5);
    expect(playerB.points).toBe(4.5);
    expect(playerC.points).toBe(4);
    expect(playerD.points).toBe(4);
    expect(playerE.points).toBe(2.5);
    expect(playerF.points).toBe(1);
    expect(playerG.points).toBe(0);

    // Player C should have SB = 9:
    // - Draw vs A (5 points): 2.5
    // - Draw vs B (4.5 points): 2.25
    // - Draw vs D (4 points): 2
    // - Draw vs E (2.5 points): 1.25
    // - Win vs F (1 point): 1
    // - Win vs G (0 points): 0
    // Total: 9
    expect(playerC.sonnebornBerger).toBe(9);

    // Player D should have SB = 7.75:
    // - Loss vs A (5 points): 0
    // - Draw vs B (4.5 points): 2.25
    // - Draw vs C (4 points): 2
    // - Win vs E (2.5 points): 2.5
    // - Win vs F (1 point): 1
    // - Win vs G (0 points): 0
    // Total: 7.75
    expect(playerD.sonnebornBerger).toBe(7.75);

    // Player A should have the highest SB score
    // A's SB calculation:
    // - Draw vs B (4.5 points): 2.25
    // - Draw vs C (4 points): 2
    // - Win vs D (4 points): 4
    // - Win vs E (2.5 points): 2.5
    // - Win vs F (1 point): 1
    // - Win vs G (0 points): 0
    // Total: 11.75
    expect(playerA.sonnebornBerger).toBe(11.75);

    // Player B's SB calculation:
    // - Draw vs A (5 points): 2.5
    // - Draw vs C (4 points): 2
    // - Draw vs D (4 points): 2
    // - Win vs E (2.5 points): 2.5
    // - Win vs F (1 point): 1
    // - Win vs G (0 points): 0
    // Total: 10.0
    expect(playerB.sonnebornBerger).toBe(10);

    // Player C's SB calculation:
    // - Draw vs A (5 points): 2.5
    // - Draw vs B (4.5 points): 2.25
    // - Draw vs D (4 points): 2
    // - Draw vs E (2.5 points): 1.25
    // - Win vs F (1 point): 1
    // - Win vs G (0 points): 0
    // Total: 9.0
    expect(playerC.sonnebornBerger).toBe(9);

    // Player E's SB calculation:
    // - Loss vs A (5 points): 0
    // - Loss vs B (4.5 points): 0
    // - Draw vs C (4 points): 2
    // - Loss vs D (4 points): 0
    // - Win vs F (1 point): 1
    // - Win vs G (0 points): 0
    // Total: 3.0
    expect(playerE.sonnebornBerger).toBe(3);

    // Player F's SB calculation:
    // - Loss vs A (5 points): 0
    // - Loss vs B (4.5 points): 0
    // - Loss vs C (4 points): 0
    // - Loss vs D (4 points): 0
    // - Loss vs E (2.5 points): 0
    // - Win vs G (0 points): 0
    // Total: 0.0
    expect(playerF.sonnebornBerger).toBe(0);

    // Player G's SB calculation:
    // - Loss vs A (5 points): 0
    // - Loss vs B (4.5 points): 0
    // - Loss vs C (4 points): 0
    // - Loss vs D (4 points): 0
    // - Loss vs E (2.5 points): 0
    // - Loss vs F (1 point): 0
    // Total: 0.0
    expect(playerG.sonnebornBerger).toBe(0);

    // Verify sorting order (A, B, C, D, E, F, G)
    expect(standings[0].participantId).toBe(1); // A
    expect(standings[1].participantId).toBe(2); // B
    expect(standings[2].participantId).toBe(3); // C
    expect(standings[3].participantId).toBe(4); // D
    expect(standings[4].participantId).toBe(5); // E
    expect(standings[5].participantId).toBe(6); // F
    expect(standings[6].participantId).toBe(7); // G
  });
});
