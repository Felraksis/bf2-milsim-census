import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thank you</h1>
      <p className="text-white/70">
        Your submission was received. Once verified, it will appear in the public directory.
        If you provided contact info, you may recieve a message soon.
        We manually check each entry so this may take some time.
      </p>
      <Link href="/milsims" className="text-sm underline text-white/80">
        Back to directory
      </Link>
    </div>
  );
}