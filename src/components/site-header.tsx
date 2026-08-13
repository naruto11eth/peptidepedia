"use client";

import { ListIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/compounds", label: "Compounds" },
  { href: "/compare", label: "Compare" },
  { href: "/calculator", label: "Calculator" },
  { href: "/stack", label: "Stack builder" },
  { href: "/supplies", label: "Supplies" },
  { href: "/safety", label: "Safety" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-xl bg-[color-mix(in_oklab,var(--bg)_82%,transparent)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <Logo />
            <span className="font-display font-semibold tracking-tight text-[15px]">
              Peptidepedia
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-auto mr-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    active
                      ? "text-[var(--text)] bg-[var(--bg-card)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle navigation"
              className="md:hidden p-2 -mr-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              {open ? <XIcon size={20} weight="bold" /> : <ListIcon size={20} weight="bold" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden pb-4 flex flex-col gap-0.5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="1" y="1" width="20" height="20" rx="5" stroke="var(--color-accent-dim)" />
      <path
        d="M6.5 15.5V6.5h4a2.75 2.75 0 0 1 0 5.5h-4"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
