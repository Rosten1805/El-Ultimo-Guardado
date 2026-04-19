"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  src: string;
  poster: string;
  fallbackImage?: string;
}

export function VideoPlayer({ src, poster, fallbackImage }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  const play = () => {
    videoRef.current?.play();
    setPlaying(true);
    setStarted(true);
  };
  const pause = () => {
    videoRef.current?.pause();
    setPlaying(false);
  };
  const rewind = () => {
    if (videoRef.current) videoRef.current.currentTime = 0;
  };
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <div>
      {/* Player */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "10px", overflow: "hidden", background: "#000" }}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onEnded={() => setPlaying(false)}
          playsInline
        />

        {/* Play overlay — only when not started */}
        {!started && (
          <button
            onClick={play}
            aria-label="Play trailer"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.35)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {fallbackImage && (
              <Image src={fallbackImage} alt="poster" fill style={{ objectFit: "cover", zIndex: 0 }} />
            )}
            <span style={{
              position: "relative",
              zIndex: 1,
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(6px)",
              border: "2px solid rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" fill="white" width={24} height={24}>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        {(["PLAY", "PAUSE", "REWIND", "MUTE"] as const).map((action) => (
          <button
            key={action}
            onClick={action === "PLAY" ? play : action === "PAUSE" ? pause : action === "REWIND" ? rewind : toggleMute}
            style={{
              flex: 1,
              padding: "0.4rem 0",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "4px",
              color: action === "MUTE" && muted ? "#a78bfa" : "rgba(255,255,255,0.7)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
          >
            {action === "MUTE" && muted ? "UNMUTE" : action}
          </button>
        ))}
      </div>
    </div>
  );
}
