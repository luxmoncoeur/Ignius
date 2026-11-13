"use client";

import { useEffect, useState } from "react";
import { BookOpen, LayoutGrid } from "lucide-react";
import SimHost from "@/components/SimHost";
import { SIM_GROUPS } from "@/lib/simulations";
import { DataIcon, iconFor } from "@/lib/icons";
import { cn } from "@/lib/utils";

const TOTAL = SIM_GROUPS.reduce((acc, g) => acc + g.sims.length, 0);
const groupOf = (anchor) => SIM_GROUPS.find((g) => g.sims.some((s) => s.anchor === anchor));
const scrollToSim = (anchor) =>
  setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);

function FilterPill({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
        active ? "border-ember bg-ember-tint text-ember-text" : "bg-surface text-ink-soft hover:border-ember hover:text-ink",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
      <span className="rounded-full bg-surface-2 px-1.5 text-xs text-ink-soft tabular-nums">{count}</span>
    </button>
  );
}

export default function SimulationsLab() {
  const [activeGroup, setActiveGroup] = useState("all");

  // a hash like #conduction opens that sim's group and scrolls to it
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      const group = hash && groupOf(hash);
      if (group) {
        setActiveGroup(group.id);
        scrollToSim(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const jump = (event) => {
    const anchor = event.target.value;
    if (!anchor) return;
    const group = groupOf(anchor);
    if (group && activeGroup !== "all" && activeGroup !== group.id) setActiveGroup(group.id);
    scrollToSim(anchor);
  };

  const visibleGroups = activeGroup === "all" ? SIM_GROUPS : SIM_GROUPS.filter((g) => g.id === activeGroup);

  return (
    <div className="tw">
      <div
        className="sticky top-16 z-30 -mx-4 mb-8 flex flex-wrap items-center gap-3 border-b bg-bg px-4 py-3 sm:-mx-6 sm:px-6"
        role="toolbar"
        aria-label="Simulation categories"
      >
        <div className="-my-1 flex flex-1 gap-2 overflow-x-auto py-1 [scrollbar-width:none]">
          <FilterPill
            active={activeGroup === "all"}
            onClick={() => setActiveGroup("all")}
            icon={LayoutGrid}
            label="All"
            count={TOTAL}
          />
          {SIM_GROUPS.map((g) => (
            <FilterPill
              key={g.id}
              active={activeGroup === g.id}
              onClick={() => setActiveGroup(g.id)}
              icon={iconFor(g.icon)}
              label={g.title.split("&")[0].trim()}
              count={g.sims.length}
            />
          ))}
        </div>
        <label className="w-full sm:w-64">
          <span className="sr-only">Jump to a simulation</span>
          <select
            onChange={jump}
            defaultValue=""
            className="h-10 w-full rounded-full border bg-surface px-4 text-sm text-ink outline-none focus:border-ember"
          >
            <option value="" disabled>
              Jump to a machine…
            </option>
            {SIM_GROUPS.map((g) => (
              <optgroup key={g.id} label={g.title}>
                {g.sims.map((s) => (
                  <option key={s.anchor} value={s.anchor}>
                    {s.title} ({s.lesson})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-14">
        {visibleGroups.map((g) => {
          return (
            <section key={g.id} aria-labelledby={`${g.id}-title`}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-ember-tint text-ember-text" aria-hidden="true">
                  <DataIcon name={g.icon} className="size-5" />
                </span>
                <div>
                  <h2 id={`${g.id}-title`} className="text-2xl font-bold text-ink">
                    {g.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{g.blurb}</p>
                </div>
              </div>
              <div className="grid gap-8">
                {g.sims.map((s) => (
                  <div key={s.anchor} id={s.anchor} className="scroll-mt-36">
                    <SimHost name={s.name} />
                    <p className="mt-2 flex flex-wrap items-center gap-2 px-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
                        <BookOpen className="size-3.5" aria-hidden="true" /> {s.lesson}
                      </span>
                      {s.caption}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
