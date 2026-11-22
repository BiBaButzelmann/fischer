import { describe, test, expect } from "vitest";
import { buildMailtoHref } from "../mailto";

describe("buildMailtoHref", () => {
  test("joins several recipients with commas", () => {
    expect(buildMailtoHref({ to: ["a@hsk1830.de", "b@hsk1830.de"] })).toBe(
      "mailto:a@hsk1830.de,b@hsk1830.de",
    );
  });

  test("encodes characters that would break the address list", () => {
    expect(
      buildMailtoHref({ to: ["max+turnier@hsk1830.de", "x,y@hsk1830.de"] }),
    ).toBe("mailto:max%2Bturnier@hsk1830.de,x%2Cy@hsk1830.de");
  });

  test("encodes spaces in the subject as %20 rather than +", () => {
    expect(
      buildMailtoHref({
        to: ["a@hsk1830.de"],
        subject: "Klubturnier 2026 – Gruppe A",
      }),
    ).toBe(
      "mailto:a@hsk1830.de?subject=Klubturnier%202026%20%E2%80%93%20Gruppe%20A",
    );
  });
});
