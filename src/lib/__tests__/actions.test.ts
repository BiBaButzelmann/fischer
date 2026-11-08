import { afterEach, describe, expect, test, vi } from "vitest";
import { redirect } from "next/navigation";
import { action, ActionError } from "../actions";

describe("action", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns the callback result", async () => {
    const wrapped = action(async (value: number) => value * 2);
    expect(await wrapped(21)).toBe(42);
  });

  test("returns the message of an ActionError", async () => {
    const wrapped = action(async () => {
      throw new ActionError("Partie nicht gefunden");
    });
    expect(await wrapped()).toEqual({ error: "Partie nicht gefunden" });
  });

  test("hides the message of unexpected errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const wrapped = action(async () => {
      throw new Error("relation does not exist");
    });
    expect(await wrapped()).toEqual({
      error: "Ein unerwarteter Fehler ist aufgetreten",
    });
  });

  test("rethrows redirects", async () => {
    const wrapped = action(async () => {
      redirect("/willkommen");
    });
    await expect(wrapped()).rejects.toMatchObject({
      digest: expect.stringContaining("NEXT_REDIRECT"),
    });
  });
});
