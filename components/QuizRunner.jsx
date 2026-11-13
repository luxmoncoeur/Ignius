"use client";

// ============================================================
// QuizRunner, form-style quiz:
//   every question on one page, no feedback until the form is submitted,
//   questions and MC options reshuffled on every attempt,
//   numeric entry with tolerance,
//   after submitting: score ring, then each question with the learner's
//   answer, the correct answer and the explanation,
//   saves to progress (localStorage + PostgreSQL when logged in),
//   a passing score finishes the quiz's lesson and links to the next step,
//   fires calphy:quizdone so the mascot celebrates.
// ============================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  CircleAlert,
  CircleCheck,
  CircleX,
  CloudUpload,
  DatabaseZap,
  LayoutGrid,
  RefreshCw,
  RotateCcw,
  Send,
  Trophy,
} from "lucide-react";
import ProgressRing from "@/components/ProgressRing";
import QuizOption from "@/components/QuizOption";
import ThermalProgress from "@/components/ThermalProgress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { saveQuizScore, completeLessons, celebrate } from "@/lib/progress";
import { PASS_PERCENT } from "@/lib/quizzes";
import { LESSON_BY_KEY } from "@/lib/lessons";
import { useUser } from "@/components/UserContext";

// Fisher–Yates over indices: position → original index
function shuffledIndices(n) {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

const sameOrder = (a, b) => !!b && a.every((v, i) => v === b[i]);

// A fresh attempt: random question order (never a repeat of the last one
// when there is more than one possible order) and random MC option orders.
function makeAttempt(quiz, prev) {
  let questionOrder = shuffledIndices(quiz.questions.length);
  for (let tries = 0; tries < 5 && sameOrder(questionOrder, prev?.questionOrder); tries++)
    questionOrder = shuffledIndices(quiz.questions.length);
  const optionOrders = quiz.questions.map((q) =>
    q.type === "mc" ? shuffledIndices(q.options.length) : null,
  );
  return { questionOrder, optionOrders };
}

const parseNumber = (text) => parseFloat(String(text).replace(/,/g, ""));

const isAnswered = (q, answer) =>
  q.type === "mc" ? answer !== undefined : !Number.isNaN(parseNumber(answer ?? ""));

const isCorrect = (q, answer) =>
  q.type === "mc"
    ? answer === q.a
    : Math.abs(parseNumber(answer) - q.answer) <= (q.tol ?? 0.01);

const formatCorrect = (q) =>
  q.type === "mc"
    ? q.options[q.a]
    : `${q.answer.toLocaleString()} ${q.unit}${q.tol ? ` (±${q.tol} accepted)` : ""}`;

export default function QuizRunner({ quiz, next: nextStep }) {
  const { isLoggedIn } = useUser();
  // null until mounted: Math.random can't run during SSR without a hydration mismatch
  const [attempt, setAttempt] = useState(null);
  // keyed by original question index: MC → original option index, numeric → text
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showMissing, setShowMissing] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttempt(makeAttempt(quiz));
  }, [quiz]);

  const total = quiz.questions.length;
  const answeredCount = quiz.questions.filter((q, i) => isAnswered(q, answers[i])).length;
  const score = quiz.questions.filter((q, i) => isCorrect(q, answers[i])).length;
  const pct = Math.round((score / total) * 100);
  const passed = pct >= PASS_PERCENT;

  // before the handlers: the React Compiler reads attempt for their memo keys
  if (!attempt) {
    return (
      <div className="tw mx-auto grid max-w-3xl gap-3" role="status" aria-label="Shuffling questions">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const setAnswer = (qIndex, value) => setAnswers((prev) => ({ ...prev, [qIndex]: value }));

  const submit = (e) => {
    e.preventDefault();
    const firstMissing = attempt.questionOrder.find((qi) => !isAnswered(quiz.questions[qi], answers[qi]));
    if (firstMissing !== undefined) {
      setShowMissing(true);
      document.getElementById(`quiz-q-${firstMissing}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitted(true);
    saveQuizScore(quiz.id, pct, isLoggedIn);
    if (passed) completeLessons(quiz.lessons, isLoggedIn);
    celebrate(score, total);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setAttempt((prev) => makeAttempt(quiz, prev));
    setAnswers({});
    setSubmitted(false);
    setShowMissing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="tw mx-auto max-w-3xl">
      {submitted ? (
        <ResultSummary
          quiz={quiz}
          score={score}
          total={total}
          pct={pct}
          passed={passed}
          isLoggedIn={isLoggedIn}
          nextStep={nextStep}
          onRestart={restart}
        />
      ) : (
        <div className="sticky top-[4.5rem] z-30 mb-4 rounded-2xl bg-surface p-4 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 font-bold text-ink">
              <DataIcon name={quiz.icon} className="size-4 text-ember-text" aria-hidden="true" /> {quiz.title}
            </span>
            <span className="text-sm font-semibold text-muted-foreground tabular-nums" aria-live="polite">
              {answeredCount} of {total} answered
            </span>
          </div>
          <ThermalProgress value={answeredCount} max={total} label="Questions answered" />
          <p className="mt-2 text-xs text-muted-foreground">
            Answer every question, then submit. Your score and the correct answers appear after you submit.
          </p>
        </div>
      )}

      <form onSubmit={submit} noValidate className="grid gap-4">
        {attempt.questionOrder.map((qi, pos) => (
          <QuestionCard
            key={qi}
            n={pos + 1}
            qIndex={qi}
            q={quiz.questions[qi]}
            optionOrder={attempt.optionOrders[qi]}
            answer={answers[qi]}
            onAnswer={(value) => setAnswer(qi, value)}
            submitted={submitted}
            missing={showMissing && !isAnswered(quiz.questions[qi], answers[qi])}
          />
        ))}

        {!submitted && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" size="lg" className="h-12 rounded-full px-6 text-base">
              <Send /> Submit answers
            </Button>
            {showMissing && answeredCount < total && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-bad-text" role="alert">
                <CircleAlert className="size-4" aria-hidden="true" />
                {total - answeredCount} question{total - answeredCount === 1 ? " is" : "s are"} still unanswered.
              </span>
            )}
          </div>
        )}
      </form>

      {submitted && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button className="rounded-full" onClick={restart}>
            <RotateCcw /> Retake quiz
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/quizzes">
              <LayoutGrid /> All quizzes
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function QuestionCard({ n, qIndex, q, optionOrder, answer, onAnswer, submitted, missing }) {
  const promptId = `quiz-q-${qIndex}-prompt`;
  const correct = submitted && isCorrect(q, answer);

  return (
    <fieldset
      id={`quiz-q-${qIndex}`}
      className={cn(
        "scroll-mt-40 rounded-2xl border-2 bg-surface p-5 sm:p-6",
        submitted ? (correct ? "border-good/50" : "border-bad/50") : missing ? "border-bad" : "border-line",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <legend id={promptId} className="float-left font-semibold leading-relaxed text-ink">
          <span className="mr-1 text-ember-text">{n}.</span> {q.prompt}
        </legend>
        {submitted && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
              correct ? "bg-good-tint text-good-text" : "bg-bad-tint text-bad-text",
            )}
          >
            {correct ? <CircleCheck className="size-3.5" aria-hidden="true" /> : <CircleX className="size-3.5" aria-hidden="true" />}
            {correct ? "1/1" : "0/1"}
          </span>
        )}
      </div>

      {q.type === "mc" ? (
        <div className="clear-both grid gap-2" role="radiogroup" aria-labelledby={promptId}>
          {optionOrder.map((origIdx, pos) => (
            <QuizOption
              key={origIdx}
              index={pos}
              role="radio"
              aria-checked={origIdx === answer}
              disabled={submitted}
              onClick={() => onAnswer(origIdx)}
              state={
                submitted
                  ? origIdx === q.a
                    ? "correct"
                    : origIdx === answer
                      ? "incorrect"
                      : "idle"
                  : origIdx === answer
                    ? "selected"
                    : "idle"
              }
            >
              {q.options[origIdx]}
            </QuizOption>
          ))}
        </div>
      ) : (
        <div className="clear-both flex flex-wrap items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Your answer"
            aria-labelledby={promptId}
            value={answer ?? ""}
            disabled={submitted}
            onChange={(e) => onAnswer(e.target.value)}
            className={cn(
              "h-11 w-full max-w-60 rounded-xl border-2 bg-bg px-3.5 text-base text-ink tabular-nums outline-none focus:border-ember disabled:opacity-100",
              submitted && (correct ? "border-good bg-good-tint" : "border-bad bg-bad-tint"),
            )}
          />
          <span className="font-semibold text-muted-foreground">{q.unit}</span>
        </div>
      )}

      {missing && <p className="mt-2 text-sm font-semibold text-bad-text">This question needs an answer.</p>}

      {submitted && (
        <div
          className={cn(
            "mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed text-ink",
            correct ? "bg-good-tint" : "bg-ember-tint",
          )}
        >
          {!correct && (
            <p className="mb-1">
              Correct answer: <strong className="text-ink">{formatCorrect(q)}</strong>
            </p>
          )}
          <p>{q.explain}</p>
        </div>
      )}
    </fieldset>
  );
}

function ResultSummary({ quiz, score, total, pct, passed, isLoggedIn, nextStep, onRestart }) {
  const lessonNames = quiz.lessons.map((key) => `Lesson ${LESSON_BY_KEY[key].n}`).join(" & ");
  const verdict =
    pct >= 90
      ? { icon: Trophy, text: "Outstanding! You've mastered this topic.", className: "text-good-text" }
      : pct >= 70
        ? { icon: Award, text: "Great job! A quick review and you'll hit 100%.", className: "text-ember-text" }
        : pct >= 50
          ? { icon: RefreshCw, text: "Good start. Check the answers below and retry.", className: "text-ember-text" }
          : { icon: BookOpen, text: "Time to re-read the lesson and play with the simulation. You've got this!", className: "text-bad-text" };
  const VerdictIcon = verdict.icon;

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl bg-surface p-6 text-center sm:p-10">
      {passed &&
        Array.from({ length: 24 }, (_, index) => (
          <span
            key={index}
            className="confetti-piece"
            aria-hidden="true"
            style={{
              left: `${(index * 23) % 100}%`,
              width: `${6 + (index % 3) * 2}px`,
              height: `${8 + (index % 4) * 2}px`,
              backgroundColor: ["var(--ember)", "var(--flame-glow)", "var(--good)", "var(--cool)"][index % 4],
              animationDuration: `${2.2 + (index % 4) * 0.15}s`,
              animationDelay: `${(index % 6) * 0.08}s`,
            }}
          />
        ))}
      <div className="mb-5 flex justify-center">
        <ProgressRing value={pct} size={168}>
          <span className="text-thermal text-4xl font-extrabold tabular-nums">{pct}%</span>
          <span className="text-sm font-semibold text-muted-foreground">
            {score}/{total} correct
          </span>
        </ProgressRing>
      </div>
      <h2 className="flex items-center justify-center gap-2 text-2xl font-extrabold text-ink">
        <VerdictIcon className={cn("size-6", verdict.className)} aria-hidden="true" />
        {quiz.title} complete!
      </h2>
      <p className="mt-1 text-ink-soft">{verdict.text}</p>
      <p className="mt-3 text-sm font-semibold">
        {passed ? (
          <span className="inline-flex items-center gap-1 text-good-text">
            <CircleCheck className="size-4" aria-hidden="true" />
            {quiz.final ? "Final exam passed" : `${lessonNames} marked complete`}
          </span>
        ) : (
          <span className="text-muted-foreground">
            Score {PASS_PERCENT}% or higher to {quiz.final ? "pass the final exam" : `complete ${lessonNames}`}
          </span>
        )}
      </p>

      <div className="mt-4 flex justify-center">
        {isLoggedIn ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-good-tint px-3 py-1 text-xs font-semibold text-good-text">
            <DatabaseZap className="size-3.5" aria-hidden="true" /> Score saved to your account
          </span>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full bg-cool-tint px-3 py-1 text-xs font-semibold text-ink-soft hover:underline"
          >
            <CloudUpload className="size-3.5" aria-hidden="true" /> Log in to sync scores
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild variant={passed ? "default" : "outline"} className="rounded-full">
          <Link href={nextStep ? nextStep.href : "/dashboard"}>
            {nextStep ? nextStep.label : "Go to dashboard"} <ArrowRight />
          </Link>
        </Button>
        <Button variant={passed ? "outline" : "default"} className="rounded-full" onClick={onRestart}>
          <RotateCcw /> Retake quiz
        </Button>
        {nextStep && (
          <Button asChild variant="secondary" className="rounded-full">
            <Link href="/dashboard">
              <ChartNoAxesColumnIncreasing /> Dashboard
            </Link>
          </Button>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Scroll down to review each question.</p>
    </div>
  );
}
