// Shared look for every scene: the website's palette and typeface, photo
// motion, and text reveals. Sized for a large landscape screen viewed from
// a few metres away - nothing important is smaller than ~34px at 1080p.
import React from "react";
import {
  AbsoluteFill,
  Easing,
  getInputProps,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
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

// Type. The client rejected Plus Jakarta Sans and then Barlow, so the look
// is one switchable option: render with --props='{"type":"montserrat"}' to
// compare. `TYPE_OPTION` is the default once the client picks. Every font
// is SIL Open Font License (fontsource on npm), free for commercial use.
type Face = { family: string; file: string; weights: number[] } | { family: string; variable: string; stretch: string };
type TypeOption = {
  label: string;
  faces: Face[];
  display: string;
  /** weight + width for titles and names */
  displayWeight: number;
  displayStretch?: string;
  /** base tracking for big titles, in em */
  tracking: number;
  body: string;
  bodyWeight: number;
  /** title size relative to Barlow Condensed (wide faces need less) */
  scale: number;
  /** set titles in capitals; a book face like CMU reads better as written */
  upper?: boolean;
};

export const TYPE_OPTIONS: Record<string, TypeOption> = {
  jakarta: {
    // Plus Jakarta Sans, the website's own face, set the way the site sets
    // its headings: semibold, tight tracking (-0.02em), sentence case.
    label: "Plus Jakarta Sans (website)",
    faces: [{ family: "Plus Jakarta Sans", file: "plus-jakarta-sans", weights: [400, 500, 600, 700] }],
    display: "'Plus Jakarta Sans'",
    displayWeight: 600,
    tracking: -0.02,
    body: "'Plus Jakarta Sans'",
    bodyWeight: 500,
    scale: 0.78,
    upper: false,
  },
  cmu: {
    // Computer Modern (CMU Serif), the client's pick: classic roman titles,
    // set in its regular weight - the bold cut is heavy at display sizes
    label: "Computer Modern (CMU Serif)",
    faces: [{ family: "CMU Serif", file: "cmu-serif", weights: [500, 700] }],
    display: "'CMU Serif'",
    displayWeight: 500,
    tracking: 0.02,
    body: "'CMU Serif'",
    bodyWeight: 500,
    scale: 0.92,
    upper: false,
  },
  barlow: {
    label: "Barlow Condensed + Barlow",
    faces: [
      { family: "Barlow Condensed", file: "barlow-condensed", weights: [400, 500, 600, 700] },
      { family: "Barlow", file: "barlow", weights: [400, 500, 600] },
    ],
    display: "'Barlow Condensed'",
    displayWeight: 600,
    tracking: 0.02,
    body: "Barlow",
    bodyWeight: 500,
    scale: 1,
  },
  montserrat: {
    label: "Montserrat",
    faces: [{ family: "Montserrat", file: "montserrat", weights: [500, 600, 700] }],
    display: "Montserrat",
    displayWeight: 700,
    tracking: 0.01,
    body: "Montserrat",
    bodyWeight: 500,
    scale: 0.72,
  },
  cormorant: {
    label: "Cormorant Garamond + Inter",
    faces: [
      { family: "Cormorant Garamond", file: "cormorant-garamond", weights: [500, 600, 700] },
      { family: "Inter", file: "inter", weights: [400, 500, 600] },
    ],
    display: "'Cormorant Garamond'",
    displayWeight: 600,
    tracking: 0.04,
    body: "Inter",
    bodyWeight: 500,
    scale: 0.95,
  },
  archivo: {
    label: "Archivo Expanded + Inter",
    faces: [
      { family: "Archivo", variable: "archivo-variable", stretch: "62% 125%" },
      { family: "Inter", file: "inter", weights: [400, 500, 600] },
    ],
    display: "Archivo",
    displayWeight: 700,
    displayStretch: "125%",
    tracking: 0.0,
    body: "Inter",
    bodyWeight: 500,
    scale: 0.6,
  },
  intertight: {
    label: "Inter Tight + Inter",
    faces: [
      { family: "Inter Tight", file: "inter-tight", weights: [500, 600, 700] },
      { family: "Inter", file: "inter", weights: [400, 500, 600] },
    ],
    display: "'Inter Tight'",
    displayWeight: 600,
    tracking: -0.01,
    body: "Inter",
    bodyWeight: 500,
    scale: 0.82,
  },
};

const TYPE_OPTION = "jakarta";
const chosen = String((getInputProps() as { type?: string }).type ?? TYPE_OPTION);
export const TYPE = TYPE_OPTIONS[chosen] ?? TYPE_OPTIONS[TYPE_OPTION];

export const DISPLAY = `${TYPE.display}, system-ui, sans-serif`;
export const FONT = `${TYPE.body}, system-ui, sans-serif`;
/** Spread into any title or name style: family, weight and width together. */
export const DS: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: TYPE.displayWeight, fontStretch: TYPE.displayStretch };

