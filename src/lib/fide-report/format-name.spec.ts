import { describe, it, expect } from "vitest";
import { formatPlayerName } from "./format-name";

describe("formatPlayerName", () => {
  it("returns LAST,FIRST for simple ascii names", () => {
    expect(formatPlayerName("Magnus", "Carlsen")).toBe("Carlsen,Magnus");
  });

  it("trims surrounding whitespace", () => {
    expect(formatPlayerName("  Magnus  ", "  Carlsen ")).toBe("Carlsen,Magnus");
  });

  it("removes generic accents (NFD diacritics)", () => {
    expect(formatPlayerName("José", "García")).toBe("Garcia,Jose");
    expect(formatPlayerName("Fränz", "Schröder")).toBe("Schroder,Franz");
  });

  it("removes acute accents like á", () => {
    expect(formatPlayerName("Álvaro", "Gámez")).toBe("Gamez,Alvaro");
  });

  it("keeps hyphens and other non-accent punctuation", () => {
    expect(formatPlayerName("Jean-Luc", "Picard")).toBe("Picard,Jean-Luc");
  });

  it("maps German sharp s to ss", () => {
    expect(formatPlayerName("Max", "Weiß")).toBe("Weiss,Max");
  });

  it("maps ligatures and special nordic letters", () => {
    expect(formatPlayerName("Ægir", "Hæland")).toBe("Haeland,AEgir");
    expect(formatPlayerName("Søren", "Høegh")).toBe("Hoegh,Soren");
    expect(formatPlayerName("Benoit", "Bœuf")).toBe("Boeuf,Benoit");
  });

  it("maps eth and thorn", () => {
    expect(formatPlayerName("Ðor", "Eiður")).toBe("Eidur,Dor");
    expect(formatPlayerName("Þór", "Þráinsson")).toBe("Thrainsson,Thor");
  });

  it("maps ij/ĳ digraph forms", () => {
    expect(formatPlayerName("Ĳsbrand", "Van Ĳk")).toBe("Van IJk,IJsbrand");
    expect(formatPlayerName("ĳsbrand", "van ĳk")).toBe("van ijk,ijsbrand");
  });

  it("maps selected cyrillic letters (й, ё)", () => {
    expect(formatPlayerName("Йё", "Йёр")).toBe("Иер,Ие");
  });

  it("returns comma when names are empty after trim", () => {
    expect(formatPlayerName("", "")).toBe(",");
    expect(formatPlayerName("   ", "   ")).toBe(",");
  });

  it("handles mixture of multiple special cases in both names", () => {
    const first: string = "Ælÿð Þór-Ĳo";
    const last: string = "Høßœñ ĳÐ";
    expect(formatPlayerName(first, last)).toBe("Hossoen ijD,AElyd Thor-IJo");
  });
});
