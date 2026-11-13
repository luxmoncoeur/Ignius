import { describe, expect, it } from "vitest";
import {
  hasProgress,
  makeDefaultProgress,
  mergeBest,
  overallPercent,
  toProgressDto,
} from "@/lib/progress";
import { LESSONS } from "@/lib/lessons";
import { QUIZZES } from "@/lib/quizzes";

describe("progress", () => {
  it("starts empty", () => {
    const p = makeDefaultProgress();
    expect(hasProgress(p)).toBe(false);
    expect(overallPercent(p)).toBe(0);
  });

  it("keeps the further-along value when merging guest and account progress", () => {
    const guest = makeDefaultProgress();
    const account = makeDefaultProgress();
    const [first, second] = LESSONS;
    const quiz = QUIZZES[0].id;
    guest.Progress[first.key] = "Finished";
    account.Progress[first.key] = "Current";
    account.Progress[second.key] = "Current";
    guest.QuizScores[quiz] = 60;
    account.QuizScores[quiz] = 90;

    const merged = mergeBest(account, guest);
    expect(merged.Progress[first.key]).toBe("Finished");
    expect(merged.Progress[second.key]).toBe("Current");
    expect(merged.QuizScores[quiz]).toBe(90);
  });

  it("drops invalid statuses and out-of-range scores", () => {
    const dto = toProgressDto({
      Progress: { [LESSONS[0].key]: "Hacked" },
      QuizProgress: {},
      QuizScores: { [QUIZZES[0].id]: 500 },
    });
    expect(dto.Progress[LESSONS[0].key]).toBe("NotStarted");
    expect(dto.QuizScores[QUIZZES[0].id]).toBe(0);
  });

  it("reports 100% when every lesson and quiz is finished", () => {
    const p = makeDefaultProgress();
    LESSONS.forEach(({ key }) => (p.Progress[key] = "Finished"));
    QUIZZES.forEach(({ id }) => (p.QuizProgress[id] = "Finished"));
    expect(overallPercent(p)).toBe(100);
  });
});
