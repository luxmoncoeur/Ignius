import Link from "next/link";
import { BookOpen, FlaskConical, House } from "lucide-react";
import CalphyMascot from "@/components/CalphyMascot";
import { Page } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Page className="grid min-h-[70vh] place-items-center pt-28 text-center">
      <div className="max-w-lg">
        <div className="mb-4 flex justify-center">
          <CalphyMascot size={120} mood="think" />
        </div>
        <p className="text-thermal text-[clamp(3rem,10vw,5.5rem)] font-extrabold leading-none tabular-nums">404</p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Absolute zero… nothing here!</h1>
        <p className="mt-2 text-ink-soft">
          Cinder checked every particle. The page you want must be at another temperature.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild className="rounded-full">
            <Link href="/learn">
              <House /> Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/lessons">
              <BookOpen /> Lessons
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/simulations">
              <FlaskConical /> Simulations
            </Link>
          </Button>
        </div>
      </div>
    </Page>
  );
}
