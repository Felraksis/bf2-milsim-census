import Link from "next/link";

export default function SubmitPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Submit a Milsim</h1>
      <p className="text-white/70">
        Permanent invite + basic info. Submissions will be reviewed before appearing publicly.
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
        Form goes here next.
      </div>

      <Link href="/thanks" className="text-sm text-white/70 underline">
        (Temporary) See thank-you page
      </Link>
    </div>
  );
}