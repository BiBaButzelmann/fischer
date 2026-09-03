import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RolesData } from "@/db/types/role";
import { sendEmail } from "./client";
import {
  sendTournamentStartedMail,
  type TournamentEmailData,
} from "./tournament-started";
import { ParticipantContent } from "./templates/tournament-started/participant-content";

vi.mock("./client", () => ({
  sendEmail: vi.fn(),
}));

const roles = {
  participant: undefined,
  referee: undefined,
  matchEnteringHelper: undefined,
  setupHelper: undefined,
  juror: undefined,
  trainer: undefined,
} satisfies RolesData;

const tournament = {
  name: "Klubturnier 2027",
  slug: "klubturnier-2027",
  email: "turnierleitung@example.org",
} satisfies TournamentEmailData;

function getSentEmail() {
  expect(sendEmail).toHaveBeenCalledOnce();
  return vi.mocked(sendEmail).mock.calls[0][0];
}

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

    const email = getSentEmail();
    expect(email).toEqual(
      expect.objectContaining({
        to: "ada@example.org",
        subject: "Klubturnier 2027 ist gestartet!",
      }),
    );

    const html = renderToStaticMarkup(email.react);

    expect(html).toContain("Das Klubturnier 2027 hat offiziell begonnen.");
    expect(html).toContain('href="mailto:turnierleitung@example.org"');
    expect(html).toContain("Die Turnierleitung<br/>Klubturnier 2027");
    expect(html).not.toContain("Kai Müller");
  });

  it("uses neutral wording in group updates", async () => {
    await sendTournamentStartedMail({
      name: "Ada",
      email: "ada@example.org",
      roles,
      tournament,
      isGroupUpdate: true,
    });

    const email = getSentEmail();
    expect(email).toEqual(
      expect.objectContaining({
        subject: "Deine Gruppe im Klubturnier 2027 wurde geändert",
      }),
    );

    const html = renderToStaticMarkup(email.react);

    expect(html).toContain("Deine Gruppeneinteilung hat sich geändert.");
    expect(html).not.toContain("verspäteten Anmeldungen");
  });

  it("uses the current tournament slug for participant links", () => {
    const html = renderToStaticMarkup(
      <ParticipantContent
        slug={tournament.slug}
        participantGroup={{
          groupId: 42,
          groupName: "A",
          dayOfWeek: "tuesday",
          participants: [],
        }}
      />,
    );

    expect(html).toContain(
      "https://klubturnier.hsk1830.de/turniere/klubturnier-2027/partien?groupId=42",
    );
    expect(html).toContain(
      "https://klubturnier.hsk1830.de/turniere/klubturnier-2027/tabelle?groupId=42",
    );
  });
});
