import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata = {
  title: "BF2 Milsim Census",
  description:
    "Directory and historical census of Star Wars Battlefront II milsim communities.",
  openGraph: {
    title: "BF2 Milsim Census",
    description:
      "Find active Battlefront II milsims and explore the oldest still-standing legions.",
    url: "https://bf2-milsims.com",
    siteName: "BF2 Milsim Census",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
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