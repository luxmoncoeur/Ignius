"use client";

// /formulas: quick sheet, constants and per-lesson formulas in tabs, with a
// filter box that searches names, symbols and "use when" text.
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, Check, Copy, Search } from "lucide-react";
import FormulaCard from "@/components/FormulaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONSTANTS_BOX, FORMULA_SHEET, LESSONS } from "@/lib/lessons";
import { slugify } from "@/lib/search";

const norm = (text) => (text || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
const formulaText = (f) =>
  [f.title, f.name, f.display, f.lhs, f.num, f.den, f.inWords, f.where, f.useWhen].filter(Boolean).join(" ");

function CopyFormula({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-surface-2 hover:text-ink"
      aria-label={copied ? "Copied" : "Copy formula"}
    >
      {copied ? <Check className="size-3.5 text-good-text" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Empty({ query }) {
  return (
    <p className="rounded-2xl border border-dashed p-8 text-center text-ink-soft">
      No formula matches “{query}”. Try a symbol like <b>Q</b>, <b>ΔT</b> or a word like <b>latent</b>.
    </p>
  );
}

export default function FormulaExplorer() {
  const [query, setQuery] = useState("");
  const q = norm(query.trim());

  const sheet = useMemo(
    () => FORMULA_SHEET.filter((f) => !q || norm(formulaText(f)).includes(q)),
    [q],
  );
  const lessons = useMemo(
    () =>
      LESSONS.map((lesson) => ({
        lesson,
        formulas: lesson.formulas.filter((f) => !q || norm(`${lesson.title} ${formulaText(f)}`).includes(q)),
      })).filter(({ formulas }) => formulas.length),
    [q],
  );
  const constants = useMemo(
    () => CONSTANTS_BOX.filter(([name, value]) => !q || norm(`${name} ${value}`).includes(q)),
    [q],
  );

  return (
    <Tabs defaultValue="sheet" className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList className="h-11 rounded-full p-1">
          <TabsTrigger value="sheet" className="rounded-full px-4">
            Quick sheet
          </TabsTrigger>
          <TabsTrigger value="lessons" className="rounded-full px-4">
            By lesson
          </TabsTrigger>
          <TabsTrigger value="constants" className="rounded-full px-4">
            Constants
          </TabsTrigger>
        </TabsList>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Filter formulas</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter: Q, latent, kelvin…"
            className="h-11 w-full rounded-full border bg-surface pr-4 pl-10 text-sm text-ink outline-none placeholder:text-muted-foreground focus:border-ember"
          />
        </label>
      </div>

      <TabsContent value="sheet">
        {sheet.length ? (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sheet.map((f) => (
              <li
                key={f.name}
                id={`formula-${slugify(f.name)}`}
                className="flex scroll-mt-28 flex-col rounded-2xl bg-surface p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 font-bold text-ink">
                    <Calculator className="size-4 text-ember-text" aria-hidden="true" />
                    {f.name}
                  </h2>
                  <CopyFormula text={f.display} />
                </div>
                <p className="rounded-xl bg-stage px-4 py-3 text-lg leading-relaxed text-white [font-family:'Cambria_Math','STIX_Two_Math',Cambria,Georgia,serif]">
                  {f.display}
                </p>
                <p className="mt-3 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">Use when:</span> {f.useWhen}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <Empty query={query} />
        )}
      </TabsContent>

      <TabsContent value="lessons" className="grid gap-10">
        {lessons.length ? (
          lessons.map(({ lesson, formulas }) => (
            <section key={lesson.key} aria-labelledby={`f-${lesson.slug}`}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-ember-tint px-3 py-1 text-sm font-semibold text-ember-text">
                  Lesson {lesson.n}
                </span>
                <h2 id={`f-${lesson.slug}`} className="text-xl font-bold text-ink">
                  {lesson.title}
                </h2>
                <Link
                  href={`/lessons/${lesson.slug}#formulas`}
                  className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-cool hover:underline"
                >
                  Open lesson <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {formulas.map((f, i) => (
                  <FormulaCard key={i} f={f} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <Empty query={query} />
        )}
      </TabsContent>

      <TabsContent value="constants">
        {constants.length ? (
          <div className="overflow-hidden rounded-2xl bg-surface">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Physical constants used in the course</caption>
              <tbody>
                {constants.map(([name, value]) => (
                  <tr key={name} className="border-b last:border-0">
                    <th scope="row" className="w-[45%] px-5 py-3 font-semibold text-ink">
                      {name}
                    </th>
                    <td className="px-5 py-3 text-ink-soft tabular-nums">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty query={query} />
        )}
      </TabsContent>
    </Tabs>
  );
}
