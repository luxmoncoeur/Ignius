// One answer choice. State is shown with an icon and a word for screen
// readers, never color alone (DESIGN.md: quiz option).
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizOption({ index, children, state = "idle", disabled, onClick, ...props }) {
  const letter = String.fromCharCode(65 + index);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border-2 bg-surface px-3.5 py-3 text-left text-[0.95rem] leading-snug text-ink-soft transition-colors",
        state === "idle" && !disabled && "hover:border-ember hover:bg-ember-tint/40",
        state === "selected" && "border-cool bg-cool-tint text-ink",
        state === "correct" && "border-good bg-good-tint text-ink",
        state === "incorrect" && "border-bad bg-bad-tint text-ink",
        disabled && state === "idle" && "opacity-70",
      )}
      {...props}
    >
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-lg text-sm font-bold",
          state === "correct"
            ? "bg-good text-white"
            : state === "incorrect"
              ? "bg-bad text-white"
              : state === "selected"
                ? "bg-cool text-white"
                : "bg-surface-2 text-ink",
        )}
        aria-hidden="true"
      >
        {state === "correct" ? <Check className="size-4" /> : state === "incorrect" ? <X className="size-4" /> : letter}
      </span>
      <span className="pt-0.5">
        {children}
        {state === "correct" && <span className="sr-only"> (correct answer)</span>}
        {state === "incorrect" && <span className="sr-only"> (your answer, incorrect)</span>}
      </span>
    </button>
  );
}
