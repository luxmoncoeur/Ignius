"use client";

// ⌘K / Ctrl+K / "/" search palette over lessons, sims, quizzes and formulas.
// Matching uses lib/search.js (word-prefix ranking), not cmdk's fuzzy filter.
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CircleHelp, FlaskConical, Search, Sigma } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchSite } from "@/lib/search";
import useDebouncedValue from "@/lib/useDebouncedValue";

const SUGGESTIONS = ["specific heat", "calorimetry", "Wien", "Kelvin", "gas laws"];
const TYPE_ICON = {
  Lesson: BookOpen,
  Simulation: FlaskConical,
  Quiz: CircleHelp,
  Formula: Sigma,
};
const TYPE_ORDER = ["Lesson", "Simulation", "Quiz", "Formula"];

export default function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 120);
  const results = useMemo(() => searchSite(debounced, 12), [debounced]);
  const groups = TYPE_ORDER.map((type) => [
    type,
    results.filter((item) => item.type === type),
  ]).filter(([, items]) => items.length);

  useEffect(() => {
    const onKey = (event) => {
      const typing =
        /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onOpenChange = (value) => {
    setOpen(value);
    if (!value) setQuery("");
  };

  const go = (href) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Search lessons, simulations, quizzes and formulas"
        aria-keyshortcuts="Control+K Meta+K /"
        className="h-10 gap-2 rounded-full bg-surface px-3 text-muted-foreground hover:text-ink sm:w-44 sm:justify-start"
      >
        <Search />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-auto hidden rounded border bg-surface-2 px-1.5 font-mono text-[0.7rem] text-ink-soft sm:inline">
          /
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Search Ignius"
        description="Search lessons, simulations, quizzes and formulas"
        shouldFilter={false}
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search lessons, sims, quizzes, formulas"
        />
        <CommandList className="max-h-[min(60vh,26rem)]">
          {!debounced ? (
            <CommandGroup heading="Try">
              {SUGGESTIONS.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  value={`suggest-${suggestion}`}
                  onSelect={() => setQuery(suggestion)}
                >
                  <Search />
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
            <>
              <CommandEmpty>
                Nothing matches “{debounced}”. Try a topic like “conduction”.
              </CommandEmpty>
              {groups.map(([type, items]) => {
                const Icon = TYPE_ICON[type];
                return (
                  <CommandGroup key={type} heading={`${type}s`}>
                    {items.map((item) => (
                      <CommandItem
                        key={item.href}
                        value={item.href}
                        onSelect={() => go(item.href)}
                        className="items-start py-2.5"
                      >
                        <Icon className="mt-0.5 text-ember-text" />
                        <span className="grid gap-0.5">
                          <span className="font-semibold text-ink">{item.title}</span>
                          {item.detail && (
                            <span className="line-clamp-1 text-xs text-muted-foreground">
                              {item.detail}
                            </span>
                          )}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
