"use client";

// ============================================================
// AuthForm, login / register against /api/auth/* (PostgreSQL).
// Falls back gracefully with a friendly DB-offline message.
// ============================================================
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, LogIn, ShieldCheck, TriangleAlert, UserPlus } from "lucide-react";
import { useUser } from "@/components/UserContext";
import CalphyMascot from "@/components/CalphyMascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function Field({ id, label, hint, children }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputClass = "h-11 rounded-xl bg-bg px-3.5 text-base focus-visible:border-ember";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const { login, register, isLoggedIn } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isLogin) {
        await login(identifier, password);
      } else {
        await register(username, email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      // the raw database error mentions setup files, so swap in a friendlier
      // line; every other API message is already written for the user
      if (err.message.includes("Database not reachable")) {
        setError("The database is unreachable right now. Please try again later.");
      } else if (err.message.includes("That username or email is already taken")) {
        setError("That username or email is already taken. Please choose another one.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="tw mx-auto max-w-md rounded-3xl bg-surface p-8 text-center">
        <div className="mb-3 flex justify-center">
          <CalphyMascot size={72} mood="happy" />
        </div>
        <h1 className="text-xl font-bold text-ink">You&apos;re already logged in!</h1>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">Your progress is syncing with your account.</p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard">
            Go to dashboard <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="tw mx-auto max-w-md rounded-3xl bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          {isLogin ? "Welcome back!" : "Join Ignius"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLogin
            ? "Log in to sync your lesson progress and quiz scores."
            : "Create an account. Your guest progress carries over automatically."}
        </p>

        <nav className="my-6 grid grid-cols-2 rounded-full bg-surface-2 p-1" aria-label="Log in or register">
          {[
            ["/login", "Log in", isLogin],
            ["/register", "Register", !isLogin],
          ].map(([href, label, active]) => (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full py-2 text-center text-sm font-bold transition-colors",
                active ? "bg-surface text-ink shadow-xs" : "text-muted-foreground hover:text-ink",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="grid gap-4">
          {isLogin ? (
            <Field id="identifier" label="Username or email">
              <Input
                id="identifier"
                className={inputClass}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="your username or email"
                autoComplete="username"
                required
              />
            </Field>
          ) : (
            <>
              <Field id="username" label="Username" hint="At least 3 characters.">
                <Input
                  id="username"
                  className={inputClass}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  minLength={3}
                  required
                />
              </Field>
              <Field id="email" label="Email">
                <Input
                  id="email"
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  autoComplete="email"
                  required
                />
              </Field>
            </>
          )}
          <Field id="password" label="Password" hint={isLogin ? undefined : "At least 4 characters."}>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className={cn(inputClass, "pr-11")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={4}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-bad-tint px-3.5 py-2.5 text-sm text-ink" role="alert">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-bad-text" aria-hidden="true" />
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-1 h-12 rounded-full text-base" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="animate-spin" /> Please wait…
              </>
            ) : isLogin ? (
              <>
                <LogIn /> Log in
              </>
            ) : (
              <>
                <UserPlus /> Create account
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Your sign-in is used only to keep progress attached to your account. Prefer to explore first?{" "}
            <Link href="/lessons" className="font-semibold text-cool hover:underline">
              Continue as guest
            </Link>
            .
          </span>
        </p>
    </div>
  );
}
