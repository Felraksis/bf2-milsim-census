import Link from "next/link";
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <meta name="gridinsoft-key" content="yb4q1b4jk2u79cvrlg3p8c4ak3wl4poipknxtqi3dp88gayg8mbvm51oshtrzweb" />
      </Head>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">BF2 Milsim Census</h1>

        <p className="text-white/80">
          We're collecting permanent invites to active Star Wars Battlefront II milsim communities,
          building a directory, and tracking a few stats (like the oldest still-standing server).
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/milsims"
            className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90"
          >
            Browse Directory
          </Link>
        </div>
      </div>
    </>
  );
}