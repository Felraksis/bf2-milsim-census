import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">BF2 Milsim Census</h1>

      <p className="text-white/80">
        We’re collecting permanent invites to active Star Wars Battlefront II milsim communities,
        building a directory, and tracking a few stats (like the oldest still-standing server).
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/milsims"
          className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90"
        >
          Browse Directory
        </Link>
        <Link
          href="/submit"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:border-white/40"
        >
          Submit a Milsim
        </Link>
        <Link
          href="/hall-of-fame"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:border-white/40"
        >
          Hall of Fame
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm text-white/70">
          MVP status: pages are live; database wiring comes next.
        </div>
      </div>
    </div>
  );
}