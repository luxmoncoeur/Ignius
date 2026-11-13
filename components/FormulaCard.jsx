// Renders a formula from lib data: fraction (num/den), prefix, suffix or a plain display string.
// Dark "chalkboard" card in both themes; serif math, amber label.
import { cn } from "@/lib/utils";

function Fraction({ num, den }) {
  return (
    <span className="mx-1 inline-flex flex-col items-center align-middle leading-tight">
      <span className="border-b border-white/60 px-1 pb-0.5">{num}</span>
      <span className="px-1 pt-0.5">{den}</span>
    </span>
  );
}

export default function FormulaCard({ f, id, className }) {
  return (
    <div
      id={id}
      className={cn(
        "tw relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-2xl bg-stage p-5 text-slate-200 shadow-sm ring-1 ring-white/5",
        className,
      )}
    >
      <p className="text-sm font-semibold text-amber-300">{f.title || f.name}</p>
      <p className="my-4 font-serif text-2xl leading-snug text-white [font-family:'Cambria_Math','STIX_Two_Math',Cambria,Georgia,serif]">
        {f.display ? (
          <span>{f.display}</span>
        ) : (
          <>
            {f.lhs ? <span>{f.lhs}</span> : null}
            {f.num !== undefined && f.den !== undefined ? <Fraction num={f.num} den={f.den} /> : null}
            {f.suffix ? <span>{f.suffix}</span> : null}
            {f.equals ? <span className="mx-1">{f.equals}</span> : null}
            {f.num2 !== undefined && f.den2 !== undefined ? <Fraction num={f.num2} den={f.den2} /> : null}
          </>
        )}
      </p>
      {f.inWords ? <p className="text-sm leading-relaxed text-slate-300">{f.inWords}</p> : null}
      {f.where ? <p className="mt-2 text-xs leading-relaxed text-slate-400">{f.where}</p> : null}
      {f.useWhen ? (
        <p className="mt-auto pt-3 text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">Use when:</span> {f.useWhen}
        </p>
      ) : null}
    </div>
  );
}
