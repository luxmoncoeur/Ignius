// Lesson/quiz status as icon + word, never color alone.
import { CircleCheck, CircleDot, CirclePlay } from "lucide-react";
import { cn } from "@/lib/utils";

const STYLES = {
  Finished: { label: "Done", icon: CircleCheck, className: "bg-good-tint text-good-text" },
  Current: { label: "In progress", icon: CirclePlay, className: "bg-ember-tint text-ember-text" },
  UpNext: { label: "Up next", icon: CircleDot, className: "bg-surface-2 text-ink-soft" },
};

export default function StatusBadge({ status, className }) {
  const style = STYLES[status];
  if (!style) return null;
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        style.className,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {style.label}
    </span>
  );
}
