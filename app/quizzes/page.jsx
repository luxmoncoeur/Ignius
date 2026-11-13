import QuizCards from "@/components/QuizCards";
import PageHeader, { Page } from "@/components/PageHeader";

export const metadata = {
  title: "Quizzes",
  description:
    "Auto-graded quizzes: one for each of the nine lessons, plus a final exam covering every topic.",
};

export default function QuizzesIndexPage() {
  return (
    <Page>
      <PageHeader
        crumbs={[{ href: "/learn", label: "Home" }, { label: "Quizzes" }]}
        title="Quizzes"
        sub="One quiz per lesson, then a final exam on everything. You see the explanation after each answer, and your best score is kept."
      />
      <QuizCards />
    </Page>
  );
}
