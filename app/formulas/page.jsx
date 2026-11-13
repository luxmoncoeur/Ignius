import FormulaExplorer from "@/components/FormulaExplorer";
import PageHeader, { Page } from "@/components/PageHeader";

export const metadata = {
  title: "Formulas",
  description:
    "The complete formula sheet: every equation and constant from all nine lessons, with guidance on when to use each.",
};

export default function FormulasPage() {
  return (
    <Page>
      <PageHeader
        crumbs={[{ href: "/learn", label: "Home" }, { label: "Formulas" }]}
        title={
          <>
            Every formula. <span className="text-ember-text">One page.</span>
          </>
        }
        sub="The module's formula sheet plus the constants box. Each card says when to use it, in words, and what every symbol means."
      />
      <FormulaExplorer />
    </Page>
  );
}
