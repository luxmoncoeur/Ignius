import AuthForm from "@/components/AuthForm";
import { Page } from "@/components/PageHeader";

export const metadata = {
  title: "Register",
  description: "Create an Ignius account to save lesson progress and quiz scores.",
};

export default function RegisterPage() {
  return (
    <Page className="pt-28">
      <AuthForm mode="register" />
    </Page>
  );
}
