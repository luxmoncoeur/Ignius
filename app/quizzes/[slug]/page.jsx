import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Layers } from "lucide-react";
import QuizRunner from "@/components/QuizRunner";
import PageHeader, { Page } from "@/components/PageHeader";
import { QUIZZES, QUIZ_BY_SLUG, quizLabel } from "@/lib/quizzes";
import { LESSONS, LESSON_BY_KEY } from "@/lib/lessons";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const quiz = QUIZ_BY_SLUG[slug];
  if (!quiz) return { title: "Quiz not found" };
  return { title: `Quiz: ${quiz.title}`, description: quiz.description };
}

// Results-screen link: the next lesson, or the final exam after Lesson 9.
function nextStep(quiz) {
  if (quiz.final) return null;
  const lessonKey = quiz.lessons[quiz.lessons.length - 1];
  const next = LESSONS[LESSONS.findIndex((l) => l.key === lessonKey) + 1];
  if (next)
    return {
      href: `/lessons/${next.slug}`,
      label: `Next: Lesson ${next.n} · ${next.title}`,
    };
  const finalExam = QUIZZES.find((q) => q.final);
  return finalExam ? { href: `/quizzes/${finalExam.slug}`, label: "Next: Final exam" } : null;
}

const chip =
  "inline-flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1 text-sm font-semibold text-ink-soft";

export default async function QuizPage({ params }) {
  const { slug } = await params;
  const quiz = QUIZ_BY_SLUG[slug];
  if (!quiz) notFound();

  return (
    <Page>
      <div className="mx-auto max-w-3xl">
        <PageHeader
          className="mb-6"
          crumbs={[
            { href: "/learn", label: "Home" },
            { href: "/quizzes", label: "Quizzes" },
            { label: quizLabel(quiz.id) },
          ]}
          title={quiz.title}
          sub={quiz.description}
        />
        <div className="mb-6 flex flex-wrap gap-2">
          {quiz.final && (
            <span className={chip}>
              <Layers className="size-4 text-ember-text" aria-hidden="true" /> Covers all {LESSONS.length} lessons
            </span>
          )}
          {quiz.lessons.map((key) => {
            const lesson = LESSON_BY_KEY[key];
            return (
              <Link key={key} href={`/lessons/${lesson.slug}`} className={`${chip} hover:border-ember hover:text-ink`}>
                <BookOpen className="size-4 text-cool" aria-hidden="true" /> Review Lesson {lesson.n}
              </Link>
            );
          })}
        </div>
      </div>
      <QuizRunner quiz={quiz} next={nextStep(quiz)} />
    </Page>
  );
}
