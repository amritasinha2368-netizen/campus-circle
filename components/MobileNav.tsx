"use client";

import Link from "next/link";

export default function MobileNav({
  active,
  logout,
}: {
  active: string;
  logout: () => void;
}) {
  const navItems = [
    {
      href: "/home",
      key: "home",
      label: "Lost & Found",
      icon: "🏠",
    },
    {
      href: "/notes",
      key: "notes",
      label: "Notes",
      icon: "📄",
    },
    {
      href: "/events",
      key: "events",
      label: "Events",
      icon: "📅",
    },
    {
      href: "/marketplace",
      key: "marketplace",
      label: "Marketplace",
      icon: "🛒",
    },
  ];

  return (
    <div className="lg:hidden mb-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-600 flex items-center justify-center font-black">
            C
          </div>

          <div>
            <h1 className="font-bold leading-tight">
              Campus Circle
            </h1>

            <p className="text-xs text-gray-500">
              Student network
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 px-3 py-2 text-sm"
        >
          Logout
        </button>
      </div>

      <nav className="grid grid-cols-4 gap-2 rounded-3xl border border-white/10 bg-zinc-900 p-2">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`rounded-2xl py-3 px-2 text-center text-[11px] ${
              active === item.key
                ? "bg-purple-600/30 border border-purple-400/30 text-white font-semibold"
                : "text-gray-400"
            }`}
          >
            <div className="text-lg mb-1">
              {item.icon}
            </div>

            <div className="leading-tight">
              {item.label}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}