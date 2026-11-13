import LearnHome from "@/components/LearnHome";
import { Page } from "@/components/PageHeader";

export const metadata = {
  title: "Learn",
  description:
    "Pick up where you left off: nine lessons on temperature and heat in five units.",
};

export default function LearnPage() {
  return (
    <Page>
      <LearnHome />
    </Page>
  );
}
