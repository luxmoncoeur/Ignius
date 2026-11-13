"use client";

// Landing buttons. Either one marks the visit, so / skips to /learn next time.
// `stay` (on /welcome) keeps returning visitors here instead of redirecting.
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasVisited, markVisited, MAIN_HREF } from "@/lib/visit";

export default function LandingActions({ stay = false }) {
  const router = useRouter();

  // the inline script only runs on a full page load; this covers client navigation
  useEffect(() => {
    if (!stay && hasVisited()) router.replace(MAIN_HREF);
  }, [router, stay]);

  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
        <Link href={MAIN_HREF} onClick={markVisited}>
          Start learning <ArrowRight />
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline" className="h-12 rounded-full bg-surface px-6 text-base">
        <Link href="/lessons/temperature-scales" onClick={markVisited}>
          <BookOpen /> Jump into Lesson 1
        </Link>
      </Button>
    </div>
  );
}
