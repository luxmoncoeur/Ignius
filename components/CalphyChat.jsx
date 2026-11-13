"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  Copy,
  Globe,
  Info,
  RotateCcw,
  Square,
  SquarePen,
  X,
} from "lucide-react";
import CalphyMascot from "@/components/CalphyMascot";
import { useUser } from "@/components/UserContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LESSON_BY_SLUG, LESSONS } from "@/lib/lessons";
import useCinderChat from "@/lib/useCinderChat";
import { cn } from "@/lib/utils";

function normalizeMathDelimiters(text) {
  return text
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `$$${math}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`)
    .replace(/\\[ \t]*(\r?\n)/g, "  $1")
    .replace(/\^\\circ!?([CF])/g, "{}^\\circ\\!$1");
}

// suggestion chips follow the page you're on
function suggestionsFor(pathname) {
  const slug = pathname.match(/^\/lessons\/([^/]+)/)?.[1];
  const lesson = slug && LESSON_BY_SLUG[slug];
  if (lesson) {
    const next = LESSONS.find((item) => item.n === lesson.n + 1);
    return [
      `Explain ${lesson.title.toLowerCase()} simply`,
      `What formulas are in Lesson ${lesson.n}?`,
      next ? `Preview Lesson ${next.n}` : "Take me to the quizzes",
    ];
  }
  if (pathname.startsWith("/simulations")) {
    return ["Which simulation shows conduction?", "What is a heating curve?", "Convert 300 K to °C"];
  }
  if (pathname.startsWith("/formulas")) {
    return ["When do I use Q = mcΔT?", "What is latent heat?", "Convert 98.6°F to °C"];
  }
  return ["What is specific heat?", "Preview Lesson 5", "Convert 25°C to °F"];
}

// idle thought-bubble lines; "…" beats in between make Cinder look like it's thinking
const IDLE_HINTS = ["Ask Cinder", "Stuck on a formula?", "Need °C → °F fast?", "Want a lesson preview?", "Curious about heat?"];

function IconAction({ label, onClick, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg text-muted-foreground hover:text-ink"
          onClick={onClick}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <IconAction label={copied ? "Copied" : "Copy answer"} onClick={copy}>
      {copied ? <Check className="text-good" /> : <Copy />}
    </IconAction>
  );
}

