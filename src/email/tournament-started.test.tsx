import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RolesData } from "@/db/types/role";
import { sendEmail } from "./client";
import { sendTournamentStartedMail } from "./tournament-started";
import { TournamentStartedMail } from "./templates/tournament-started";

vi.mock("./client", () => ({
  sendEmail: vi.fn(),
}));

const roles: RolesData = {
  participant: undefined,
  referee: undefined,
  matchEnteringHelper: undefined,
  setupHelper: undefined,
  juror: undefined,
  trainer: undefined,
};

const tournament = {
  name: "Klubturnier 2027",
  slug: "klubturnier-2027",
  email: "turnierleitung@example.org",
};

describe("tournament started emails", () => {
  beforeEach(() => {
    vi.mocked(sendEmail).mockClear();
  });

  it("uses the current tournament in the start email", async () => {
    await sendTournamentStartedMail({
      name: "Ada",
      email: "ada@example.org",
      roles,
      tournament,
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ada@example.org",
        subject: "Klubturnier 2027 ist gestartet!",
      }),
    );

    const html = renderToStaticMarkup(
      TournamentStartedMail({
        name: "Ada",
        roles,
        tournament,
        participantData: undefined,
      }),
    );

    expect(html).toContain("Das Klubturnier 2027 hat offiziell begonnen.");
    expect(html).toContain('href="mailto:turnierleitung@example.org"');
    expect(html).toContain("Klubturnier 2027");
    expect(html).not.toContain("Kai Müller");
  });

  it("uses neutral wording and the current slug in group updates", async () => {
    const participantRoles: RolesData = {
      ...roles,
      participant: {} as NonNullable<RolesData["participant"]>,
    };

    await sendTournamentStartedMail({
      name: "Ada",
      email: "ada@example.org",
      roles: participantRoles,
      tournament,
      participantData: {
        groupId: 42,
        groupName: "A",
        dayOfWeek: "tuesday",
        participants: [],
      },
      isGroupUpdate: true,
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Deine Gruppe im Klubturnier 2027 wurde geändert",
      }),
    );

    const html = renderToStaticMarkup(
      TournamentStartedMail({
        name: "Ada",
        roles: participantRoles,
        tournament,
        participantData: {
          groupId: 42,
          groupName: "A",
          dayOfWeek: "tuesday",
          participants: [],
        },
        isGroupUpdate: true,
      }),
    );

    expect(html).toContain("Deine Gruppeneinteilung hat sich geändert.");
    expect(html).not.toContain("verspäteten Anmeldungen");
    expect(html).toContain(
      "https://klubturnier.hsk1830.de/turniere/klubturnier-2027/partien?groupId=42",
    );
    expect(html).toContain(
      "https://klubturnier.hsk1830.de/turniere/klubturnier-2027/tabelle?groupId=42",
    );
  });
});
