import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/home/HeroSlider";
import { CategoryCards } from "@/components/home/CategoryCards";
import { PlatformSection } from "@/components/home/PlatformSection";
import { CONSOLE_SECTIONS } from "@/lib/consoleSections";

export default function HomePage() {
  return (
    <>
      {/* Background fixed image */}
      <div
        style={{
          backgroundImage: "url(/back-background-web.webp)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          width: "100%",
          height: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />
      {/* Grain texture overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          opacity: 1,
          pointerEvents: "none",
          zIndex: 9999999,
          imageRendering: "pixelated",
          backgroundImage: "url(/noise.webp)",
          backgroundSize: "100px",
          backgroundPosition: "center center",
          mixBlendMode: "screen",
        }}
      />

      <Header />

      <main id="site-content" style={{ paddingBottom: "4rem" }}>
        {/* Hero banner slider */}
        <HeroSlider />

        {/* Publisher category cards */}
        <section style={{ marginBlockStart: "0.5rem" }}>
          <CategoryCards />
        </section>

        {/* Game sections by console — data from RAWG */}
        <section className="collections">
          {CONSOLE_SECTIONS.map((section) => (
            <PlatformSection key={section.id} section={section} />
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}
