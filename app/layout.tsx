import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "BF2 Milsim Census",
  description: "A community-run directory and census of active Battlefront II milsims.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs text-white/50">
          <div className="border-t border-white/10 pt-6">
            Community project — listings are provided by server reps.
          </div>
        </footer>
      </body>
    </html>
  );
}