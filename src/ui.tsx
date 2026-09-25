// Shared look for every scene: the website's palette and typeface, photo
// motion, and text reveals. Sized for a large landscape screen viewed from
// a few metres away - nothing important is smaller than ~34px at 1080p.
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const C = {
  navy: "#0a0e2a",
  navyMid: "#12184f",
  green: "#159449",
  mint: "#8fe0ac",
  white: "#ffffff",
  paper: "#f3efe4",
  soft: "rgba(255,255,255,0.78)",
};

export const FONT = "Jakarta, system-ui, sans-serif";

export const Fonts: React.FC = () => (
  <style>
    {[400, 500, 600, 700]
      .map(
        (w) =>
          `@font-face{font-family:Jakarta;font-weight:${w};font-display:block;src:url(${staticFile(
            `fonts/plus-jakarta-sans-${w}.woff2`
          )}) format("woff2");}`
      )
      .join("")}
  </style>
);

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** 0 -> 1 over `dur` frames starting at `start`, eased. */
export function useIn(start: number, dur = 18) {
  const f = useCurrentFrame();
  return interpolate(f, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
}

/** Full-bleed photo with slow, directional camera motion (never static). */
export const Photo: React.FC<{
  src: string;
  from?: number;
  to?: number;
  zoom?: [number, number];
  pan?: [number, number]; // horizontal drift in %, start -> end
  position?: string;
  grade?: number; // 0..1 navy grade for text legibility
}> = ({ src, from = 0, to, zoom = [1.04, 1.14], pan = [0, 0], position = "50% 50%", grade = 0.25 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const end = to ?? durationInFrames;
  const t = interpolate(f, [from, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = zoom[0] + (zoom[1] - zoom[0]) * t;
  const x = pan[0] + (pan[1] - pan[0]) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.navy }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          transform: `translateX(${x}%) scale(${s})`,
          // one shared grade so photos from different phones/days read as one film
          filter: "contrast(1.06) saturate(0.88) brightness(0.97)",
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,40,90,0.10), rgba(10,14,42,0.10))", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: `rgba(10,14,42,${grade})` }} />
    </AbsoluteFill>
  );
};

export const Clip: React.FC<{ src: string; startFrom?: number; grade?: number; rate?: number; zoom?: [number, number]; to?: number }> = ({
  src,
  startFrom = 0,
  grade = 0.15,
  rate = 1,
  zoom = [1, 1.06],
  to,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(f, [0, to ?? durationInFrames], zoom, { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.navy }}>
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={startFrom}
        playbackRate={rate}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s})` }}
      />
      <AbsoluteFill style={{ background: `rgba(10,14,42,${grade})` }} />
    </AbsoluteFill>
  );
};

/** Bottom/left gradient so type always sits on a dark, even ground. */
export const Scrim: React.FC<{ side?: "bottom" | "left" | "full"; strength?: number }> = ({ side = "bottom", strength = 0.85 }) => (
  <AbsoluteFill
    style={{
      background:
        side === "bottom"
          ? `linear-gradient(180deg, rgba(10,14,42,0) 38%, rgba(10,14,42,${strength * 0.55}) 68%, rgba(10,14,42,${strength}) 100%)`
          : side === "left"
            ? `linear-gradient(90deg, rgba(10,14,42,${strength}) 0%, rgba(10,14,42,${strength * 0.5}) 40%, rgba(10,14,42,0) 70%)`
            : `rgba(10,14,42,${strength})`,
    }}
  />
);

/** Text that fades up into place. No clipping mask: a mask cut letters
 *  mid-reveal (the bottom bar of "E" vanished, so "WHERE" read "WHFRF"). */
export const Rise: React.FC<{ at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; distance?: number }> = ({
  at,
  dur = 20,
  children,
  style,
  distance = 28,
}) => {
  const p = useIn(at, dur);
  return (
    <div style={style}>
      <div style={{ transform: `translateY(${(1 - p) * distance}px)`, opacity: p }}>{children}</div>
    </div>
  );
};

/** Fades a whole layer out over the last `dur` frames of its sequence. */
export const FadeOut: React.FC<{ total: number; dur?: number; children: React.ReactNode }> = ({ total, dur = 14, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [total - dur, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.mint }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONT, fontWeight: 600, fontSize: 30, letterSpacing: "0.28em", textTransform: "uppercase", color }}>
    <span style={{ width: 56, height: 2, background: color }} />
    {children}
  </div>
);

export const Headline: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 96, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.02em", color: C.white, textShadow: "0 2px 30px rgba(6,9,26,0.45)", ...style }}>
    {children}
  </div>
);

/** Subtle film grain + vignette so stills and footage share one texture. */
export const Finish: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }} />
);
