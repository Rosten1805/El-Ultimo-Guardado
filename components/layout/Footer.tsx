"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "#0a0a0a",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        marginTop: "4rem",
        paddingTop: "3rem",
        paddingBottom: "0",
        color: "rgba(255,255,255,0.55)",
        fontSize: "0.85rem",
      }}
    >
      {/* Main footer grid */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          paddingInline: "4rem",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "3rem",
          paddingBottom: "3rem",
        }}
      >
        {/* Brand column */}
        <div>
          <span
            style={{
              fontFamily: "ArcadeIn, monospace",
              fontSize: "1.2rem",
              color: "#f9f9f9",
              lineHeight: 1.2,
              display: "block",
              marginBottom: "1rem",
            }}
          >
            El Último<br />Guardado
          </span>
          <p style={{ lineHeight: 1.6, maxWidth: "280px", marginBottom: "1.5rem" }}>
            Tu biblioteca de videojuegos retro. Explora, descubre y revive los clásicos que marcaron una era.
          </p>

          {/* Social links */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/cristina-gomez-limon/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn de Cristina Gómez Limón"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
                transition: "border-color 0.2s, color 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.5)";
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/Rosten1805"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub de Cristina Gómez Limón"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
                transition: "border-color 0.2s, color 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.5)";
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          </div>
        </div>

        {/* Navegación */}
        <div>
          <h3
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#f9f9f9",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1.25rem",
            }}
          >
            Navegación
          </h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {["Inicio", "Buscar juegos", "Plataformas", "Acerca de"].map((item) => (
              <li key={item}>
                <a
                  href="/"
                  style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)")}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Consolas */}
        <div>
          <h3
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#f9f9f9",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1.25rem",
            }}
          >
            Consolas
          </h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {["NES", "Super Nintendo", "Nintendo 64", "Game Boy Advance", "Mega Drive", "PlayStation"].map((c) => (
              <li key={c}>
                <a
                  href="/"
                  style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)")}
                >
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Géneros */}
        <div>
          <h3
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#f9f9f9",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1.25rem",
            }}
          >
            Géneros
          </h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {["Acción", "RPG", "Plataformas", "Lucha", "Deportes", "Aventura"].map((g) => (
              <li key={g}>
                <a
                  href="/"
                  style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)")}
                >
                  {g}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingBlock: "1.25rem",
          paddingInline: "4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1400px",
          margin: "0 auto",
          fontSize: "0.78rem",
        }}
      >
        <span>© {currentYear} El Último Guardado. Todos los derechos reservados.</span>
        <span>
          Datos proporcionados por{" "}
          <a
            href="https://rawg.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}
          >
            RAWG
          </a>
        </span>
        <span>
          Hecho con ♥ por{" "}
          <a
            href="https://www.linkedin.com/in/cristina-gomez-limon/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}
          >
            Cristina Gómez Limón
          </a>
        </span>
      </div>
    </footer>
  );
}
