"use client";

// Quiz hub cards with saved scores. The final exam spans the full row.
import Link from "next/link";
import { ArrowRight, GraduationCap, Trophy } from "lucide-react";
import { useUser } from "@/components/UserContext";
import { QUIZZES, quizLabel, PASS_PERCENT } from "@/lib/quizzes";
import { quizScore, quizStatus } from "@/lib/progress";
import { DataIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export default function QuizCards() {
  const { progress } = useUser();

  return (
    <ul className="tw grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {QUIZZES.map((quiz) => {
        const score = quizScore(progress, quiz.id);
        const finished = quizStatus(progress, quiz.id) === "Finished";
        const passed = finished && score >= PASS_PERCENT;
        return (
          <li key={quiz.id} className={cn(quiz.final && "md:col-span-2 xl:col-span-3")}>
            <Link
              href={`/quizzes/${quiz.slug}`}
              className={cn(
                "group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl bg-surface p-5 no-underline shadow-xs transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-ember hover:shadow-md",
                quiz.final && "sm:flex-row sm:items-center sm:gap-5 sm:p-6",
              )}
            >
              <span
                className={cn(
                  "grid shrink-0 place-items-center rounded-xl bg-ember-tint text-ember-text",
                  quiz.final ? "size-14" : "size-11",
                )}
                aria-hidden="true"
              >
                {quiz.final ? <GraduationCap className="size-7" /> : <DataIcon name={quiz.icon} className="size-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-muted-foreground">
                  {quizLabel(quiz.id)} · {quiz.questions.length} questions
                </span>
                <span className={cn("block font-bold leading-snug text-ink", quiz.final ? "text-xl" : "text-lg")}>
                  {quiz.title}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-ink-soft">
                  {quiz.description}
                </span>
              </span>
              <span className="mt-auto flex items-center justify-between gap-2 sm:mt-0">
                {finished ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                      passed ? "bg-good-tint text-good-text" : "bg-surface-2 text-ink-soft",
                    )}
                  >
                    <Trophy className="size-3.5" aria-hidden="true" /> Best {score}%
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-ember-text">Start quiz</span>
                )}
                <ArrowRight
                  className="size-4 text-ember-text transition-transform group-hover:translate-x-0.5 sm:ml-3"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
