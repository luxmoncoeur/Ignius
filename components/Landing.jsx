// Landing content, shared by / (first visit only) and /welcome (the logo's
// link, always reachable). `stay` turns off the skip-to-/learn redirect.
import LandingActions from "@/components/LandingActions";
import HowToUse from "@/components/HowToUse";
import CalphyStage from "@/components/CalphyStage";
import HeroCalphy from "@/components/HeroCalphy";
import HeroHeadline from "@/components/HeroHeadline";
import UnitsOverview from "@/components/UnitsOverview";
import { LESSONS } from "@/lib/lessons";
import { QUIZZES } from "@/lib/quizzes";
import { SIM_GROUPS } from "@/lib/simulations";

const HEADLINE = [
  { text: "Learn" },
  { text: "Temperature", hot: true },
  { text: "&", hot: true },
  { text: "Heat", hot: true },
  { text: "by" },
  { text: "playing" },
  { text: "with" },
  { text: "it." },
];

const simCount = SIM_GROUPS.reduce((sum, group) => sum + group.sims.length, 0);
const COUNTS = [
  [LESSONS.length, "lessons"],
  [simCount, "simulations"],
  [QUIZZES.length, "quizzes"],
];

export default function Landing({ stay = false }) {
  return (
    <>
      <section className="tw relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 lg:pb-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-sm font-semibold text-ink-soft">
              <span className="bg-thermal size-2 rounded-full" aria-hidden="true" />
              Physics · Thermal physics
            </p>
            <HeroHeadline words={HEADLINE} className="mb-5 max-w-[17ch] text-balance" />
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-ink-soft">
              Short lessons with simulations you can drag, from thermometers to gas laws.
              Ask Cinder when you get stuck.
            </p>
            <LandingActions stay={stay} />
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {COUNTS.map(([count, label]) => (
                <li key={label} className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tabular-nums text-ink">{count}</span>
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <CalphyStage className="hero-stage">
            <HeroCalphy />
          </CalphyStage>
        </div>
      </section>
      <HowToUse />
      <UnitsOverview />
    </>
  );
}
