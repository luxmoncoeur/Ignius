"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  FlaskConical,
  House,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sigma,
  Sun,
  CircleHelp,
} from "lucide-react";
import { useUser } from "@/components/UserContext";
import CalphyMascot from "@/components/CalphyMascot";
import SiteSearch from "@/components/SiteSearch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import useTheme from "@/lib/useTheme";

const LINKS = [
  { href: "/learn", label: "Home", icon: House },
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/simulations", label: "Simulations", icon: FlaskConical },
  { href: "/quizzes", label: "Quizzes", icon: CircleHelp },
  { href: "/formulas", label: "Formulas", icon: Sigma },
  { href: "/dashboard", label: "Dashboard", icon: ChartNoAxesColumnIncreasing },
];

function ThemeToggle({ theme, onToggle, className }) {
  const dark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-10 rounded-full", className)}
      onClick={onToggle}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}

function UserMenu({ user, onLogout }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 rounded-full pl-1.5 pr-3">
          <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {user.username[0].toUpperCase()}
          </span>
          <span className="max-w-28 truncate">{user.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-muted-foreground font-normal">
          Signed in as <span className="font-semibold text-ink">{user.username}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <ChartNoAxesColumnIncreasing /> My progress
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onLogout}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SiteNavbar() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { user, isLoggedIn, logout, authLoading } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  // any navigation (including "Log in" inside the sheet) closes the mobile menu
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeHref = LINKS.find((link) => pathname.startsWith(link.href))?.href;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/learn");
  };

  const account = authLoading ? (
    <Skeleton className="h-10 w-24 rounded-full" />
  ) : isLoggedIn ? (
    <UserMenu user={user} onLogout={handleLogout} />
  ) : (
    <Button asChild className="h-10 rounded-full px-4">
      <Link href="/login">
        <LogIn /> Log in
      </Link>
    </Button>
  );

  return (
    <header
      className={cn(
        "tw fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200",
        scrolled ? "border-line bg-surface" : "border-transparent bg-bg",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6"
      >
        <Link
          href="/welcome"
          className="flex items-center gap-2 rounded-lg text-lg font-extrabold tracking-tight text-ink no-underline"
        >
          <CalphyMascot size={30} />
          Ignius
        </Link>

        <ul className="mx-auto hidden items-center gap-1 xl:flex">
          {LINKS.map(({ href, label }) => {
            const active = href === activeHref;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold no-underline transition-colors",
                    active
                      ? "bg-ember-tint text-ember-text"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-1.5 xl:ml-0">
          <SiteSearch />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <div className="hidden xl:block">{account}</div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-full xl:hidden"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,85vw)] gap-0 p-0">
              <SheetHeader className="border-b">
                <SheetTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <CalphyMascot size={26} /> Ignius
                </SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <ul className="grid gap-1 p-3">
                {LINKS.map(({ href, label, icon: Icon }) => {
                  const active = href === activeHref;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-semibold no-underline",
                          active
                            ? "bg-ember-tint text-ember-text"
                            : "text-ink-soft hover:bg-surface-2 hover:text-ink",
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-auto border-t p-4">{account}</div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
