"use client";

// ============================================================
// Dashboard: one "up next" action, four numbers, then tabs
// (Overview · Lessons · Quizzes · Account) that follow the URL hash,
// so /dashboard#quizzes links straight to a tab.
// Guest: browser storage. Logged in: synced from PostgreSQL.
// ============================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  CircleHelp,
  CloudCheck,
  HardDrive,
  LayoutDashboard,
  LogIn,
  LogOut,
  Play,
  RefreshCw,
  RotateCcw,
  Trash2,
  Trophy,
  UserRound,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserContext";
import ProgressRing from "@/components/ProgressRing";
import CalphyMascot from "@/components/CalphyMascot";
import StatusBadge from "@/components/StatusBadge";
import ThermalProgress from "@/components/ThermalProgress";
import CountUp from "@/components/reactbits/CountUp";
import { Page } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataIcon } from "@/lib/icons";
import { LESSONS, LESSON_BY_KEY, UNITS } from "@/lib/lessons";
import { PASS_PERCENT, QUIZZES, quizLabel } from "@/lib/quizzes";
import { lessonStatus, quizScore, quizStatus, overallPercent, resetLocalProgress } from "@/lib/progress";
import { thermalAt } from "@/lib/thermal";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "quizzes", label: "Quizzes", icon: Trophy },
  { id: "account", label: "Account", icon: UserRound },
];
const chartConfig = { score: { label: "Best score", color: "var(--ember)" } };
const quizForLesson = (key) => QUIZZES.find((q) => !q.final && q.lessons.includes(key));

function useHashTab() {
  const [tab, setTab] = useState("overview");
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.slice(1);
      if (TABS.some((t) => t.id === hash)) setTab(hash);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const change = (next) => {
    setTab(next);
    window.history.replaceState(null, "", next === "overview" ? window.location.pathname : `#${next}`);
  };
  return [tab, change];
}

// The single next step: an unfinished lesson in order, or a quiz not yet
// passed for a finished lesson, or the final exam.
function nextStep(progress) {
  for (const lesson of LESSONS) {
    const quiz = quizForLesson(lesson.key);
    if (lessonStatus(progress, lesson.key) !== "Finished") {
      return {
        kind: "lesson",
        label: lessonStatus(progress, lesson.key) === "Current" ? "Continue" : "Start",
        title: `Lesson ${lesson.n}: ${lesson.title}`,
        detail: "Read it, try the simulation, then pass the quiz to finish.",
        href: `/lessons/${lesson.slug}`,
        icon: lesson.icon,
      };
    }
    if (quiz && quizScore(progress, quiz.id) < PASS_PERCENT) {
      return {
        kind: "quiz",
        label: "Take",
        title: `${quizLabel(quiz.id)}: ${quiz.title}`,
        detail: `Score ${PASS_PERCENT}% or higher to lock in Lesson ${lesson.n}.`,
        href: `/quizzes/${quiz.slug}`,
        icon: quiz.icon,
      };
    }
  }
  const final = QUIZZES.find((q) => q.final);
  if (final && quizScore(progress, final.id) < PASS_PERCENT) {
    return {
      kind: "quiz",
      label: "Take",
      title: final.title,
      detail: "Every lesson is done. The final exam covers all of them.",
      href: `/quizzes/${final.slug}`,
      icon: "bi-mortarboard",
    };
  }
  return null;
}

function StatTile({ value, max, suffix = "", label, hint, children }) {
  return (
    <div className="flex flex-col rounded-2xl bg-surface p-4 sm:p-5">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-ink tabular-nums">
        <CountUp to={value} duration={1.1} />
        {max !== undefined && <span className="text-xl text-muted-foreground">/{max}</span>}
        {suffix}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-auto pt-3">{children}</div>
    </div>
  );
}

