"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const SLIDES = [
  {
    slug: "comix-zone",
    console: "Mega Drive",
    bg: "/slides/comix-zone.DnV1JW7s_lNb3u.webp",
    title: "/slides/comix-zone-title.Bl0jeiV0_ZdTIsF.webp",
    bgW: 3168, bgH: 1344, titleW: 600, titleH: 230,
  },
  {
    slug: "dragon-ball-z-super-butoden",
    console: "Super Nintendo",
    bg: "/slides/dragon-ball.BzFPYCi7_Z1tjReo.webp",
    title: "/slides/dragon-ball-title.LqePnwMj_Z2br5Dh.webp",
    bgW: 1584, bgH: 672, titleW: 2000, titleH: 810,
  },
  {
    slug: "super-mario-world",
    console: "Super Nintendo",
    bg: "/slides/mario.DOjrbSBH_1IRKfy.webp",
    title: "/slides/mario-title.DmsEN2M4_2puUTg.webp",
    bgW: 3168, bgH: 1344, titleW: 600, titleH: 327,
  },
  {
    slug: "super-metroid",
    console: "Super Nintendo",
    bg: "/slides/metroid.QfH10gP__ZL6Val.webp",
    title: "/slides/metroid-title.yQxpYjVM_ZGRHdn.webp",
    bgW: 3168, bgH: 1344, titleW: 600, titleH: 327,
  },
  {
    slug: "pokemon-emerald",
    console: "Game Boy Advance",
    bg: "/slides/pokemon.C2iuR5bh_Z26Fe5W.webp",
    title: "/slides/pokemon-title.B4Htn6Zu_Z2lfEeE.webp",
    bgW: 3168, bgH: 1344, titleW: 600, titleH: 327,
  },
  {
    slug: "sonic-the-hedgehog",
    console: "Mega Drive",
    bg: "/slides/sonic.wvmq-HS6_1GTV5a.webp",
    title: "/slides/sonic-title.DwGyGEy3_ZqQw3I.webp",
    bgW: 3168, bgH: 1344, titleW: 1964, titleH: 704,
  },
  {
    slug: "street-fighter-ii",
    console: "Mega Drive",
    bg: "/slides/street-fighter.BkCUhUHb_1cVa3x.webp",
    title: "/slides/street-fighter-title.BN0UnN7l_n3uYn.webp",
    bgW: 3168, bgH: 1344, titleW: 600, titleH: 327,
  },
  {
    slug: "the-legend-of-zelda-a-link-to-the-past",
    console: "Super Nintendo",
    bg: "/slides/zelda.DDw3NZGR_RFmAs.webp",
    title: "/slides/zelda-title.DZtF6WI7_ZqI8gJ.webp",
    bgW: 1584, bgH: 672, titleW: 600, titleH: 327,
  },
];

export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4500, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <section
      aria-label="Featured games"
      style={{ marginBlockStart: 0, overflow: "hidden", position: "relative", width: "100%" }}
    >
      {/* Embla viewport */}
      <div
        ref={emblaRef}
        style={{ width: "100%", padding: "0 4rem 1.75rem", overflow: "hidden" }}
      >
        {/* Embla container */}
        <div style={{ display: "flex", height: "450px" }}>
          {SLIDES.map((slide) => (
            <div
              key={slide.slug}
              style={{
                position: "relative",
                cursor: "pointer",
                flexShrink: 0,
                minWidth: "100%",
                height: "100%",
                borderRadius: "1rem",
                overflow: "hidden",
                boxShadow: "#000000b0 0 26px 30px -10px, #000000ba 0 16px 10px -10px",
                transition: "all 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)",
              }}
            >
              {/* Background screenshot */}
              <Image
                src={slide.bg}
                alt={slide.slug}
                fill
                style={{ objectFit: "cover" }}
                sizes="100vw"
                priority={slide.slug === SLIDES[0].slug}
              />
              {/* Title logo overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "15px",
                  left: "60px",
                  width: "30%",
                  height: "auto",
                  zIndex: 2,
                }}
              >
                <Image
                  src={slide.title}
                  alt={`Title ${slide.slug}`}
                  width={slide.titleW}
                  height={slide.titleH}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
              {/* Console glass tag */}
              <h4
                className="console-tag"
                style={{
                  position: "absolute",
                  bottom: "10%",
                  left: "9.8%",
                  zIndex: 2,
                  fontSize: "1rem",
                  fontWeight: 100,
                }}
              >
                {slide.console}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* Prev button */}
      <SliderBtn side="left" onClick={scrollPrev} />
      {/* Next button */}
      <SliderBtn side="right" onClick={scrollNext} />

      {/* Pagination dots */}
      <div
        style={{
          position: "absolute",
          bottom: "0.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "0.4rem",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              padding: 0,
              background: i === selectedIndex
                ? "var(--swiper-pagination-color)"
                : "var(--swiper-pagination-bullet-inactive-color)",
              opacity: 1,
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
    </section>
  );
}

function SliderBtn({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{
        position: "absolute",
        top: "calc(50% - 0.875rem)",
        [side]: "4.5rem",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--white)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease-out",
        zIndex: 10,
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={28} height={28}>
        <path d={side === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
      </svg>
    </button>
  );
}
