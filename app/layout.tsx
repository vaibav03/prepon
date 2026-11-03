import type { Metadata } from "next";
import { Geist, Inter, Newsreader } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

/* Kept loaded so --font-inter stays defined as the sans fallback. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prepon",
  description:
    "Prepon turns the way you push back on AI writing into plain-English rules, then proves each one before it goes live.",
};

/**
 * Runs synchronously during HTML parsing, before first paint, so an explicit
 * theme choice never flashes the system theme first.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('prepon-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else{document.documentElement.removeAttribute('data-theme')}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${geist.variable} ${inter.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-surface font-sans text-secondary flex flex-col">
        {children}
      </body>
    </html>
  );
}