function Panel({ title, icon: Icon, action, children, className }) {
  return (
    <section className={cn("rounded-2xl bg-surface p-5 sm:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Icon className="size-5 text-ember-text" aria-hidden="true" /> {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ScoreChart({ progress }) {
  const data = QUIZZES.map((q) => ({
    quiz: q.final ? "Final" : quizLabel(q.id).replace("Quiz ", "Q"),
    title: q.title,
    score: quizStatus(progress, q.id) === "Finished" ? quizScore(progress, q.id) : 0,
  }));
  if (!data.some((d) => d.score > 0)) {
    return (
      <div className="grid h-56 place-items-center rounded-xl border border-dashed text-center">
        <div>
          <CircleHelp className="mx-auto mb-2 size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-semibold text-ink">No quiz scores yet</p>
          <p className="text-sm text-muted-foreground">Take a quiz and your best score shows up here.</p>
        </div>
      </div>
    );
  }
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <BarChart data={data} margin={{ left: -18, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="quiz" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} />
        <ChartTooltip
          cursor={{ fill: "var(--surface-2)" }}
          content={<ChartTooltipContent labelFormatter={(_, items) => items?.[0]?.payload?.title} />}
        />
        <ReferenceLine y={PASS_PERCENT} stroke="var(--muted)" strokeDasharray="5 4" />
        <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={36}>
          {data.map((entry, i) => (
            <Cell key={entry.quiz} fill={thermalAt(i / (data.length - 1))} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function ScorePill({ quiz, progress }) {
  if (!quiz) return null;
  const finished = quizStatus(progress, quiz.id) === "Finished";
  const score = quizScore(progress, quiz.id);
  if (!finished) return <span className="text-xs font-semibold text-muted-foreground">Quiz not taken</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
        score >= PASS_PERCENT ? "bg-good-tint text-good-text" : "bg-ember-tint text-ember-text",
      )}
    >
      <Trophy className="size-3.5" aria-hidden="true" /> {score}%
    </span>
  );
}

export default function DashboardPage() {
  const { user, isLoggedIn, authLoading, progress, logout, refreshProgress } = useUser();
  const [tab, setTab] = useHashTab();
  const [dbStatus, setDbStatus] = useState(isLoggedIn ? "checking" : "guest");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isLoggedIn) {
        setDbStatus("guest");
        return;
      }
      try {
        const res = await fetch("/api/progress", { cache: "no-store" });
        if (alive) setDbStatus(res.ok ? "online" : "offline");
      } catch {
        if (alive) setDbStatus("offline");
      }
    })();
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const lessonsDone = LESSONS.filter((l) => lessonStatus(progress, l.key) === "Finished").length;
  const taken = QUIZZES.filter((q) => quizStatus(progress, q.id) === "Finished");
  const passed = taken.filter((q) => quizScore(progress, q.id) >= PASS_PERCENT).length;
  const avgScore = taken.length
    ? Math.round(taken.reduce((sum, q) => sum + quizScore(progress, q.id), 0) / taken.length)
    : 0;
  const overall = overallPercent(progress);
  const step = nextStep(progress);

  const reset = async () => {
    if (!isLoggedIn) {
      resetLocalProgress();
      toast.success("Progress reset", { description: "This browser starts fresh." });
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/progress", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reset account progress.");
      resetLocalProgress();
      await refreshProgress();
      toast.success("Account progress reset");
    } catch (err) {
      toast.error(err.message || "Could not reset account progress.");
    } finally {
      setResetting(false);
    }
  };

  const resync = async () => {
    await refreshProgress();
    toast.success("Progress synced");
  };

  return (
    <Page>
      {/* ---------- header ---------- */}
      <header className="mb-6 flex flex-wrap items-center gap-4">
        {isLoggedIn ? (
          <span className="grid size-14 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {user.username[0].toUpperCase()}
          </span>
        ) : (
          <CalphyMascot size={56} mood="wave" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-[clamp(1.8rem,3.6vw,2.5rem)] font-extrabold tracking-tight text-ink">
            {authLoading ? "Checking session…" : isLoggedIn ? `Hi, ${user.username}!` : "Your progress"}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {isLoggedIn ? (
              <>
                <CloudCheck className="size-4 text-good-text" aria-hidden="true" /> Saved to your account
              </>
            ) : (
              <>
                <HardDrive className="size-4" aria-hidden="true" /> Saved in this browser only
              </>
            )}
            {isLoggedIn && dbStatus === "offline" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-bad-tint px-2.5 py-0.5 text-xs font-semibold text-bad-text">
                <WifiOff className="size-3.5" aria-hidden="true" /> Server unreachable, showing offline copy
              </span>
            )}
          </p>
        </div>
        {!isLoggedIn && !authLoading && (
          <Button asChild className="w-full rounded-full sm:w-auto">
            <Link href="/login">
              <LogIn /> Log in to sync
            </Link>
          </Button>
        )}
      </header>

      {/* ---------- the one next step ---------- */}
      {step ? (
        <Link
          href={step.href}
          className="group mb-8 flex items-center gap-4 rounded-2xl bg-surface px-5 py-4 transition-colors hover:bg-ember-tint sm:px-6"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground" aria-hidden="true">
            <DataIcon name={step.icon} className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-ember-text">
              Up next · {step.label} {step.kind}
            </span>
            <span className="block font-bold leading-snug text-ink">{step.title}</span>
            <span className="block text-sm text-muted-foreground">{step.detail}</span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-ember-text transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-good-tint p-5 text-ink">
          <CircleCheck className="size-6 text-good-text" aria-hidden="true" />
          <p className="font-semibold">Every lesson and the final exam are done. Nice work!</p>
        </div>
      )}

      {/* ---------- four numbers ---------- */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatTile value={lessonsDone} max={LESSONS.length} label="Lessons done">
          <ThermalProgress value={lessonsDone} max={LESSONS.length} label="Lessons done" />
        </StatTile>
        <StatTile value={passed} max={QUIZZES.length} label="Quizzes passed" hint={`${taken.length} taken`}>
          <ThermalProgress value={passed} max={QUIZZES.length} label="Quizzes passed" />
        </StatTile>
        <StatTile value={avgScore} suffix="%" label="Average score" hint={`Pass mark ${PASS_PERCENT}%`}>
          <ThermalProgress value={avgScore} max={100} label="Average quiz score" />
        </StatTile>
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface p-4 text-center lg:flex-row lg:gap-4 lg:text-left">
          <ProgressRing value={overall} size={88} stroke={8}>
            <span className="text-lg font-extrabold text-ink tabular-nums">{overall}%</span>
          </ProgressRing>
          <span className="text-sm font-semibold text-muted-foreground">Course complete</span>
        </div>
      </div>

      {/* ---------- sections ---------- */}
      <Tabs value={tab} onValueChange={setTab} className="gap-6">
        <TabsList className="sticky top-[4.5rem] z-20 grid h-auto w-full grid-cols-4 gap-1 rounded-2xl bg-surface p-1 shadow-xs sm:inline-flex sm:h-12 sm:w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="h-auto flex-col gap-1 rounded-xl px-1 py-2 text-xs data-[state=active]:bg-ember-tint data-[state=active]:text-ember-text data-[state=active]:shadow-none sm:h-full sm:flex-none sm:flex-row sm:gap-1.5 sm:px-4 sm:py-1 sm:text-sm"
            >
              <Icon aria-hidden="true" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Panel
            title="Units"
            icon={BookOpen}
            action={
              <button type="button" onClick={() => setTab("lessons")} className="text-sm font-semibold text-ember-text hover:underline">
                See lessons
              </button>
            }
          >
            <ul className="grid gap-4">
              {UNITS.map((unit, index) => {
                const done = unit.lessons.filter((key) => lessonStatus(progress, key) === "Finished").length;
                return (
                  <li key={unit.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 font-semibold text-ink">
                        <span className="size-2.5 rounded-full" style={{ background: thermalAt(index / (UNITS.length - 1)) }} aria-hidden="true" />
                        Unit {index + 1} · {unit.title}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {done}/{unit.lessons.length}
                      </span>
                    </div>
                    <ThermalProgress value={done} max={unit.lessons.length} label={`${unit.title} lessons done`} className="h-2" />
                  </li>
                );
              })}
            </ul>
          </Panel>
          <Panel
            title="Quiz scores"
            icon={Trophy}
            action={
              <button type="button" onClick={() => setTab("quizzes")} className="text-sm font-semibold text-ember-text hover:underline">
                See all quizzes
              </button>
            }
          >
            <ScoreChart progress={progress} />
            <p className="mt-2 text-xs text-muted-foreground">Dashed line: {PASS_PERCENT}% pass mark.</p>
          </Panel>
        </TabsContent>

        <TabsContent value="lessons" className="grid gap-4">
          {UNITS.map((unit, index) => (
            <Panel key={unit.id} title={`Unit ${index + 1} · ${unit.title}`} icon={BookOpen}>
              <ul className="divide-y">
                {unit.lessons.map((key) => {
                  const lesson = LESSON_BY_KEY[key];
                  const status = lessonStatus(progress, key);
                  const quiz = quizForLesson(key);
                  return (
                    <li key={key} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                          status === "Finished"
                            ? "bg-good text-white"
                            : status === "Current"
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface-2 text-ink",
                        )}
                        aria-hidden="true"
                      >
                        {status === "Finished" ? <Check className="size-4" /> : status === "Current" ? <Play className="size-3.5 fill-current" /> : lesson.n}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">
                          Lesson {lesson.n}: {lesson.title}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-2">
                          <StatusBadge status={status} />
                          <ScorePill quiz={quiz} progress={progress} />
                        </span>
                      </span>
                      <span className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="rounded-full">
                          <Link href={`/lessons/${lesson.slug}`}>{status === "NotStarted" ? "Start" : "Open"}</Link>
                        </Button>
                        {quiz && (
                          <Button asChild size="sm" variant="ghost" className="rounded-full text-ember-text">
                            <Link href={`/quizzes/${quiz.slug}`}>Quiz</Link>
                          </Button>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          ))}
        </TabsContent>

        <TabsContent value="quizzes" className="grid gap-6">
          <Panel title="Best scores" icon={Trophy}>
            <ScoreChart progress={progress} />
          </Panel>
          <Panel title="All quizzes" icon={CircleHelp}>
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th className="px-2 pb-2 font-semibold">Quiz</th>
                    <th className="px-2 pb-2 font-semibold">Best score</th>
                    <th className="px-2 pb-2 font-semibold">Result</th>
                    <th className="px-2 pb-2" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {QUIZZES.map((q) => {
                    const finished = quizStatus(progress, q.id) === "Finished";
                    const score = quizScore(progress, q.id);
                    const pass = finished && score >= PASS_PERCENT;
                    return (
                      <tr key={q.id}>
                        <td className="px-2 py-3">
                          <span className="block text-xs font-semibold text-muted-foreground">{quizLabel(q.id)}</span>
                          <span className="font-semibold text-ink">{q.title}</span>
                        </td>
                        <td className="px-2 py-3 font-bold text-ink tabular-nums">{finished ? `${score}%` : "–"}</td>
                        <td className="px-2 py-3">
                          {!finished ? (
                            <span className="text-muted-foreground">Not taken</span>
                          ) : pass ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-good-text">
                              <CircleCheck className="size-4" aria-hidden="true" /> Passed
                            </span>
                          ) : (
                            <span className="font-semibold text-ember-text">Below {PASS_PERCENT}%</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-right">
                          <Button asChild size="sm" variant={finished ? "outline" : "default"} className="rounded-full">
                            <Link href={`/quizzes/${q.slug}`}>
                              {finished ? (
                                <>
                                  <RotateCcw /> Retake
                                </>
                              ) : (
                                "Take quiz"
                              )}
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="account" className="grid gap-6 lg:grid-cols-2">
          <Panel title="Where your progress lives" icon={isLoggedIn ? CloudCheck : HardDrive}>
            {isLoggedIn ? (
              <>
                <p className="text-ink-soft">
                  Signed in as <span className="font-semibold text-ink">{user.username}</span>. Lessons and best scores sync
                  to your account, so they follow you to any device.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full" onClick={resync}>
                    <RefreshCw /> Re-sync now
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={logout}>
                    <LogOut /> Log out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-ink-soft">
                  You&apos;re a guest, so progress is saved in this browser only. Clearing site data or switching devices
                  starts you over. An account keeps it safe, and your guest progress carries over when you sign up.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild className="rounded-full">
                    <Link href="/register">Create a free account</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/login">Log in</Link>
                  </Button>
                </div>
              </>
            )}
          </Panel>
          <Panel title="Danger zone" icon={Trash2} className="border-bad/40">
            <p className="text-ink-soft">
              {isLoggedIn
                ? "Clear every lesson and quiz score in your account, on all devices."
                : "Clear every lesson and quiz score saved in this browser."}{" "}
              This can&apos;t be undone.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-5 rounded-full border-bad/50 text-bad-text hover:bg-bad-tint hover:text-bad-text">
                  <Trash2 /> {isLoggedIn ? "Reset account progress" : "Reset progress"}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Reset all progress?</DialogTitle>
                  <DialogDescription>
                    Every lesson goes back to not started and every quiz score is cleared. This can&apos;t be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="rounded-full">
                      Keep my progress
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" className="rounded-full" onClick={reset} disabled={resetting}>
                      <Trash2 /> Reset everything
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Panel>
        </TabsContent>
      </Tabs>
    </Page>
  );
}
