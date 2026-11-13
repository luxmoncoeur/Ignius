import SimulationsLab from "@/components/SimulationsLab";
import PageHeader, { Page } from "@/components/PageHeader";

export const metadata = {
  title: "Simulation Lab",
  description:
    "Ten interactive canvas simulations: thermometer, conduction rod, convection pot, radiation glow, heating curve, calorimetry, gas piston and more.",
};

export default function SimulationsPage() {
  return (
    <Page>
      <PageHeader
        crumbs={[{ href: "/learn", label: "Home" }, { label: "Simulations" }]}
        title={
          <>
            Ten playable <span className="text-ember-text">physics machines</span>
          </>
        }
        sub="Every canvas is a live numerical model. Heat diffusion, energy balances and the ideal gas law run in your browser. Drag, slide, drop and pause."
      />
      <SimulationsLab />
    </Page>
  );
}
