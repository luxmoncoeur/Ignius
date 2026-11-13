import Image from "next/image";
import Link from "next/link";
import {
  ChartNoAxesColumnIncreasing,
  FlaskConical,
  LogIn,
  Sigma,
  Users,
} from "lucide-react";
import { LESSONS } from "@/lib/lessons";
import { QUIZZES } from "@/lib/quizzes";

const EXPLORE = [
  { href: "/simulations", label: "Simulation Lab", icon: FlaskConical },
  { href: "/formulas", label: "Formula sheet", icon: Sigma },
  { href: "/dashboard", label: "My dashboard", icon: ChartNoAxesColumnIncreasing },
  { href: "/proponents", label: "Proponents", icon: Users },
  { href: "/login", label: "Log in / Register", icon: LogIn },
];

const linkClass =
  "text-slate-300 no-underline transition-colors hover:text-white focus-visible:text-white";

function Column({ title, children, wide = false }) {
  return (
    <div className={wide ? "" : "hidden lg:block"}>
      <h2 className="mb-4 text-sm font-bold text-white">{title}</h2>
      <ul className="grid gap-2.5 text-sm">{children}</ul>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="tw relative mt-16 bg-[var(--footer-bg)] text-slate-300">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link
            href="/welcome"
            className="mb-3 inline-flex items-center gap-2 text-lg font-extrabold text-white no-underline"
          >
            <Image src="/images/brand/calphy-logo.png" alt="" width={34} height={34} />
            Ignius
          </Link>
          <p className="max-w-xs text-sm leading-relaxed">
            Lessons, simulations, and quizzes for the Temperature and Heat unit. Content
            adapted from the CALPHY Finals module.
          </p>
        </div>

        {/* lesson and quiz lists repeat the nav on phones, so they start at lg */}
        <Column title="Lessons">
          {LESSONS.map((lesson) => (
            <li key={lesson.key}>
              <Link href={`/lessons/${lesson.slug}`} className={linkClass}>
                {lesson.n}. {lesson.title}
              </Link>
            </li>
          ))}
        </Column>

        <Column title="Quizzes">
          {QUIZZES.map((quiz) => (
            <li key={quiz.id}>
              <Link href={`/quizzes/${quiz.slug}`} className={linkClass}>
                {quiz.title}
              </Link>
            </li>
          ))}
        </Column>

        <Column title="Explore" wide>
          {EXPLORE.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={`${linkClass} inline-flex items-center gap-2`}>
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </Column>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-slate-400 sm:px-6">
          © {new Date().getFullYear()} Ignius · Temperature &amp; Heat
        </p>
      </div>
    </footer>
  );
}
