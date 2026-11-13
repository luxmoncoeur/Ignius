"use client";

// Interactive "Check your understanding" mini-quiz embedded in lessons.
import { useMemo, useState } from "react";
import { CircleCheck, Lightbulb, ListChecks, RotateCcw } from "lucide-react";
import QuizOption from "@/components/QuizOption";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MiniQuiz({ items }) {
  const [answers, setAnswers] = useState({}); // question index → chosen option index
  const total = items.length;
  const answered = Object.keys(answers).length;
  const correct = useMemo(
    () => Object.entries(answers).filter(([i, v]) => items[Number(i)].a === v).length,
    [answers, items],
  );

  return (
    <div className="tw rounded-2xl bg-surface p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
          <ListChecks className="size-5 text-ember-text" aria-hidden="true" />
          Check your understanding
        </h2>
        <span className="rounded-full bg-cool-tint px-3 py-1 text-xs font-semibold text-ink-soft" aria-live="polite">
          {answered}/{total} answered
          {answered === total ? ` · ${correct} correct` : ""}
        </span>
      </div>

      <ol className="grid gap-6">
        {items.map((item, qi) => {
          const chosen = answers[qi];
          const done = chosen !== undefined;
          const right = chosen === item.a;
          return (
            <li key={qi}>
              <p className="mb-3 font-semibold text-ink">
                {qi + 1}. {item.q}
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {item.options.map((option, oi) => (
                  <QuizOption
                    key={oi}
                    index={oi}
                    disabled={done}
                    state={done ? (oi === item.a ? "correct" : oi === chosen ? "incorrect" : "idle") : "idle"}
                    onClick={() => setAnswers((current) => ({ ...current, [qi]: oi }))}
                  >
                    {option}
                  </QuizOption>
                ))}
              </div>
              {done && (
                <p
                  className={cn(
                    "mt-3 flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    right ? "bg-good-tint text-ink" : "bg-ember-tint text-ink",
                  )}
                  role="status"
                >
                  {right ? (
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-good-text" aria-hidden="true" />
                  ) : (
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-ember-text" aria-hidden="true" />
                  )}
                  <span>
                    <span className="font-semibold">{right ? "Correct. " : "Not quite. "}</span>
                    {item.explain}
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {answered > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
          <Button variant="outline" className="rounded-full" onClick={() => setAnswers({})}>
            <RotateCcw /> Retry
          </Button>
          {answered === total && (
            <p className={cn("text-sm font-semibold", correct === total ? "text-good-text" : "text-ember-text")}>
              {correct === total
                ? "Perfect! Take the full quiz to save a score."
                : `${correct}/${total} correct. Review the explanations, then retry or take the full quiz.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
