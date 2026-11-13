"use client";

// ============================================================
// Once per browser session, a guest who has started making progress is
// asked to log in or sign up so that progress is saved to their account.
// Dismissing it keeps them in guest mode until the next session.
// ============================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloudCheck } from "lucide-react";
import { useUser } from "@/components/UserContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { hasProgress } from "@/lib/progress";

const SESSION_KEY = "calphy-save-prompt-shown";
const SHOW_DELAY_MS = 1200;
// auth pages already ask; quizzes shouldn't be interrupted mid-attempt
const QUIET_PATHS = ["/login", "/register", "/quizzes/"];

function alreadyShown() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return true; // storage blocked: never nag
  }
}

function markShown() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* storage blocked, nothing to remember */
  }
}

export default function SaveProgressPrompt() {
  const { authLoading, isLoggedIn, progress } = useUser();
  const pathname = usePathname() || "";
  const [show, setShow] = useState(false);

  const quiet = QUIET_PATHS.some((p) => pathname.startsWith(p));
  const eligible =
    !authLoading && !isLoggedIn && !quiet && hasProgress(progress);

  useEffect(() => {
    if (!eligible || alreadyShown()) return;
    const timer = window.setTimeout(() => {
      markShown();
      setShow(true);
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [eligible]);

  const close = () => setShow(false);

  return (
    <Dialog open={show && !isLoggedIn} onOpenChange={setShow}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-ink">
            <CloudCheck className="size-5 text-ember-text" aria-hidden="true" />
            Save your progress
          </DialogTitle>
          <DialogDescription className="leading-relaxed text-ink-soft">
            You&apos;re learning as a guest, so your lessons and quiz scores are kept on this device only.
            Log in or create a free account to keep them on your dashboard wherever you sign in.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" className="rounded-full" onClick={close}>
            Maybe later
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/register" onClick={close}>
              Sign up
            </Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/login" onClick={close}>
              Log in
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
