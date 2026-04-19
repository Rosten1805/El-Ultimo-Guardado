"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { GamesPageVM } from "@/types/viewModels";
import { useDebounce } from "@/hooks/useDebounce";

export function Header() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, updateDebounced] = useDebounce(300);
  const router = useRouter();

  const { data, isLoading } = useQuery<GamesPageVM>({
    queryKey: ["search", debouncedQuery],
    queryFn: () =>
      fetch(`/api/games?search=${encodeURIComponent(debouncedQuery)}&page_size=8`).then(
        (r) => r.json(),
      ),
    enabled: debouncedQuery.length > 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    updateDebounced(e.target.value);
  };

  const handleSelect = (slug: string) => {
    setOpen(false);
    setInputValue("");
    router.push(`/games/${slug}`);
  };

  const NAV_LINKS = [
    {
      label: "Home",
      href: "/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      label: "Géneros",
      href: "/genres",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="7" height="7" /><rect x="15" y="3" width="7" height="7" /><rect x="15" y="14" width="7" height="7" /><rect x="2" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      label: "Noticias",
      href: "/news",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6z" />
        </svg>
      ),
    },
    {
      label: "Favoritos",
      href: "/favorites",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
  ];

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        minHeight: "72px",
        position: "sticky",
        top: 0,
        zIndex: 200,
        backgroundColor: "transparent",
        padding: 0,
        transition: "background-color 0.4s ease-in-out",
        gap: "2rem",
        paddingInline: "3.75rem",
      }}
    >
      {/* Left: logo + nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link
          href="/"
          aria-label="Go to the homepage"
          className="nav-animate"
          style={{ "--delay": "80ms" } as React.CSSProperties}
        >
          <span
            style={{
              fontFamily: "ArcadeIn, monospace",
              fontSize: "2.6rem",
              color: "#f9f9f9",
              letterSpacing: "0.04em",
              lineHeight: 1.15,
              display: "block",
            }}
          >
            <span style={{ display: "block" }}>El Último</span>
            <span style={{ display: "block" }}>Guardado</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-animate"
              style={{
                "--delay": `${120 + i * 60}ms`,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.75rem",
                borderRadius: "0.5rem",
                color: "var(--textColor)",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "color 0.2s, background 0.2s",
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--white)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--textColor)";
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right: search + login */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <div
        className="nav-animate"
        style={{ "--delay": "280ms", position: "relative" } as React.CSSProperties}
      >
        <button
          id="open-search"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle search"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            justifyContent: "space-between",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            padding: "0.4rem 0.75rem",
            cursor: "pointer",
            color: "var(--textColor)",
            fontSize: "0.8125rem",
            letterSpacing: "1.42px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={11} cy={11} r={8} />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span>Quick search...</span>
          </span>
          <kbd style={{ fontSize: "0.7rem", opacity: 0.5, marginLeft: "1rem" }}>CMD + K</kbd>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "3rem",
              width: "20rem",
              background: "var(--modalBg)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              zIndex: 300,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", padding: "0.75rem 1rem", gap: "0.5rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--textColor)", flexShrink: 0 }}>
                <circle cx={11} cy={11} r={8} />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder="Search games…"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--white)",
                  fontSize: "0.9rem",
                }}
                aria-label="Search games"
              />
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--textColor)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isLoading && (
              <div style={{ padding: "0.75rem 1rem", color: "var(--textColor)", fontSize: "0.85rem" }}>Searching…</div>
            )}

            {data?.games && data.games.length > 0 && (
              <ul role="listbox" style={{ maxHeight: "18rem", overflowY: "auto" }}>
                {data.games.map((g) => (
                  <li key={g.id} role="option" aria-selected={false}>
                    <button
                      onClick={() => handleSelect(g.slug)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.6rem 1rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "var(--white)",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 4, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.05)" }}>
                        <Image src={g.cover} alt={g.title} width={40} height={40} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "0.875rem", color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--textColor)" }}>{g.year ?? "Unknown year"}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {debouncedQuery.length > 1 && !isLoading && data?.games.length === 0 && (
              <div style={{ padding: "0.75rem 1rem", color: "var(--textColor)", fontSize: "0.85rem" }}>No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Login icon */}
      <button
        aria-label="Iniciar sesión"
        className="nav-animate"
        style={{
          "--delay": "340ms",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.05)",
          cursor: "pointer",
          color: "var(--textColor)",
          transition: "border-color 0.2s, color 0.2s",
          flexShrink: 0,
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.5)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--white)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--textColor)";
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </button>
      </div>
    </header>
  );
}
