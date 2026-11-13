"use client";

// "How to use" strip on the landing: four steps joined by a cold → hot line.
// The first three open their page; the last opens the Cinder chat
// (see the calphy:open-chat listener in CalphyChat).
import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, MessageCircleHeart, SlidersHorizontal } from "lucide-react";
import SectionHead from "@/components/SectionHead";
import { thermalAt } from "@/lib/thermal";

const STEPS = [
  {
    icon: BookOpen,
    title: "Read a lesson",
    text: "Each one is a short read. Start at Lesson 1 or pick any unit.",
    href: "/lessons",
  },
  {
    icon: SlidersHorizontal,
    title: "Drag the simulation",
    text: "Move the sliders and watch the numbers change with you.",
    href: "/simulations",
  },
  {
    icon: CircleCheck,
    title: "Take the quiz",
    text: "Answers are graded right away, with an explanation for each.",
    href: "/quizzes",
  },
  {
    icon: MessageCircleHeart,
    title: "Ask Cinder",
    text: "Tap the flame in the corner for conversions or to find a lesson.",
  },
];

const cardClass =
  "group relative flex h-full w-full flex-col gap-2 rounded-2xl bg-surface p-5 text-left no-underline shadow-xs transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--step)] hover:shadow-md";

function StepBody({ step, n }) {
  const Icon = step.icon;
  return (
    <>
      <span
        className="mb-2 grid size-11 place-items-center rounded-xl text-[#0b1220]"
        style={{ background: "var(--step)" }}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>
      <span className="text-xs font-semibold text-muted-foreground">Step {n}</span>
      <span className="flex items-center gap-1 text-lg font-bold text-ink">
        {step.title}
        <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </span>
      <span className="text-sm leading-relaxed text-ink-soft">{step.text}</span>
    </>
  );
}

export default function HowToUse() {
  const openChat = () => window.dispatchEvent(new Event("calphy:open-chat"));

  return (
    <section className="tw mx-auto max-w-7xl px-4 pb-20 sm:px-6" aria-labelledby="howto-title">
      <SectionHead
        id="howto-title"
        icon="bi-compass"
        tag="How to use"
        title={
          <>
            Four steps, <span className="text-ember-text">no setup.</span>
          </>
        }
      />
      <div className="relative">
        <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} style={{ "--step": thermalAt(index / (STEPS.length - 1)) }}>
              {step.href ? (
                <Link href={step.href} className={cardClass}>
                  <StepBody step={step} n={index + 1} />
                </Link>
              ) : (
                <button type="button" className={cardClass} onClick={openChat}>
                  <StepBody step={step} n={index + 1} />
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        Log in to save your progress to the dashboard. Press
        <kbd className="rounded border bg-surface-2 px-1.5 font-mono text-xs text-ink-soft">/</kbd>
        anywhere to search.
      </p>
    </section>
  );
}
