// Top of a hub page: breadcrumb, title, one-line intro. Pages wrap their
// content in <Page> so width, side padding and the navbar offset match.
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Page({ className, children }) {
  return (
    <div className={cn("tw mx-auto w-full max-w-7xl px-4 pt-24 pb-20 sm:px-6", className)}>
      {children}
    </div>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map(({ href, label }, index) => {
          const last = index === items.length - 1;
          return (
            <li key={label} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="font-semibold text-ink-soft">
                  {label}
                </span>
              ) : (
                <>
                  <Link href={href} className="text-cool hover:underline">
                    {label}
                  </Link>
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function PageHeader({ crumbs, title, sub, actions, className }) {
  return (
    <header className={cn("mb-10", className)}>
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-[clamp(2rem,4vw,2.9rem)] font-extrabold leading-tight tracking-tight text-ink">
            {title}
          </h1>
          {sub && <p className="mt-3 text-lg leading-relaxed text-ink-soft">{sub}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
