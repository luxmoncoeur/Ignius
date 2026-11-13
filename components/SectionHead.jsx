// Section opener: small tag, heading, one-line context. `icon` is a lucide
// component or (for older call sites) a Bootstrap Icons name.
// `actions` sits on the right and wraps under on phones.
import { cn } from "@/lib/utils";

export default function SectionHead({ id, icon: Icon, tag, title, sub, actions, className }) {
  return (
    <div className={cn("tw mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0 max-w-2xl">
        <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ember-text">
          {typeof Icon === "string" ? (
            <i className={`bi ${Icon}`} aria-hidden="true" />
          ) : Icon ? (
            <Icon className="size-4" aria-hidden="true" />
          ) : null}
          {tag}
        </p>
        <h2 id={id} className="text-[clamp(1.6rem,3.2vw,2.3rem)] font-extrabold leading-tight tracking-tight text-ink">
          {title}
        </h2>
        {sub ? <p className="mt-2 text-base leading-relaxed text-ink-soft">{sub}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
