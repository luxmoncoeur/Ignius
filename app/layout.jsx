import { Plus_Jakarta_Sans } from "next/font/google";
import "bootstrap-icons/font/bootstrap-icons.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { UserProvider } from "@/components/UserContext";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CalphyChat from "@/components/CalphyChat";
import SaveProgressPrompt from "@/components/SaveProgressPrompt";
import { Toaster } from "@/components/ui/sonner";
import { returningRedirectScript } from "@/lib/visit";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Ignius · Temperature and Heat",
    template: "%s · Ignius",
  },
  description:
    "An interactive Physics learning platform: animated tutorials, canvas simulations, quizzes and a friendly mascot, covering Temperature and Heat.",
  keywords: [
    "physics",
    "temperature",
    "heat",
    "thermodynamics",
    "simulations",
    "quiz",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f17" },
  ],
};

const themeInit = `(function(){try{var saved=localStorage.getItem("calphy-theme");var theme=saved||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme}catch(e){document.documentElement.dataset.theme="light"}})()`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={jakarta.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: returningRedirectScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      {/* extensions such as Grammarly add attributes to <body> before React
          hydrates; this ignores attribute mismatches on <body> only */}
      <body suppressHydrationWarning>
        <UserProvider>
          <SiteNavbar />
          <main>{children}</main>
          <SiteFooter />
          <CalphyChat />
          <SaveProgressPrompt />
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
