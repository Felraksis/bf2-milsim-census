import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thank you</h1>
      <p className="text-white/70">
        Submission received. Once verified, it will appear in the public directory.
      </p>
      <Link href="/milsims" className="text-sm underline text-white/80">
        Back to directory
      </Link>
    </div>
  );
}