/** Title size in px, adjusted for the chosen face's width. */
export const px = (n: number) => Math.round(n * TYPE.scale);

export const Fonts: React.FC = () => (
  <style>
    {TYPE.faces
      .flatMap((f) =>
        "variable" in f
          ? [`@font-face{font-family:'${f.family}';font-weight:100 900;font-stretch:${f.stretch};font-display:block;src:url(${staticFile(`fonts/${f.variable}.woff2`)}) format("woff2");}`]
          : f.weights.map(
              (w) => `@font-face{font-family:'${f.family}';font-weight:${w};font-display:block;src:url(${staticFile(`fonts/${f.file}-${w}.woff2`)}) format("woff2");}`
            )
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
  /** per-photo levels from src/photo-tone.json, so a set of photos matches */
  tone?: { brightness: number; contrast: number };
}> = ({ src, from = 0, to, zoom = [1.04, 1.14], pan = [0, 0], position = "50% 50%", grade = 0.25, tone }) => {
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
          filter: `contrast(${(1.06 * (tone?.contrast ?? 1)).toFixed(3)}) saturate(0.88) brightness(${(0.97 * (tone?.brightness ?? 1)).toFixed(3)})`,
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
// bottom margin sized for large TVs, which can crop the frame edge
export const SAFE = { x: 160, bottom: 180 };

/** Text fades in with a small lift and fades out again before a cut
 *  (`out`, in frames). Nothing else: no blur, no mask, no bounce - the
 *  plain move an editor's title template makes. */
export const Rise: React.FC<{
  at: number;
  dur?: number;
  out?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  distance?: number;
}> = ({ at, dur = 18, out, children, style, distance = 10 }) => {
  const f = useCurrentFrame();
  const p = useIn(at, dur);
  const q = out === undefined ? 0 : interpolate(f, [out, out + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={style}>
      <div style={{ transform: `translateY(${(1 - p) * distance}px)`, opacity: p * (1 - q) }}>{children}</div>
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

/** Small supporting line under a title: plain, no tracking, no eyebrow. */
export const Sub: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.soft, size = 38 }) => (
  <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: size, color }}>{children}</div>
);

export const Headline: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 110, style }) => (
  <div
    style={{
      ...DS,
      fontSize: px(size),
      lineHeight: 1,
      letterSpacing: `${TYPE.tracking}em`,
      textTransform: TYPE.upper === false ? "none" : "uppercase",
      color: C.white,
      textShadow: "0 2px 24px rgba(6,9,26,0.5)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Lower-third title: the words, and at most one plain line under them.
 *  No rules, eyebrows or boxes. `out` is the frame where it fades away. */
export const LowerThird: React.FC<{ title: React.ReactNode; at?: number; out?: number; size?: number; sub?: string }> = ({
  title,
  at = 4,
  out,
  size = 96,
  sub,
}) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", padding: `0 ${SAFE.x}px ${SAFE.bottom}px` }}>
    <Rise at={at} out={out}>
      <Headline size={size}>{title}</Headline>
    </Rise>
    {sub && (
      <Rise at={at + 8} out={out} style={{ marginTop: 14 }}>
        <Sub size={46}>{sub}</Sub>
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

/** One piece of footage in a reel. `from` is seconds into the clip. */
export type Shot = { src: string; from?: number; rate?: number; zoom?: [number, number]; grade?: number };

/** Footage cut together at the given frames (`cuts` = start of each shot,
 *  plus the reel's end). Shots overlap by `xf` frames and dissolve, or cut
 *  hard with xf=0 - the way an editor lays B-roll on the timeline. */
export const Reel: React.FC<{ shots: Shot[]; cuts: number[]; xf?: number }> = ({ shots, cuts, xf = 0 }) => (
  <AbsoluteFill>
    {shots.map((s, i) => {
      const len = cuts[i + 1] - cuts[i];
      const last = i === shots.length - 1;
      return (
        <Sequence key={i} from={cuts[i]} durationInFrames={len + (last ? 0 : xf)}>
          <FadeIn on={i > 0 && xf > 0} dur={xf || 1}>
            <Clip src={s.src} startFrom={Math.round((s.from ?? 0) * 30)} rate={s.rate ?? 1} grade={s.grade ?? 0.12} zoom={s.zoom ?? [1.02, 1.07]} to={len + xf} />
          </FadeIn>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
