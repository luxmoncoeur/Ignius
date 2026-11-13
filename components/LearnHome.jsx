"use client";

// Main page for returning visitors: intro with progress, the next lesson,
// then the unit timeline, simulations, quizzes and Cinder + video.
import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleCheckBig,
  CircleHelp,
  CloudCheck,
  PlayCircle,
  Signpost,
} from "lucide-react";
import { useUser } from "@/components/UserContext";
import LessonGrid from "@/components/LessonGrid";
import SimPreviewStrip from "@/components/SimPreviewStrip";
import QuizCards from "@/components/QuizCards";
import CalphyMascot from "@/components/CalphyMascot";
import CalphyStage from "@/components/CalphyStage";
import SectionHead from "@/components/SectionHead";
import ThermalProgress from "@/components/ThermalProgress";
import VideoEmbed from "@/components/VideoEmbed";
import { Button } from "@/components/ui/button";
import { LESSONS, UNITS } from "@/lib/lessons";
import { QUIZZES } from "@/lib/quizzes";
import { SIM_GROUPS } from "@/lib/simulations";
import { DataIcon } from "@/lib/icons";
import { lessonStatus } from "@/lib/progress";
import { markVisited } from "@/lib/visit";

const SIM_COUNT = SIM_GROUPS.reduce((n, g) => n + g.sims.length, 0);

function ContinueCard({ current, started }) {
  if (!current) {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface p-5">
        <span className="grid size-12 place-items-center rounded-xl bg-good-tint text-good-text" aria-hidden="true">
          <CircleCheckBig className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-muted-foreground">All lessons done</span>
          <span className="block text-lg font-bold text-ink">Test yourself in the quizzes</span>
        </span>
        <Button asChild className="rounded-full">
          <Link href="/quizzes">Open quizzes</Link>
        </Button>
      </div>
    );
  }
  const unitIndex = UNITS.findIndex((unit) => unit.id === current.unit);
  return (
    <Link
      href={`/lessons/${current.slug}`}
      className="group flex items-center gap-4 rounded-2xl bg-surface px-5 py-4 transition-colors hover:bg-ember-tint sm:px-6"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground" aria-hidden="true">
        <DataIcon name={current.icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-ember-text">
          {started ? "Continue" : "Start here"} · Unit {unitIndex + 1}, Lesson {current.n}
        </span>
        <span className="block truncate font-bold text-ink">{current.title}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-ember-text transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

export default function LearnHome() {
  const { user, isLoggedIn, progress } = useUser();

  useEffect(() => {
    markVisited();
  }, []);

  const done = LESSONS.filter((l) => lessonStatus(progress, l.key) === "Finished").length;
  // follow lesson order, so opening a later lesson doesn't skip one
  const current = LESSONS.find((l) => lessonStatus(progress, l.key) !== "Finished");
  const upNext =
    current &&
    LESSONS.slice(LESSONS.indexOf(current)).find((l) => lessonStatus(progress, l.key) === "NotStarted");
  const started = LESSONS.some((l) => lessonStatus(progress, l.key) !== "NotStarted");

  return (
    <div className="tw grid grid-cols-[minmax(0,1fr)] gap-16">
      <div className="grid gap-6">
        <header className="relative grid items-center gap-6 overflow-hidden rounded-3xl bg-surface p-6 sm:p-8 md:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold text-ink-soft">
              <span className="bg-thermal size-2 rounded-full" aria-hidden="true" />
              {isLoggedIn ? `Welcome back, ${user.username}` : "Physics · Thermal physics"}
            </p>
            <h1 className="text-[clamp(2rem,4.4vw,3.2rem)] font-extrabold leading-tight tracking-tight text-ink">
              <span className="text-thermal">Temperature &amp; Heat</span>
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              From thermometer scales to gas laws. Each lesson pairs a short read with a simulation you
              can drag and a quick check.
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {LESSONS.length} lessons · {UNITS.length} units · {SIM_COUNT} simulations · {QUIZZES.length} quizzes
            </p>
            <div className="mt-5 flex max-w-md items-center gap-3">
              <ThermalProgress value={done} max={LESSONS.length} label="Lessons done" className="flex-1" />
              <span className="text-sm font-semibold whitespace-nowrap text-ink tabular-nums">
                {done}/{LESSONS.length} lessons
              </span>
            </div>
          </div>
          <CalphyStage size={200} className="learn-intro-mascot hidden md:grid" />
        </header>
        <ContinueCard current={current} started={started} />
      </div>

      <section aria-labelledby="lessons-title">
        <SectionHead
          id="lessons-title"
          icon={Signpost}
          tag="Browse by unit"
          title={
            <>
              {UNITS.length} units. <span className="text-ember-text">One warm story.</span>
            </>
          }
          sub="Each unit builds on the last: what temperature is, how heat moves, how much it takes to warm things, changes of state, and what gases do when they get hot."
          actions={
            <Button asChild variant="ghost" className="rounded-full text-ember-text">
              <Link href="/lessons">
                All lessons <ArrowRight />
              </Link>
            </Button>
          }
        />
        <LessonGrid home currentKey={current?.key} upNextKey={upNext?.key} />
      </section>

      <SimPreviewStrip />

      <section aria-labelledby="quiz-section-title">
        <SectionHead
          id="quiz-section-title"
          icon={CircleHelp}
          tag="Check yourself"
          title={
            <>
              Quizzes that <span className="text-ember-text">save your score</span>
            </>
          }
          sub="See the explanation after every answer. Your best score per quiz is kept on your dashboard."
          actions={
            <Button asChild variant="ghost" className="rounded-full text-ember-text">
              <Link href="/dashboard">
                My dashboard <ArrowRight />
              </Link>
            </Button>
          }
        />
        <QuizCards />
      </section>

      <section aria-labelledby="media-title">
        <SectionHead
          id="media-title"
          icon={PlayCircle}
          tag="Watch & learn"
          title={
            <>
              See heat move in <span className="text-ember-text">5 minutes</span>
            </>
          }
          sub="A short visual intro to conduction, convection and radiation. Every lesson ends with its own video."
        />
        <div className="grid gap-4 lg:grid-cols-[5fr_7fr]">
          <div className="flex flex-col rounded-2xl bg-surface p-6 text-center">
            <div className="flex flex-1 flex-col items-center justify-center">
              <CalphyMascot size={104} />
              <h3 className="mt-3 text-xl font-bold text-ink">
                Meet <span className="text-ember-text">Cinder</span>
              </h3>
              <p className="mt-1 max-w-sm text-ink-soft">
                Your flame study buddy. Cinder shows up in lessons and quizzes to cheer you on and flag
                the tricky parts. Tap the flame in the corner to ask a question.
              </p>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink-soft">
              <CloudCheck className="size-4 shrink-0 text-good-text" aria-hidden="true" />
              {isLoggedIn ? (
                <span>
                  Your progress is saved to your account.{" "}
                  <Link href="/dashboard" className="font-semibold text-cool hover:underline">
                    See your dashboard
                  </Link>
                </span>
              ) : (
                <span>
                  <Link href="/register" className="font-semibold text-cool hover:underline">
                    Create a free account
                  </Link>{" "}
                  to save your progress.
                </span>
              )}
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-surface">
            <VideoEmbed id="Me60Ti0E_rY" title="Heat Transfer – Conduction, Convection and Radiation" />
          </div>
        </div>
      </section>
    </div>
  );
}
