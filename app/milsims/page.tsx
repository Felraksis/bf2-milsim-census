import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getVerifiedMilsims, refreshMilsimFromDiscord } from "@/lib/milsims";
import ServerIcon from "@/components/ServerIcon.tsx";

export const dynamic = "force-dynamic";

async function refreshAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/milsims?msg=Missing%20milsim%20id");

  try {
    await refreshMilsimFromDiscord(id);
    revalidatePath("/milsims");
    redirect("/milsims?msg=Refreshed");
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "Refresh failed";
    redirect(`/milsims?msg=${encodeURIComponent(msg)}`);
  }
}

export default async function MilsimsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; msg?: string }>;
}) {
  const { q, msg } = await searchParams;
  const milsims = await getVerifiedMilsims(q);

  const showMsg =
    msg && msg !== "NEXT_REDIRECT" && msg !== "undefined" && msg !== "null";

  return (
    <div className="space-y-5">
      {showMsg ? (
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">
          {msg}
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Milsims Directory</h1>
          <p className="text-sm text-white/70">
            Verified servers only. Missing yours? Submit it.
          </p>
        </div>
        <Link
          href="/submit"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:border-white/40"
        >
          Submit
        </Link>
      </div>

      <form className="flex gap-2" action="/milsims" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name…"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
        />
        <button className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90">
          Search
        </button>
      </form>

      <div className="grid gap-3">
        {milsims.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
            No verified servers yet.
          </div>
        ) : (
          milsims.map((m: any) => (
            <div
              key={m.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
              style={{ borderLeft: `8px solid ${m.theme_color ?? "#666"}` }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-3 min-w-0">
                  <ServerIcon url={m.discord_icon_url} name={m.name} />

                  <div className="min-w-0">
                    <div className="text-lg font-semibold truncate">{m.name}</div>
                    <a
                      href={m.invite_url}
                      className="text-sm text-white/70 underline break-all"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {m.invite_url}
                    </a>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                      {(m.platforms ?? []).map((x: string) => (
                        <span
                          key={`p-${m.id}-${x}`}
                          className="rounded-full border border-white/15 px-2 py-1"
                        >
                          {x}
                        </span>
                      ))}
                      {(m.factions ?? []).map((x: string) => (
                        <span
                          key={`f-${m.id}-${x}`}
                          className="rounded-full border border-white/15 px-2 py-1"
                        >
                          {x}
                        </span>
                      ))}
                      {(m.tags ?? []).map((x: string) => (
                        <span
                          key={`t-${m.id}-${x}`}
                          className="rounded-full bg-white/10 px-2 py-1"
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right text-xs text-white/60 space-y-1">
                  <div className="flex justify-end">
                    <form action={refreshAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white/40"
                        title="Refresh member/online counts + icon from Discord"
                      >
                        Refresh
                      </button>
                    </form>
                  </div>

                  <div>Members: {m.members_count ?? "—"}</div>
                  <div>Online: {m.online_count ?? "—"}</div>

                  <div className="pt-1">
                    Est:{" "}
                    {m.server_created_at
                      ? new Date(m.server_created_at).toLocaleDateString()
                      : "—"}
                  </div>

                  <div className="text-[11px] text-white/50 pt-2">
                    Last checked:{" "}
                    {m.last_checked_at
                      ? new Date(m.last_checked_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}