import CopyTextButton from "@/components/CopyTextButton";

type Person = {
  name: string;
  discord?: string; // optional handle
  role?: string;    // optional role/title
};

export default function ContactPage() {
  const projectLead: Person = {
    name: "Felra",
    discord: "felraksis",
    role: "Project Lead",
  };

  const contributors: Person[] = [
    { name: "Akpo", discord: "akpo56", role: "Contributor" },
    { name: "Magacks", discord: "magacks", role: "Contributor" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Contact</h1>
        <p className="text-white/70 mt-1">
          This project is community-maintained. For corrections, submissions, or
          verification requests, contact the project lead via Discord.
        </p>
      </div>

      {/* Project lead */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="text-sm text-white/50">Project Lead</div>
            <div className="text-lg font-semibold text-white truncate">
              {projectLead.name}
            </div>

            {projectLead.discord ? (
              <div className="mt-1 text-sm text-white/70">
                Discord: <span className="text-white/85">{projectLead.discord}</span>
              </div>
            ) : null}
          </div>

          {projectLead.discord ? (
            <CopyTextButton text={projectLead.discord} label="Copy Discord" />
          ) : null}
        </div>

        <div className="text-sm text-white/60">
          Best for: submissions, server status changes (active/inactive), and
          urgent corrections.
        </div>
      </div>

      {/* Contributors */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-semibold">Contributors</div>
          <div className="text-xs text-white/50">
            Want to help? Contact the lead.
          </div>
        </div>

        {contributors.length === 0 ? (
          <div className="text-sm text-white/60">No contributors listed yet.</div>
        ) : (
          <div className="grid gap-2">
            {contributors.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="font-medium text-white/85 truncate">{p.name}</div>
                  {p.role ? (
                    <div className="text-xs text-white/50">{p.role}</div>
                  ) : null}
                  {p.discord ? (
                    <div className="text-xs text-white/60">
                      Discord: <span className="text-white/80">{p.discord}</span>
                    </div>
                  ) : null}
                </div>

                {p.discord ? (
                  <CopyTextButton text={p.discord} label="Copy" />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* What to contact about */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="font-semibold mb-3">You can contact us for:</div>
        <ul className="space-y-2 text-sm text-white/70 list-disc pl-5">
          <li>Updating or hiding a milsim entry</li>
          <li>Incorrect or outdated information</li>
          <li>Verification requests</li>
          <li>Feature suggestions or feedback</li>
          <li>Reporting inactive servers</li>
        </ul>
      </div>

      <div className="text-xs text-white/40">
        Response times may vary. This project is community driven and we review requests manually.
      </div>
    </div>
  );
}