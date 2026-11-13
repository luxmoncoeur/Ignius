"use client";

// Horizontal strip of simulation previews for /learn. The images are
// captures of each sim's 2D stage (public/images/sims/<anchor>.jpg);
// re-capture them if a sim's look changes.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import SectionHead from "@/components/SectionHead";
import { Button } from "@/components/ui/button";
import { SIM_GROUPS } from "@/lib/simulations";

const SIMS = SIM_GROUPS.flatMap((g) => g.sims);

export default function SimPreviewStrip() {
  const stripRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const strip = stripRef.current;
    const update = () =>
      setEdges({
        start: strip.scrollLeft <= 8,
        end: strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 8,
      });
    update();
    strip.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      strip.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // mouse users on macOS get no visible scrollbar, so the buttons page by one card
  const page = (dir) => {
    const strip = stripRef.current;
    const card = strip.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 16 : 300;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollBy({ left: dir * step, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <section className="tw" aria-labelledby="sim-strip-title">
      <SectionHead
        id="sim-strip-title"
        icon={FlaskConical}
        tag="Simulation lab"
        title={
          <>
            Don&apos;t just read physics. <span className="text-ember-text">Touch it.</span>
          </>
        }
        sub="Every lesson has a simulation that runs in your browser. Pick one to jump straight in."
        actions={
          <>
            <Button asChild variant="ghost" className="rounded-full text-ember-text">
              <Link href="/simulations">
                Open the lab <ArrowRight />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden size-10 rounded-full md:inline-flex"
              onClick={() => page(-1)}
              disabled={edges.start}
              aria-label="Previous simulations"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden size-10 rounded-full md:inline-flex"
              onClick={() => page(1)}
              disabled={edges.end}
              aria-label="Next simulations"
            >
              <ChevronRight />
            </Button>
          </>
        }
      />
      <ul
        ref={stripRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:thin] sm:-mx-6 sm:scroll-px-6 sm:px-6"
      >
        {SIMS.map((sim) => (
          <li key={sim.anchor} className="w-[min(78vw,20rem)] shrink-0 snap-start">
            <Link
              href={`/simulations#${sim.anchor}`}
              className="group block h-full overflow-hidden rounded-2xl bg-surface no-underline shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-ember hover:shadow-md"
            >
              <span className="block overflow-hidden bg-stage">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/sims/${sim.anchor}.jpg`}
                  alt=""
                  loading="lazy"
                  width={720}
                  height={315}
                  className="aspect-[16/7] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </span>
              <span className="block p-4">
                <span className="block font-bold leading-snug text-ink">{sim.title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{sim.lesson}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
