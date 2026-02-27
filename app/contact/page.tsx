export default function ContactPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Contact</h1>
      <p className="text-white/70">
        Add your contact method(s) here (Discord handle, server invite, email, etc.).
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
        Example:
        <ul className="list-disc pl-5 mt-2 text-white/70">
          <li>Discord: Major Felra</li>
          <li>168th Legion: your permanent invite</li>
        </ul>
      </div>
    </div>
  );
}