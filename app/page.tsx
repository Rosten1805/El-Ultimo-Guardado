import { Header } from "@/components/layout/Header";
import { HeroSlider } from "@/components/home/HeroSlider";
import { CategoryCards } from "@/components/home/CategoryCards";
import { CollectionCarousel } from "@/components/home/PlatformSection";
import { TIKEN_COLLECTIONS } from "@/lib/tikenCollections";

export default function HomePage() {
  return (
    <>
      {/* Background fixed image */}
      <div
        style={{
          backgroundImage: "url(/background.png)",
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

        {/* Game collections */}
        <section className="collections">
          {TIKEN_COLLECTIONS.map((collection) => (
            <CollectionCarousel key={collection.title} collection={collection as any} />
          ))}
        </section>
      </main>
    </>
  );
}