function Markdown({ text, onLink }) {
  return (
    <div className="cinder-md text-[0.95rem] leading-relaxed text-ink-soft">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        skipHtml
        components={{
          a: ({ href, children }) =>
            href?.startsWith("/") && !href.startsWith("//") ? (
              <Link href={href} onClick={onLink} className="font-semibold text-cool underline underline-offset-2">
                {children}
              </Link>
            ) : (
              <span>{children}</span>
            ),
          img: ({ alt }) => <span>{alt}</span>,
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
        }}
      >
        {normalizeMathDelimiters(text)}
      </ReactMarkdown>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" role="status" aria-label="Cinder is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-ember"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function AssistantMessage({ message, last, busy, onRetry, onConfirm, onLink }) {
  const streaming = busy && last && !message.pending;
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        <CalphyMascot size={28} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-md border bg-surface px-3.5 py-2.5 shadow-xs">
          {message.pending ? (
            <TypingDots />
          ) : (
            <>
              <Markdown text={message.text} onLink={onLink} />
              {streaming && (
                <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-ember" aria-hidden="true" />
              )}
            </>
          )}

          {message.notice && (
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-cool-tint px-2.5 py-1.5 text-xs text-ink-soft" role="status">
              <Info className="mt-px size-3.5 shrink-0 text-cool" aria-hidden="true" />
              {message.notice}
            </p>
          )}

          {message.confirmation && (
            <div className="mt-3 rounded-xl bg-surface-2 p-3" role="group" aria-label="Confirm external web search">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Globe className="size-4" aria-hidden="true" /> Search Google for “{message.confirmation.query}”?
              </p>
              <p className="mt-1 text-xs text-ink-soft">{message.confirmation.description}</p>
              <div className="mt-3 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => onConfirm(message.id, false)}>
                  No thanks
                </Button>
                <Button size="sm" onClick={() => onConfirm(message.id, true)}>
                  Search the web
                </Button>
              </div>
            </div>
          )}

          {message.externalSearchUrl && (
            <a
              href={message.externalSearchUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-cool"
            >
              Open web search <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        {(message.sources?.length > 0 || message.links?.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.sources?.map((source) => (
              <Link
                key={`s-${source.href}`}
                href={source.href}
                onClick={onLink}
                className="inline-flex items-center gap-1 rounded-full border bg-surface px-2.5 py-1 text-xs font-semibold text-ink-soft no-underline hover:border-ember hover:text-ember-text"
              >
                <BookOpen className="size-3.5" aria-hidden="true" />
                {source.title}
              </Link>
            ))}
            {message.links?.slice(0, 3).map((link) => (
              <Link
                key={`l-${link.href}-${link.label}`}
                href={link.href}
                onClick={onLink}
                className="inline-flex items-center gap-1 rounded-full bg-ember-tint px-2.5 py-1 text-xs font-semibold text-ember-text no-underline hover:underline"
              >
                {link.label}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}

        {!message.pending && !streaming && message.id !== "greeting" && (
          <div className="mt-1 flex gap-0.5">
            <CopyButton text={message.text} />
            <IconAction label="Ask again" onClick={() => onRetry(message.id)}>
              <RotateCcw />
            </IconAction>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalphyChat() {
  const { user } = useUser();
  const viewer = user ? `user:${user.id}` : "guest";
  const { messages, busy, send, retry, stop, reset, resolveConfirmation } = useCinderChat(viewer);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const pathname = usePathname() || "";
  // no assistant while a quiz is being taken (/quizzes/<slug>); the list page is fine
  const onQuiz = /^\/quizzes\/[^/]+/.test(pathname);
  // the landing's hero Cinder already talks, so the launcher stays quiet there
  const onLanding = pathname === "/" || pathname === "/welcome";
  // once the chat has been opened, the launcher drops its thought bubble for this viewer
  const [seenBy, setSeenBy] = useState(null);
  const seen = seenBy === viewer;
  const [hint, setHint] = useState(0);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const suggestions = useMemo(() => suggestionsFor(pathname), [pathname]);

  // keep the newest message in view while it streams
  useEffect(() => {
    const box = scrollRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open || seen || onQuiz || onLanding) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let thinkTimer;
    const cycle = window.setInterval(() => {
      setThinking(true);
      thinkTimer = window.setTimeout(() => {
        setHint((i) => (i + 1) % IDLE_HINTS.length);
        setThinking(false);
      }, 1100);
    }, 4800);
    return () => {
      window.clearInterval(cycle);
      window.clearTimeout(thinkTimer);
    };
  }, [open, seen, onQuiz, onLanding]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(frame);
    };
  }, [open]);

  // other components (e.g. the landing "Ask Cinder" step) open the chat
  // by dispatching this window event
  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setSeenBy(viewer);
    };
    window.addEventListener("calphy:open-chat", onOpen);
    return () => window.removeEventListener("calphy:open-chat", onOpen);
  }, [viewer]);

  // on phones the panel covers the page, so following a link closes it
  const closeOnPhone = () => {
    if (window.innerWidth < 640) setOpen(false);
  };

  const openChat = () => {
    setOpen(true);
    setSeenBy(viewer);
    setHint(0);
  };

  const submit = (value = input) => {
    if (!value.trim() || busy) return;
    send(value);
    setInput("");
  };

  const onComposerKey = (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  if (onQuiz) return null;
  const fresh = messages.length === 1;

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>
        <div className="tw">
          <AnimatePresence>
            {!open && (
              <motion.button
                key="launcher"
                type="button"
                onClick={openChat}
                aria-label="Open Cinder, the course assistant"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed right-4 bottom-4 z-50 flex items-center gap-2 sm:right-6 sm:bottom-6"
              >
                {!seen && !onLanding && (
                  <span
                    className="hidden rounded-2xl rounded-br-sm border bg-surface px-3 py-2 text-sm font-semibold text-ink shadow-md sm:inline-block"
                    aria-hidden="true"
                  >
                    {thinking ? <TypingDots /> : <span key={hint}>{IDLE_HINTS[hint]}</span>}
                  </span>
                )}
                {/* thermal ring: the launcher is "warm" */}
                <span className="bg-thermal grid size-16 place-items-center rounded-full p-[3px] shadow-lg transition-transform hover:scale-105">
                  <span className="grid size-full place-items-center rounded-full bg-surface">
                    <CalphyMascot size={46} mood={!seen && thinking ? "think" : "wave"} />
                  </span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {open && (
              <motion.section
                key="panel"
                role="dialog"
                aria-modal="false"
                aria-label="Cinder, the course assistant"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-bg sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(42rem,calc(100dvh-6rem))] sm:w-[25rem] sm:rounded-3xl sm:border sm:shadow-2xl"
              >
                <header className="relative flex items-center gap-3 border-b bg-surface px-4 py-3">
                  <CalphyMascot size={38} mood={busy ? "think" : "wave"} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-tight text-ink">Cinder</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn("size-1.5 rounded-full", busy ? "bg-flame" : "bg-good")} aria-hidden="true" />
                      {busy ? "Thinking…" : "Answers from this course"}
                    </p>
                  </div>
                  <IconAction label="New chat" onClick={reset}>
                    <SquarePen />
                  </IconAction>
                  <IconAction label="Close" onClick={() => setOpen(false)}>
                    <X />
                  </IconAction>
                </header>

                <div
                  ref={scrollRef}
                  role="log"
                  aria-live="polite"
                  aria-label="Conversation"
                  className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
                >
                  {messages.map((message, index) =>
                    message.role === "user" ? (
                      <div key={message.id} className="flex justify-end">
                        <p className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-3.5 py-2 text-[0.95rem] whitespace-pre-wrap text-primary-foreground">
                          {message.text}
                        </p>
                      </div>
                    ) : (
                      <AssistantMessage
                        key={message.id}
                        message={message}
                        last={index === messages.length - 1}
                        busy={busy}
                        onRetry={retry}
                        onConfirm={resolveConfirmation}
                        onLink={closeOnPhone}
                      />
                    ),
                  )}
                  {fresh && (
                    <div className="flex flex-wrap gap-2 pl-[2.375rem]">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => submit(suggestion)}
                          className="rounded-full border bg-surface px-3 py-1.5 text-left text-sm font-medium text-ink-soft transition-colors hover:border-ember hover:text-ember-text"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <form
                  className="border-t bg-surface p-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submit();
                  }}
                >
                  <div className="flex items-end gap-2 rounded-2xl border bg-bg p-1.5 pl-3 focus-within:border-ember">
                    <label className="sr-only" htmlFor="cinder-question">
                      Ask a course question
                    </label>
                    <textarea
                      ref={inputRef}
                      id="cinder-question"
                      rows={1}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={onComposerKey}
                      placeholder="Ask about a lesson or formula…"
                      maxLength={1200}
                      className="field-sizing-content max-h-32 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[0.95rem] text-ink outline-none placeholder:text-muted-foreground"
                    />
                    {busy ? (
                      <Button type="button" size="icon" variant="secondary" className="size-9 rounded-xl" onClick={stop} aria-label="Stop answering">
                        <Square className="fill-current" />
                      </Button>
                    ) : (
                      <Button type="submit" size="icon" className="size-9 rounded-xl" disabled={!input.trim()} aria-label="Send question">
                        <ArrowUp />
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-center text-[0.7rem] text-muted-foreground">
                    Cinder only answers from Ignius lessons. Check important numbers.
                  </p>
                </form>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </MotionConfig>
  );
}
