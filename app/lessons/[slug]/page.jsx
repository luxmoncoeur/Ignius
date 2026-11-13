import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  BookMarked,
  Calculator,
  CircleCheck,
  CircleHelp,
  Compass,
  ExternalLink,
  FlaskConical,
  PencilLine,
  PlayCircle,
  Target,
  TextQuote,
  TriangleAlert,
} from "lucide-react";
import FormulaCard from "@/components/FormulaCard";
import MiniQuiz from "@/components/MiniQuiz";
import SimHost from "@/components/SimHost";
import VideoEmbed from "@/components/VideoEmbed";
import LessonToc, { ReadingProgress } from "@/components/LessonToc";
import { Breadcrumbs } from "@/components/PageHeader";
import { LessonTracker, MarkCompleteButton } from "@/components/LessonProgress";
import { Button } from "@/components/ui/button";
import { LESSONS, UNITS, getLesson, getUnit } from "@/lib/lessons";
import { PASS_PERCENT } from "@/lib/quizzes";
import { slugify } from "@/lib/search";
import { DataIcon } from "@/lib/icons";
import { thermalAt } from "@/lib/thermal";

// each trace step jumps to the part of the page that covers it
const TRACE_TARGETS = ["#sim", "#content", "#formulas"];

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: `Lesson ${lesson.n}: ${lesson.title}`,
    description: lesson.tagline,
  };
}

