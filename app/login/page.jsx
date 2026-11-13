import AuthForm from "@/components/AuthForm";
import { Page } from "@/components/PageHeader";

export const metadata = {
  title: "Log in",
  description: "Log in to sync your Ignius progress to your account.",
};

export default function LoginPage() {
  return (
    <Page className="pt-28">
      <AuthForm mode="login" />
    </Page>
  );
}
