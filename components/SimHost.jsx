"use client";

// Dynamically loads a simulation canvas component by name (client-side only).
// Components and optional 3D scenes are declared in components/sims/registry.js.
import dynamic from "next/dynamic";
import { SimViewContext } from "./sims/SimViewContext";
import { SIM_REGISTRY } from "./sims/registry";

const SimLoading = () => (
  <div className="tw overflow-hidden rounded-2xl bg-surface" role="status" aria-label="Loading simulation">
    <div className="flex items-center gap-2 border-b px-4 py-3">
      <span className="size-2 animate-pulse rounded-full bg-ember" aria-hidden="true" />
      <span className="h-4 w-40 animate-pulse rounded bg-surface-2" />
    </div>
    <div className="grid min-h-80 place-items-center bg-stage text-sm text-slate-300">Warming up the particles…</div>
  </div>
);

const load = (loader) => dynamic(loader, { ssr: false, loading: SimLoading });

const SIMS = Object.fromEntries(
  Object.entries(SIM_REGISTRY).map(([name, entry]) => [
    name,
    {
      Comp: load(entry.load2d),
      view: { name, load3d: entry.load3d, views: entry.views },
    },
  ]),
);

export default function SimHost({ name, ...props }) {
  const sim = SIMS[name];
  if (!sim) return null;
  const { Comp, view } = sim;
  return (
    <SimViewContext.Provider value={view}>
      <Comp {...props} />
    </SimViewContext.Provider>
  );
}

export const SIM_NAMES = Object.keys(SIMS);