function Section({ id, icon: Icon, title, children, className = "" }) {
  return (
    <section id={id} className={`scroll-mt-28 ${className}`} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="mb-4 flex items-center gap-2.5 text-2xl font-bold tracking-tight text-ink">
        <span className="grid size-9 place-items-center rounded-xl bg-ember-tint text-ember-text" aria-hidden="true">
          <Icon className="size-[1.15rem]" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function DataTable({ headers, rows, caption }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        {headers && (
          <thead className="bg-surface-2 text-ink">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="px-3.5 py-2.5 font-semibold" colSpan={headers.length === 1 ? 2 : undefined}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t">
              {row.map((cell, j) => (
                <td key={j} className={`px-3.5 py-2.5 ${j === 0 ? "font-semibold text-ink" : "text-ink-soft"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentBlock({ s }) {
  return (
    <article id={`section-${slugify(s.heading)}`} className="scroll-mt-28 rounded-2xl bg-surface p-5 sm:p-6">
      <h3 className="mb-3 text-lg font-bold text-ink">{s.heading}</h3>
      <div className="grid gap-3 leading-[1.75] text-ink-soft">
        {s.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
        {s.bullets && (
          <ul className="grid list-disc gap-1.5 pl-5 marker:text-ember-text">
            {s.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
        {s.steps && (
          <ol className="grid gap-2">
            {s.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold text-ink">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
        {s.formulasInline && (
          <div className="flex flex-wrap gap-2">
            {s.formulasInline.map((f, i) => (
              <span key={i} className="rounded-lg bg-stage px-3 py-1.5 font-semibold text-amber-200 [font-family:'Cambria_Math',Cambria,Georgia,serif]">
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
      {s.table && <DataTable headers={s.table.headers} rows={s.table.rows} caption={s.heading} />}
    </article>
  );
}

export default async function LessonPage({ params }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const unit = getUnit(lesson.unit);
  const unitIndex = UNITS.findIndex((u) => u.id === lesson.unit);
  const idx = LESSONS.findIndex((l) => l.slug === lesson.slug);
  const prev = LESSONS[idx - 1];

  const toc = [
    { id: "overview", label: "Overview" },
    { id: "sim", label: "Try it yourself" },
    { id: "terms", label: "Key terms" },
    { id: "content", label: "Main content" },
    { id: "formulas", label: "Formulas" },
    { id: "examples", label: "Worked examples" },
    { id: "watch-out", label: "Watch out & takeaways" },
    { id: "video", label: "Video" },
    { id: "check", label: "Check yourself" },
  ];

  return (
    <div className="tw" style={{ "--unit": thermalAt(unitIndex / (UNITS.length - 1)) }}>
      <LessonTracker lessonKey={lesson.key} />
      <ReadingProgress />

      <header className="mx-auto max-w-7xl px-4 pt-24 pb-10 sm:px-6">
        <Breadcrumbs
          items={[
            { href: "/learn", label: "Home" },
            { href: "/lessons", label: "Lessons" },
            { label: `Lesson ${lesson.n}` },
          ]}
        />
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
          <div>
            <Link
              href={`/lessons#${unit.id}`}
              className="mb-4 inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-sm font-semibold text-ink-soft hover:text-ink"
            >
              <span className="size-2 rounded-full" style={{ background: "var(--unit)" }} aria-hidden="true" />
              Unit {unitIndex + 1} · {unit.title}
            </Link>
            <h1 className="text-[clamp(2rem,4.4vw,3.2rem)] font-extrabold leading-[1.1] tracking-tight text-ink">
              <span className="text-ember-text">Lesson {lesson.n}.</span> {lesson.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">{lesson.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <MarkCompleteButton lessonKey={lesson.key} />
              <Button asChild variant="outline" className="h-11 rounded-full bg-surface px-5">
                <Link href={`/quizzes/${lesson.quizSlug}`}>
                  <CircleHelp /> Take the quiz
                </Link>
              </Button>
            </div>
          </div>

          <nav className="rounded-2xl bg-surface p-4" aria-label="Trace the energy">
            <p className="mb-3 flex items-center gap-2 font-bold text-ink">
              <span className="grid size-9 place-items-center rounded-xl bg-ember-tint text-ember-text" aria-hidden="true">
                <DataIcon name={lesson.icon} className="size-[1.15rem]" />
              </span>
              Trace the energy
            </p>
            <ol className="grid gap-1">
              {lesson.energyTrace.map((step, i) => (
                <li key={i}>
                  <a
                    href={TRACE_TARGETS[i] || "#content"}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
                  >
                    <span
                      className="grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold text-[#0b1220]"
                      style={{ background: thermalAt(i / Math.max(1, lesson.energyTrace.length - 1)) }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                    <ArrowDown className="size-4 opacity-50 group-hover:opacity-100" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="grid min-w-0 gap-14">
          <Section id="overview" icon={Compass} title="Overview">
            <div className="grid gap-4 lg:grid-cols-[7fr_5fr]">
              <p className="rounded-2xl bg-surface p-5 leading-[1.8] text-ink-soft sm:p-6">{lesson.overview}</p>
              <div className="rounded-2xl bg-surface p-5 sm:p-6">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-ink">
                  <Target className="size-4 text-ember-text" aria-hidden="true" /> What you will learn
                </h3>
                <ul className="grid gap-2 text-ink-soft">
                  {lesson.objectives.map((objective, i) => (
                    <li key={i} className="flex gap-2">
                      <CircleCheck className="mt-1 size-4 shrink-0 text-good-text" aria-hidden="true" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section id="sim" icon={FlaskConical} title="Try it yourself">
            <div className="-mt-2 mb-4 flex justify-end">
              <Link href="/simulations" className="inline-flex items-center gap-1 text-sm font-semibold text-cool hover:underline">
                Open in the lab <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <SimHost name={lesson.sim} />
            {lesson.sim === "ThermometerSim" && (
              <div className="mx-auto mt-6 max-w-lg">
                <SimHost name="UnitConverter" />
              </div>
            )}
          </Section>

          <Section id="terms" icon={BookMarked} title="Key terms">
            <dl className="grid gap-3 sm:grid-cols-2">
              {lesson.keyTerms.map((kt) => (
                <div key={kt.term} className="rounded-xl bg-surface p-4">
                  <dt className="font-bold text-ink">{kt.term}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-soft">{kt.def}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="content" icon={TextQuote} title="Main content">
            <div className="grid gap-4">
              {lesson.sections.map((s, i) => (
                <ContentBlock key={i} s={s} />
              ))}
            </div>
          </Section>

          <Section id="formulas" icon={Calculator} title="Formulas">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lesson.formulas.map((f, i) => (
                <FormulaCard key={i} f={f} />
              ))}
            </div>
            {lesson.constantsTable && (
              <DataTable headers={[lesson.constantsTable.title]} rows={lesson.constantsTable.rows} />
            )}
          </Section>

          <Section id="examples" icon={PencilLine} title="Worked examples">
            <div className="grid gap-4 md:grid-cols-2">
              {lesson.examples.map((ex, i) => (
                <article key={i} className="flex flex-col rounded-2xl bg-surface p-5">
                  <h3 className="mb-3 font-bold text-ink">{ex.title}</h3>
                  <ol className="grid gap-1.5 font-mono text-[0.85rem] leading-relaxed text-ink-soft">
                    {ex.steps.map((step, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-muted-foreground">{j + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 rounded-xl bg-good-tint px-3.5 py-2.5 text-sm font-semibold text-ink">
                    <span className="text-good-text">Answer:</span> {ex.answer}
                  </p>
                  {ex.note && <p className="mt-2 text-sm text-muted-foreground">{ex.note}</p>}
                </article>
              ))}
            </div>
          </Section>

          <section id="watch-out" className="grid scroll-mt-28 gap-4 lg:grid-cols-2" aria-label="Watch out and key takeaways">
            <div className="rounded-2xl border border-ember/40 bg-ember-tint p-5 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-ember-text">
                <TriangleAlert className="size-5" aria-hidden="true" /> Watch out
              </h2>
              <ul className="grid list-disc gap-2 pl-5 leading-relaxed text-ink marker:text-ember-text">
                {lesson.watchOut.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-good/40 bg-good-tint p-5 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-good-text">
                <CircleCheck className="size-5" aria-hidden="true" /> Key takeaways
              </h2>
              <ul className="grid list-disc gap-2 pl-5 leading-relaxed text-ink marker:text-good-text">
                {lesson.takeaways.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <Section id="video" icon={PlayCircle} title={`Watch: ${lesson.video.title}`}>
            <div className="max-w-3xl overflow-hidden rounded-2xl border">
              <VideoEmbed id={lesson.video.id} title={lesson.video.title} />
            </div>
          </Section>

          <section id="check" className="grid scroll-mt-28 gap-4" aria-label="Check yourself">
            <MiniQuiz items={lesson.checks} />
            <div className="relative flex flex-wrap items-center gap-3 overflow-hidden rounded-2xl bg-surface p-5">
              <div className="min-w-52 flex-1">
                <h2 className="text-lg font-bold text-ink">Ready for the quiz?</h2>
                <p className="text-sm text-muted-foreground">Score {PASS_PERCENT}% or higher to complete this lesson.</p>
              </div>
              <MarkCompleteButton lessonKey={lesson.key} />
              <Button asChild className="h-11 rounded-full px-5">
                <Link href={`/quizzes/${lesson.quizSlug}`}>
                  <CircleHelp /> Take the quiz
                </Link>
              </Button>
            </div>
            {/* the way forward is the quiz; its results link to the next lesson */}
            <nav className="grid gap-3 sm:grid-cols-2" aria-label="Lesson navigation">
              {prev ? (
                <Link
                  href={`/lessons/${prev.slug}`}
                  className="group rounded-2xl bg-surface p-4 hover:border-ember"
                >
                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous
                  </span>
                  <span className="mt-1 block font-bold text-ink">
                    Lesson {prev.n}: {prev.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <LessonToc items={toc} />
          </div>
        </aside>
      </div>
    </div>
  );
}
