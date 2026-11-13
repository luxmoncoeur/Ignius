import LessonGrid from "@/components/LessonGrid";
import PageHeader, { Page } from "@/components/PageHeader";
import { LESSONS, UNITS } from "@/lib/lessons";

export const metadata = {
  title: "Lessons",
  description:
    "Nine interactive lessons on Temperature and Heat, grouped into five units with simulations, videos and mini-quizzes.",
};

export default function LessonsIndexPage() {
  return (
    <Page>
      <PageHeader
        crumbs={[{ href: "/learn", label: "Home" }, { label: "Lessons" }]}
        title="Lessons"
        sub={`${LESSONS.length} lessons in ${UNITS.length} units, from cold to hot. Follow them in order, or jump to any lesson.`}
      />
      <LessonGrid />
    </Page>
  );
}
