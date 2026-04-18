"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
      <div style={{ display: "flex", alignItems: "center", gap: 0, width: "fit-content", justifyContent: "flex-start" }}>
        <Link
          href="/"
          aria-label="Go to the homepage"
          className="nav-animate"
          style={{ "--delay": "80ms" } as React.CSSProperties}
          data-style="logo-link"
        >
          <Image
            src="/slides/romSphere-logo.CRNmsPp5_H3RxL.webp"
            alt="romSphere"
            width={150}
            height={41}
            priority
            style={{ display: "block", width: "150px", height: "auto", marginRight: "2rem" }}
          />
        </Link>
      </div>

      {/* Right: search */}
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
    </header>
  );
}
