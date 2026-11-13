"use client";

// Lessons grouped by unit, on a vertical cold → hot timeline.
// `home` (the /learn page) shows compact lesson rows with Up next / Done;
// the default (/lessons) shows cards with each lesson's tagline.
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useUser } from "@/components/UserContext";
import StatusBadge from "@/components/StatusBadge";
import { UNITS, LESSON_BY_KEY } from "@/lib/lessons";
import { DataIcon } from "@/lib/icons";
import { lessonStatus } from "@/lib/progress";
import { thermalAt } from "@/lib/thermal";
import { cn } from "@/lib/utils";

function LessonRow({ lesson, status, isCurrent, isUpNext }) {
  const done = status === "Finished";
  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      aria-current={isCurrent ? "step" : undefined}
      className={cn(
        "group flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2.5 no-underline transition-colors",
        isCurrent
          ? "border-ember bg-ember-tint"
          : "bg-surface hover:border-[var(--unit)] hover:bg-surface",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg",
          done ? "bg-good-tint text-good-text" : isCurrent ? "bg-primary text-primary-foreground" : "bg-surface-2 text-ink",
        )}
        aria-hidden="true"
      >
        {done ? <Check className="size-5" /> : <DataIcon name={lesson.icon} className="size-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-muted-foreground">Lesson {lesson.n}</span>
        <span className="block font-semibold leading-snug text-ink">{lesson.title}</span>
      </span>
      <StatusBadge status={status !== "NotStarted" ? status : isUpNext ? "UpNext" : null} />
    </Link>
  );
}

function LessonCard({ lesson, status }) {
  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl bg-surface p-5 no-underline shadow-xs transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--unit)] hover:shadow-md"
    >
      <span className="absolute top-3 right-4 text-5xl font-extrabold text-surface-2 tabular-nums" aria-hidden="true">
        {lesson.n}
      </span>
      <span
        className="relative grid size-11 place-items-center rounded-xl text-ink"
        style={{ background: "color-mix(in srgb, var(--unit) 18%, transparent)" }}
        aria-hidden="true"
      >
        <DataIcon name={lesson.icon} className="size-5" />
      </span>
      <span className="relative">
        <span className="block text-lg font-bold leading-snug text-ink">{lesson.title}</span>
        <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-ink-soft">{lesson.tagline}</span>
      </span>
      <span className="relative mt-auto flex items-center justify-between gap-2 pt-1">
        <StatusBadge status={status} />
        <ArrowRight
          className="ml-auto size-4 text-ember-text transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

export default function LessonGrid({ home = false, currentKey = null, upNextKey = null }) {
  const { progress } = useUser();

  return (
    <ol className="tw relative grid gap-6">
      {/* the timeline rail; each unit node carries its place on the cold → hot scale */}
      <span
        className="absolute top-5 bottom-5 left-5 w-px bg-line max-sm:hidden"
        aria-hidden="true"
      />
      {UNITS.map((unit, index) => {
        const doneCount = unit.lessons.filter((key) => lessonStatus(progress, key) === "Finished").length;
        const complete = doneCount === unit.lessons.length;
        return (
          <li
            key={unit.id}
            id={unit.id}
            className="relative scroll-mt-24 sm:pl-16"
            style={{ "--unit": thermalAt(index / (UNITS.length - 1)) }}
          >
            <span
              className="absolute top-0 left-0 grid size-10 place-items-center rounded-full border-4 border-bg text-[#0b1220] max-sm:hidden"
              style={{ background: "var(--unit)" }}
              aria-hidden="true"
            >
              {complete ? <Check className="size-5" /> : <DataIcon name={unit.icon} className="size-5" />}
            </span>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Unit {index + 1} · {doneCount}/{unit.lessons.length} done
                </p>
                <h2 className="text-xl font-bold text-ink">{unit.title}</h2>
              </div>
              {!home && <p className="max-w-md text-sm text-ink-soft">{unit.subtitle}</p>}
            </div>
            <ul className={cn("grid gap-3", home ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4")}>
              {unit.lessons.map((key) => {
                const lesson = LESSON_BY_KEY[key];
                const status = lessonStatus(progress, key);
                return (
                  <li key={key}>
                    {home ? (
                      <LessonRow
                        lesson={lesson}
                        status={status}
                        isCurrent={key === currentKey}
                        isUpNext={key === upNextKey}
                      />
                    ) : (
                      <LessonCard lesson={lesson} status={status} />
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
