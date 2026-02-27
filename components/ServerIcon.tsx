export default function ServerIcon({
  url,
  name,
  size = 40,
}: {
  url?: string | null;
  name?: string | null;
  size?: number;
}) {
  const label = (name ?? "Server").trim();

  if (!url) {
    return (
      <div
        className="rounded-xl border border-white/10 bg-white/5 grid place-items-center text-white/60"
        style={{ width: size, height: size }}
        aria-label={label}
        title={label}
      >
        <span className="text-xs font-semibold">
          {label.slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={label}
      className="rounded-xl border border-white/10 bg-white/5"
      style={{ width: size, height: size }}
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
    />
  );
}