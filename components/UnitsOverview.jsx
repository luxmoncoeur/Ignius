// Landing: the five units laid out cold → hot, each tinted by its place on
// the thermal gradient and linking to its first lesson.
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import SectionHead from "@/components/SectionHead";
import { LESSON_BY_KEY, UNITS } from "@/lib/lessons";
import { DataIcon } from "@/lib/icons";
import { thermalAt } from "@/lib/thermal";

export default function UnitsOverview() {
  return (
    <section className="tw mx-auto max-w-7xl px-4 pb-24 sm:px-6" aria-labelledby="units-title">
      <SectionHead
        id="units-title"
        icon={Layers}
        tag="The course"
        title={
          <>
            {UNITS.length} units, <span className="text-ember-text">cold to hot.</span>
          </>
        }
        sub="Follow them in order, or jump to whatever your class is on."
      />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {UNITS.map((unit, index) => {
          const lessons = unit.lessons.map((key) => LESSON_BY_KEY[key]);
          return (
            <li key={unit.id} style={{ "--unit": thermalAt(index / (UNITS.length - 1)) }}>
              <Link
                href={`/lessons/${lessons[0].slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface p-5 no-underline shadow-xs transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="mb-4 flex items-center justify-between">
                  <span
                    className="grid size-10 place-items-center rounded-xl"
                    style={{ background: "color-mix(in srgb, var(--unit) 16%, transparent)" }}
                    aria-hidden="true"
                  >
                    <DataIcon name={unit.icon} className="size-5 text-ink" />
                  </span>
                  <span className="text-4xl font-extrabold text-surface-2 tabular-nums" aria-hidden="true">
                    {index + 1}
                  </span>
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Unit {index + 1} · {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                </span>
                <span className="mt-1 text-lg font-bold leading-snug text-ink">{unit.title}</span>
                <span className="mt-2 text-sm leading-relaxed text-ink-soft">{unit.subtitle}</span>
                <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-ember-text">
                  Start unit
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
