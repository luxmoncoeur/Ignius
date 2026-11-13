// Progress bar on a thermometer-scale track, filled with the thermal gradient.
import { cn } from "@/lib/utils";

export default function ThermalProgress({ value, max = 100, label, className }) {
  const percent = max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("relative h-2.5 overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div className="bg-ticks absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${percent}%` }}
      >
        {/* the gradient spans the full track, so a half bar is only half "hot" */}
        <div className="bg-thermal h-full" style={{ width: percent ? `${10000 / percent}%` : 0 }} />
      </div>
    </div>
  );
}
