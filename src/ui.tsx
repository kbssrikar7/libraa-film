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

// Type: Barlow Condensed for titles and names (industrial / maritime
// signage feel, holds up at very large sizes without wide tracking), Barlow
// for kickers and supporting lines. Both SIL Open Font License (fontsource).
export const DISPLAY = "'Barlow Condensed', system-ui, sans-serif";
export const FONT = "Barlow, system-ui, sans-serif";

const FACES: [string, string, number[]][] = [
  ["Barlow Condensed", "barlow-condensed", [400, 500, 600, 700]],
  ["Barlow", "barlow", [400, 500, 600]],
];

export const Fonts: React.FC = () => (
  <style>
    {FACES.flatMap(([family, file, weights]) =>
      weights.map(
        (w) =>
          `@font-face{font-family:'${family}';font-weight:${w};font-display:block;src:url(${staticFile(`fonts/${file}-${w}.woff2`)}) format("woff2");}`
      )
    ).join("")}
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

/** Title-safe margins at 1080p: every caption and title in the film sits on
 *  this grid (lower-left), so text lands in the same place shot after shot,
 *  the way an editor's lower-third template does. */
export const SAFE = { x: 160, bottom: 140 };

/** Text that eases up into place with a short defocus, like a lens pulling
 *  focus. No clipping mask: a mask cut letters mid-reveal (the bottom bar of
 *  "E" vanished, so "WHERE" read "WHFRF"). `out` (frame) eases it away again
 *  before a cut, so outgoing text never sits on top of the next shot. */
export const Rise: React.FC<{
  at: number;
  dur?: number;
  out?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  distance?: number;
}> = ({ at, dur = 24, out, children, style, distance = 22 }) => {
  const f = useCurrentFrame();
  const p = useIn(at, dur);
  const q = out === undefined ? 0 : interpolate(f, [out, out + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const blur = (1 - p) * 6 + q * 4;
  return (
    <div style={style}>
      <div
        style={{
          transform: `translateY(${(1 - p) * distance - q * 12}px)`,
          opacity: p * (1 - q),
          filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Letter-spacing that settles as the word arrives - the classic title move
 *  for a single name (KOUNDINYA, LIBRAA GROUP). */
export function useTrack(at: number, from: number, to: number, dur = 60) {
  const f = useCurrentFrame();
  return interpolate(f, [at, at + dur], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
}

/** Fades a whole layer out over the last `dur` frames of its sequence. */
export const FadeOut: React.FC<{ total: number; dur?: number; children: React.ReactNode }> = ({ total, dur = 14, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [total - dur, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Cross-dissolve length for picture cuts inside a montage (frames). */
export const XF = 12;

/** Fades its picture in over the shot underneath. A montage shot's Sequence
 *  runs XF frames past its cut, and the next shot fades in on top of it, so
 *  every cut is a short dissolve instead of a jump. */
export const FadeIn: React.FC<{ dur?: number; children: React.ReactNode; on?: boolean }> = ({ dur = XF, children, on = true }) => {
  const f = useCurrentFrame();
  const o = on ? interpolate(f, [0, dur], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) }) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Short accent rule that draws itself in from the left. */
export const Rule: React.FC<{ at: number; width?: number; color?: string }> = ({ at, width = 64, color = C.mint }) => {
  const p = useIn(at, 22);
  return <div style={{ width, height: 3, background: color, transform: `scaleX(${p})`, transformOrigin: "0 50%" }} />;
};

export const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.mint }) => (
  <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 28, letterSpacing: "0.22em", textTransform: "uppercase", color }}>{children}</div>
);

export const Headline: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 110, style }) => (
  <div
    style={{
      fontFamily: DISPLAY,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 0.98,
      letterSpacing: "0.005em",
      textTransform: "uppercase",
      color: C.white,
      textShadow: "0 2px 24px rgba(6,9,26,0.5)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Lower-third caption: rule, kicker, title - one template for the whole
 *  film. `out` is the frame (in this sequence) where it eases away. */
export const LowerThird: React.FC<{ kicker?: string; title: React.ReactNode; at?: number; out?: number; size?: number; sub?: string }> = ({
  kicker,
  title,
  at = 4,
  out,
  size = 110,
  sub,
}) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", padding: `0 ${SAFE.x}px ${SAFE.bottom}px` }}>
    <Rise at={at} out={out} dur={20}>
      <Rule at={at} />
    </Rise>
    {kicker && (
      <Rise at={at + 4} out={out} style={{ marginTop: 22 }}>
        <Kicker>{kicker}</Kicker>
      </Rise>
    )}
    <Rise at={at + 8} out={out} style={{ marginTop: kicker ? 14 : 22 }}>
      <Headline size={size}>{title}</Headline>
    </Rise>
    {sub && (
      <Rise at={at + 16} out={out} style={{ marginTop: 16 }}>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 40, color: C.soft }}>{sub}</div>
      </Rise>
    )}
  </AbsoluteFill>
);

/** Film grain + vignette so stills and footage share one texture. The grain
 *  is fine and moves every frame (a still frame of grain reads as dirt). */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 24} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
