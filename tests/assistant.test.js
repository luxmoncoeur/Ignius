import { describe, expect, it } from "vitest";
import {
  findCourseMatches,
  isCourseRelated,
  requestsWebSearch,
  resolveLocalAction,
} from "@/lib/assistant";

describe("resolveLocalAction: conversions", () => {
  it("converts Celsius to Fahrenheit", () => {
    const { answer, sources } = resolveLocalAction("convert 25°C to °F");
    expect(answer).toContain("77");
    expect(sources[0].href).toBe("/lessons/temperature-scales");
  });

  it("converts Kelvin to Celsius", () => {
    expect(resolveLocalAction("300 K to C").answer).toContain("26.85");
  });

  it("rejects temperatures below absolute zero", () => {
    expect(resolveLocalAction("convert -500 C to K").answer).toMatch(/absolute zero/);
  });
});

describe("resolveLocalAction: heat calculations", () => {
  it("computes Q = mcΔT for water", () => {
    const { answer } = resolveLocalAction(
      "calculate the heat to warm 2 kg of water from 20 C to 30 C",
    );
    expect(answer).toContain("83,720 J");
  });

  it("asks for missing values instead of guessing", () => {
    expect(resolveLocalAction("calculate the heat for water").answer).toMatch(/Q = m × c × ΔT/);
  });

  it("computes latent heat of fusion", () => {
    expect(resolveLocalAction("calculate the heat to melt 2 kg of ice").answer).toContain("668,000 J");
  });
});

describe("resolveLocalAction: navigation and small talk", () => {
  it("greets", () => {
    expect(resolveLocalAction("hello").answer).toMatch(/^Hi!/);
  });

  it("links to a lesson by number", () => {
    const { links } = resolveLocalAction("open lesson 3");
    expect(links[0].href).toBe("/lessons/conduction");
  });

  it("returns null for a concept question it can't answer locally", () => {
    expect(resolveLocalAction("why does metal feel colder than wood at the same temperature and what role does conductivity play")).toBeNull();
  });
});

describe("retrieval", () => {
  it("ranks the conduction lesson first for a conduction question", () => {
    const [top] = findCourseMatches("thermal conductivity of a metal rod");
    expect(top.href.startsWith("/lessons/conduction")).toBe(true);
  });

  it("returns nothing for an off-topic question", () => {
    expect(findCourseMatches("best pizza toppings")).toEqual([]);
    expect(isCourseRelated("best pizza toppings")).toBe(false);
  });

  it("detects explicit web search requests", () => {
    expect(requestsWebSearch("search the web for heat pumps")).toBe(true);
    expect(requestsWebSearch("what is a heat pump")).toBe(false);
  });
});

describe("model context and routing", () => {
  it("keeps excerpts under the character budget with no repeated sentences", async () => {
    const { getModelContext } = await import("@/lib/assistant");
    const matches = findCourseMatches("specific heat capacity of water and calorimetry");
    const context = getModelContext(matches, "specific heat capacity of water and calorimetry");
    const total = context.reduce((sum, { excerpt }) => sum + excerpt.length, 0);
    expect(total).toBeLessThanOrEqual(1801);
    const sentences = context.flatMap(({ excerpt }) => excerpt.split(/(?<=[.!?])\s+/));
    expect(new Set(sentences).size).toBe(sentences.length);
  });

  it("routes simple questions to the fast model and multi-step ones to the deep model", async () => {
    const { classifyQuestion } = await import("@/lib/assistant");
    expect(classifyQuestion("what is thermal equilibrium")).toBe("fast");
    expect(classifyQuestion("why does a metal spoon feel colder than a wooden one")).toBe("deep");
    expect(classifyQuestion("heat needed for 3 kg of copper")).toBe("deep");
  });

  it("links every built-in concept answer to a real lesson", async () => {
    const { LESSONS } = await import("@/lib/lessons");
    const slugs = new Set(LESSONS.map((l) => `/lessons/${l.slug}`));
    for (const q of ["what is heat", "what is latent heat", "what are gas laws", "what is calorimetry", "what is specific heat"]) {
      const { sources } = resolveLocalAction(q);
      expect(slugs.has(sources[0].href), `${q} -> ${sources[0].href}`).toBe(true);
    }
  });
});
