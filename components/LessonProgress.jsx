"use client";

// ============================================================
// LessonProgressControls, marks the lesson "Current" on first
// visit, offers "Mark as complete", and shows prev/next links.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { CircleCheck, Flag } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserContext";
import { Button } from "@/components/ui/button";
import { lessonStatus, markLesson, readLocal } from "@/lib/progress";

export function LessonTracker({ lessonKey }) {
  const did = useRef(false);
  const { isLoggedIn } = useUser();
  useEffect(() => {
    if (did.current) return;
    did.current = true;
    // read storage directly: on a full page load this effect runs before
    // UserProvider has loaded progress, so context would say "NotStarted"
    if (lessonStatus(readLocal(), lessonKey) === "NotStarted") {
      markLesson(lessonKey, "Current", isLoggedIn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function MarkCompleteButton({ lessonKey }) {
  const { progress, isLoggedIn } = useUser();
  const status = lessonStatus(progress, lessonKey);
  const [celebrating, setCelebrating] = useState(false);

  const onClick = async () => {
    if (status === "Finished") return;
    await markLesson(lessonKey, "Finished", isLoggedIn);
    toast.success("Lesson complete", {
      description: isLoggedIn ? "Saved to your account." : "Saved in this browser.",
    });
    setCelebrating(true);
    window.setTimeout(() => setCelebrating(false), 2400);
  };

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      {celebrating &&
        Array.from({ length: 18 }, (_, index) => (
          <span
            key={index}
            className="confetti-piece"
            aria-hidden="true"
            style={{
              left: `${(index * 37) % 100}%`,
              width: `${6 + (index % 3) * 2}px`,
              height: `${8 + (index % 4) * 2}px`,
              backgroundColor: [
                "var(--ember)",
                "var(--flame-glow)",
                "var(--cool)",
              ][index % 3],
              animationDuration: `${1.8 + (index % 4) * 0.14}s`,
              animationDelay: `${(index % 6) * 0.06}s`,
            }}
          />
        ))}
      <Button
        onClick={onClick}
        disabled={status === "Finished"}
        variant={status === "Finished" ? "secondary" : "default"}
        className="h-11 rounded-full px-5 disabled:opacity-100"
      >
        {status === "Finished" ? (
          <>
            <CircleCheck className="text-good-text" /> Lesson completed
          </>
        ) : (
          <>
            <Flag /> Mark lesson as complete
          </>
        )}
      </Button>
    </div>
  );
}
