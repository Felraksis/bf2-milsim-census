import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/milsims", label: "Milsims" },
  { href: "/submit", label: "Submit" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
  { href: "/contact", label: "Contact" },
  { href: "/roadmap", label: "Roadmap" },
];

export function NavBar() {
  return (
    <header className="border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-wide">
          BF2 Milsim Census
        </Link>
        <nav className="flex gap-4 text-sm text-white/80">
          {nav.map((i) => (
            <Link key={i.href} href={i.href} className="hover:text-white">
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}