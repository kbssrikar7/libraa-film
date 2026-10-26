// 30-second motion-graphics piece for Libraa Group. Flat, geometric, no
// voice-over: every idea is carried by type and simple line art, one at a
// time, and each scene arrives on a wave-edged colour wipe (the sea line
// is the visual thread). Facts come from the website data via facts.ts;
// the only photo is the ANTIGOON hero on the closing card.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { CERTIFICATIONS, CLIENT_COUNT, CLIENTS, COMPANY, INDIA_MAP_VIEWBOX, INDIA_PATH, numberWord, PORTS, sitePhoto } from "../facts";
import { C, DS, Fonts, FONT } from "../ui";
import LOGO_DIMS from "../logo-dims.json";
import LAND_DOTS from "./land-dots.json";

export const MOTION_FRAMES = 900;

const expo = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.76, 0, 0.24, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** 0 -> 1 between frames a and b. */
const ramp = (f: number, a: number, b: number, e: (t: number) => number = expo) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

// ---------- scene timing (frames at 30 fps) ----------
const WIPE = 28;
const T = { open: 0, name: 108, services: 192, map: 444, proof: 702, close: 798 };
const STEP = 84; // frames per service

// ---------- building blocks ----------

/** A line of text that rises out of a mask, and (optionally) leaves upward. */
const Line: React.FC<{ at: number; out?: number; size: number; color?: string; weight?: number; halo?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at,
  out,
  size,
  color = C.white,
  weight,
  halo,
  style,
  children,
}) => {
  const f = useCurrentFrame();
  const i = ramp(f, at, at + 26);
  const o = out === undefined ? 0 : ramp(f, out, out + 18, inOut);
  return (
    <div style={{ overflow: "hidden", padding: `${size * 0.14}px 0`, margin: `${-size * 0.14}px 0`, ...style }}>
      <div
        style={{
          ...DS,
          ...(weight ? { fontWeight: weight } : {}),
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
          color,
          whiteSpace: "nowrap",
          ...(halo ? { WebkitTextStroke: `${size * 0.1}px ${halo}`, paintOrder: "stroke fill" } : {}),
          transform: `translateY(${((1 - i) - o) * size * 1.6}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Word set letter by letter, each rising out of its own mask. */
const Letters: React.FC<{ text: string; at: number; size: number; color?: string; gap?: number }> = ({ text, at, size, color = C.white, gap = 2 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ ...DS, fontSize: size, lineHeight: 1.08, letterSpacing: "-0.03em", color, whiteSpace: "pre", display: "flex" }}>
      {[...text].map((ch, i) => {
        const p = ramp(f, at + i * gap, at + i * gap + 30);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: `${size * 0.14}px 0`, margin: `${-size * 0.14}px 0` }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * size * 1.6}px)` }}>{ch}</span>
          </span>
        );
      })}
    </div>
  );
};

/** Sea line: three sine strokes that keep drifting, drawn on from the left. */
const Waves: React.FC<{ y: number; amp?: number; at?: number; color?: string; opacity?: number; width?: number }> = ({
  y,
  amp = 26,
  at = 0,
  color = C.green,
  opacity = 1,
  width = 1920,
}) => {
  const f = useCurrentFrame();
  const draw = ramp(f, at, at + 50, inOut);
  const layer = (dy: number, phase: number, a: number, k: number, sp: number) => {
    const pts: string[] = [];
    for (let x = -20; x <= width + 20; x += 16) pts.push(`${x},${(y + dy + a * amp * Math.sin(x * k + f * sp + phase)).toFixed(1)}`);
    return "M" + pts.join(" L");
  };
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <clipPath id={`wv-${y}`}>
          <rect x={0} y={0} width={draw * (width + 40)} height={1080} />
        </clipPath>
      </defs>
      <g clipPath={`url(#wv-${y})`} fill="none" strokeLinecap="round">
        <path d={layer(0, 0, 1, 0.0042, 0.05)} stroke={color} strokeWidth={7} />
        <path d={layer(44, 1.6, 0.8, 0.0052, 0.045)} stroke={color} strokeWidth={4} opacity={0.6} />
        <path d={layer(84, 3.1, 0.6, 0.0036, 0.06)} stroke={color} strokeWidth={3} opacity={0.35} />
      </g>
    </svg>
  );
};

/** A scene: solid ground that sweeps in upward behind a wave-shaped edge. */
const Scene: React.FC<{ bg: string; wipe?: boolean; children: React.ReactNode }> = ({ bg, wipe = true, children }) => {
  const f = useCurrentFrame();
  let clip: string | undefined;
  if (wipe && f < WIPE) {
    const y0 = interpolate(f, [0, WIPE], [1080 + 90, -90], { ...clamp, easing: inOut });
    const pts: string[] = [];
    for (let x = 0; x <= 1920; x += 40) pts.push(`${x}px ${(y0 + 44 * Math.sin(x / 150 + f * 0.3)).toFixed(1)}px`);
    clip = `polygon(${pts.join(",")}, 1920px 1200px, 0px 1200px)`;
  }
  return <AbsoluteFill style={{ background: bg, clipPath: clip }}>{children}</AbsoluteFill>;
};

// ---------- line-art icons for the three services ----------
const ICON = { stroke: C.mint, sw: 7 };
// nothing is drawn at p = 0: a zero-length dash with round caps still paints a dot
const Draw: React.FC<{ d: string; p: number; sw?: number; stroke?: string; fill?: string; fillP?: number }> = ({ d, p, sw = ICON.sw, stroke = ICON.stroke, fill, fillP = 0 }) =>
  p <= 0 ? null : (
  <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} fill={fill ?? "none"} fillOpacity={fillP} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
);

const ShipIcon: React.FC<{ f: number }> = ({ f }) => {
  const bob = Math.sin(f * 0.07) * 5;
  const t = (a: number, b: number) => ramp(f, a, b, inOut);
  return (
    <g>
      <g transform={`translate(0 ${bob})`}>
        <Draw d="M50,330 H470 L420,412 H110 Z" p={t(0, 34)} fill={C.green} fillP={ramp(f, 40, 60)} />
        <Draw d="M140,330 V262 H320 V330" p={t(14, 46)} />
        <Draw d="M185,262 V206 H275 V262" p={t(26, 56)} />
        <Draw d="M212,206 V160 H248 V206" p={t(34, 62)} />
        <Draw d="M340,330 V286 H440 V330 M390,286 V330" p={t(40, 68)} />
      </g>
      <Draw d="M30,458 q45,-28 90,0 t90,0 t90,0 t90,0 t90,0" p={t(10, 50)} sw={6} stroke={C.green} />
    </g>
  );
};

const CrewIcon: React.FC<{ f: number }> = ({ f }) => {
  const t = (a: number, b: number) => ramp(f, a, b, inOut);
  const person = (cx: number, cy: number, s: number, a: number, hero = false) => (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {t(a, a + 24) > 0 && <circle cx={0} cy={0} r={34} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t(a, a + 24)} fill={hero ? C.green : "none"} fillOpacity={hero ? ramp(f, a + 20, a + 40) : 0} stroke={ICON.stroke} strokeWidth={ICON.sw / s} />}
      <Draw d="M-78,118 A78,78 0 0 1 78,118" p={t(a + 6, a + 34)} sw={ICON.sw / s} />
    </g>
  );
  return (
    <g>
      {person(260, 190, 1.05, 0, true)}
      {person(120, 300, 0.78, 14)}
      {person(400, 300, 0.78, 24)}
      <Draw d="M60,450 H460" p={t(30, 62)} sw={5} stroke={C.green} />
    </g>
  );
};

const AnchorIcon: React.FC<{ f: number }> = ({ f }) => {
  const t = (a: number, b: number) => ramp(f, a, b, inOut);
  const sway = Math.sin(f * 0.06) * 2.2;
  return (
    <g transform={`rotate(${sway} 260 260)`}>
      {t(0, 24) > 0 && <circle cx={260} cy={100} r={30} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t(0, 24)} fill="none" stroke={ICON.stroke} strokeWidth={ICON.sw} />}
      <Draw d="M260,130 V430" p={t(10, 44)} />
      <Draw d="M195,180 H325" p={t(22, 48)} />
      <Draw d="M100,300 C100,390 180,432 260,432 C340,432 420,390 420,300" p={t(30, 70)} />
      <Draw d="M70,330 L100,296 L134,330 M386,330 L420,296 L450,330" p={t(52, 76)} />
      <circle cx={260} cy={432} r={12} fill={C.green} opacity={ramp(f, 60, 74)} />
    </g>
  );
};

// ---------- scenes ----------

const Open: React.FC = () => (
  <Scene bg={C.navy} wipe={false}>
    <Waves y={690} at={4} color={C.green} />
    <div style={{ position: "absolute", left: 160, top: 300 }}>
      <Line at={16} out={96} size={124}>Behind every voyage,</Line>
      <Line at={40} out={96} size={124} color={C.mint}>there is a team.</Line>
    </div>
  </Scene>
);

const Name: React.FC = () => (
  <Scene bg={C.green}>
    <Waves y={850} at={20} color={C.navy} opacity={0.55} />
    <div style={{ position: "absolute", left: 160, top: 300 }}>
      <Letters text="Libraa Group" at={26} size={230} />
      <div style={{ height: 26 }} />
      <Line at={62} size={78} color="rgba(255,255,255,0.9)" weight={500}>Since {COMPANY.founded}</Line>
    </div>
  </Scene>
);

const SERVICES = [
  { title: "Ship Management", text: "Technical and crew management of vessels, in India and abroad.", Icon: ShipIcon },
  { title: "Crew Management", text: "Recruitment and placement of seafarers.", Icon: CrewIcon },
  { title: "Marine Services", text: "Repairs, surveys, new-build supervision and offshore support.", Icon: AnchorIcon },
];

const Services: React.FC = () => {
  const f = useCurrentFrame();
  const local = WIPE - 6; // first title lands as the wipe settles
  const idx = Math.min(2, Math.max(0, Math.floor((f - local + 8) / STEP)));
  // the 2nd and 3rd titles land on the score's chord changes (9.8375 s, 12.65 s = frames 295, 379.5)
  const at = (i: number) => local + i * STEP - (i > 0 ? 3 : 0);
  return (
    <Scene bg={C.navy}>
      <Waves y={930} at={16} color={C.green} opacity={0.5} />
      {/* titles accumulate; the active one is bright, earlier ones step back */}
      <div style={{ position: "absolute", left: 160, top: 190 }}>
        {SERVICES.map((s, i) => {
          const active = i === idx;
          const dim = ramp(f, at(i + 1) - 4, at(i + 1) + 14);
          return (
            <div key={s.title} style={{ opacity: i > idx ? 1 : 1 - dim * 0.72, marginBottom: 26 }}>
              <Line at={at(i)} size={112} color={active ? C.white : C.white}>{s.title}</Line>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 160, top: 690, width: 900 }}>
        {SERVICES.map((s, i) => {
          const inn = ramp(f, at(i) + 18, at(i) + 38);
          const out = i < 2 ? ramp(f, at(i + 1) - 14, at(i + 1) - 2, inOut) : 0;
          return (
            <div key={s.title} style={{ position: "absolute", left: 0, top: 0, ...{ fontFamily: FONT, fontWeight: 500 }, fontSize: 44, lineHeight: 1.32, color: C.soft, opacity: inn * (1 - out), transform: `translateY(${(1 - inn) * 14}px)` }}>
              {s.text}
            </div>
          );
        })}
      </div>
      {/* icon panel: each service's picture draws on, the previous one leaves */}
      <svg width={520} height={520} viewBox="0 0 520 520" style={{ position: "absolute", left: 1290, top: 250, overflow: "visible" }}>
        {SERVICES.map((s, i) => {
          const lf = f - at(i) - 6;
          const out = i < 2 ? ramp(f, at(i + 1) - 10, at(i + 1) + 6, inOut) : 0;
          if (lf < 0 || out >= 1) return null;
          return (
            <g key={s.title} opacity={1 - out}>
              <s.Icon f={lf} />
            </g>
          );
        })}
      </svg>
    </Scene>
  );
};

// ---------- the globe: dot-matrix land from the Natural Earth texture ----------
const LAND = LAND_DOTS as [number, number][];
const RAD = Math.PI / 180;

type View = { lon: number; lat: number; R: number; cx: number; cy: number };
/** Orthographic projection; `h` lifts a point off the surface (for arcs). */
function project(lon: number, lat: number, v: View, h = 0) {
  const d = (lon - v.lon) * RAD;
  const φ = lat * RAD;
  const φ0 = v.lat * RAD;
  const k = v.R * (1 + h);
  return {
    x: v.cx + k * Math.cos(φ) * Math.sin(d),
    y: v.cy - k * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(d)),
    vis: Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(d) > 0.02,
    face: Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(d),
  };
}

const CHENNAI: [number, number] = [80.2707, 13.0827];
const LIBREVILLE: [number, number] = [9.4673, 0.4162];
// Cameroon is shown at country level (no city is named on the website)
const CAMEROON: [number, number] = [12.6, 5.6];
const PORT_LL: [number, number][] = [
  [78.1348, 8.7642],
  [76.2673, 9.9312],
  CHENNAI,
  [82.2475, 16.9891],
  [83.2185, 17.6868],
  [86.6108, 20.3163],
  [74.124, 14.8022],
  [92.7265, 11.6234],
];

/** Great-circle points between two lon/lat pairs. */
function greatCircle(a: [number, number], b: [number, number], n: number) {
  const v = (p: [number, number]) => [Math.cos(p[1] * RAD) * Math.cos(p[0] * RAD), Math.cos(p[1] * RAD) * Math.sin(p[0] * RAD), Math.sin(p[1] * RAD)];
  const A = v(a);
  const B = v(b);
  const om = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const w1 = Math.sin((1 - t) * om) / Math.sin(om);
    const w2 = Math.sin(t * om) / Math.sin(om);
    const x = w1 * A[0] + w2 * B[0];
    const y = w1 * A[1] + w2 * B[1];
    const z = w1 * A[2] + w2 * B[2];
    return { t, lon: Math.atan2(y, x) / RAD, lat: Math.asin(z) / RAD };
  });
}

const ARC = greatCircle(CHENNAI, LIBREVILLE, 90);

const Globe: React.FC<{ v: View; opacity: number; arc: number; ports: number }> = ({ v, opacity, arc, ports }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    g.setTransform(2, 0, 0, 2, 0, 0); // canvas is 2x so the globe stays sharp in a 4K render
    g.clearRect(0, 0, 1920, 1080);
    // the rim alone defines the globe: the sea is the paper itself, so label halos blend in
    g.beginPath();
    g.arc(v.cx, v.cy, v.R, 0, Math.PI * 2);
    g.lineWidth = 3;
    g.strokeStyle = C.navy;
    g.stroke();
    const r = Math.min(6.5, Math.max(1.8, v.R * 0.0044));
    // As the sphere turns away, the dot rows close up sideways (spacing ~ face) and run into
    // stripes, so dots shrink and fade with `face`; ten bands keep it one fill per band.
    const bands = Array.from({ length: 10 }, () => new Path2D());
    for (const [la, lo] of LAND) {
      const p = project(lo, la, v);
      if (!p.vis || p.x < -20 || p.x > 1940 || p.y < -20 || p.y > 1100) continue;
      const band = Math.min(9, Math.floor(p.face * 10));
      const rr = r * Math.min(1, (band + 0.5) * 0.13);
      bands[band].moveTo(p.x + rr, p.y);
      bands[band].arc(p.x, p.y, rr, 0, Math.PI * 2);
    }
    bands.forEach((b, i) => {
      g.fillStyle = `rgba(10,14,42,${(0.3 * Math.min(1, 0.35 + i * 0.1)).toFixed(3)})`;
      g.fill(b);
    });
    // Indian ports
    g.fillStyle = C.green;
    for (const [lo, la] of PORT_LL) {
      const p = project(lo, la, v);
      if (!p.vis) continue;
      g.beginPath();
      g.arc(p.x, p.y, Math.min(9, Math.max(3.2, v.R * 0.0075)) * ports, 0, Math.PI * 2);
      g.fill();
    }
    // route, lifted off the surface so it reads as a flight path
    const upto = Math.floor(arc * ARC.length);
    if (upto > 1) {
      g.beginPath();
      let pen = false;
      let last: { x: number; y: number } | null = null;
      for (let i = 0; i < upto; i++) {
        const q = ARC[i];
        const p = project(q.lon, q.lat, v, 0.1 * Math.sin(Math.PI * q.t));
        if (!p.vis) {
          pen = false;
          continue;
        }
        if (!pen) g.moveTo(p.x, p.y);
        else g.lineTo(p.x, p.y);
        pen = true;
        last = p;
      }
      g.lineWidth = 5;
      g.lineCap = "round";
      g.strokeStyle = C.green;
      g.stroke();
      if (last && arc < 1) {
        g.beginPath();
        g.arc(last.x, last.y, 11, 0, Math.PI * 2);
        g.fillStyle = C.green;
        g.fill();
      }
    }
  });
  return <canvas ref={ref} width={3840} height={2160} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, opacity }} />;
};

/** A pin that pops, with its name beside it. */
const Pin: React.FC<{ x: number; y: number; at: number; label: string; sub?: string; side?: "left" | "right" }> = ({ x, y, at, label, sub, side = "left" }) => {
  const f = useCurrentFrame();
  const pop = ramp(f, at, at + 16);
  const ring = ramp(f, at, at + 34, Easing.out(Easing.cubic));
  const t = ramp(f, at + 8, at + 28);
  return (
    <>
      <div style={{ position: "absolute", left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: "50%", border: `3px solid ${C.green}`, opacity: (1 - ring) * pop, transform: `scale(${0.3 + ring * 1.1})` }} />
      <div style={{ position: "absolute", left: x - 15, top: y - 15, width: 30, height: 30, borderRadius: "50%", background: C.green, border: `4px solid ${C.navy}`, boxSizing: "border-box", transform: `scale(${pop})` }} />
      <div
        style={{
          position: "absolute",
          top: y - 32,
          ...(side === "left" ? { right: 1920 - x + 34, textAlign: "right" } : { left: x + 34 }),
          opacity: t,
          transform: `translateX(${(1 - t) * (side === "left" ? 18 : -18)}px)`,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ ...DS, fontSize: 52, color: C.navy, lineHeight: 1.1, WebkitTextStroke: `10px ${C.paper}`, paintOrder: "stroke fill" }}>{label}</div>
        {sub ? <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 30, color: C.green, marginTop: 2, WebkitTextStroke: `8px ${C.paper}`, paintOrder: "stroke fill" }}>{sub}</div> : null}
      </div>
    </>
  );
};

// The outline draws on as one stroke; dashing restarts on every subpath, so the
// mainland (the longest subpath) is dashed and the islands fade in after it.
const INDIA_PARTS = INDIA_PATH.split(/(?=M)/);
const MAINLAND = INDIA_PARTS.reduce((a, b) => (b.length > a.length ? b : a));
const ISLANDS = INDIA_PARTS.filter((d) => d !== MAINLAND).join("");

const lerp = (f: number, a: number, b: number, from: number, to: number, e = inOut) => from + (to - from) * ramp(f, a, b, e);

const Map: React.FC = () => {
  const f = useCurrentFrame();
  const [, , vw, vh] = INDIA_MAP_VIEWBOX.split(" ").map(Number);
  const S = 1.0;
  const mapW = vw * S;
  const mapH = vh * S;
  const ox = 1090;
  const oy = 120;
  const pos = (x: number, y: number) => ({ x: ox + (x / 100) * mapW, y: oy + (y / 100) * mapH });
  const draw = ramp(f, 10, 46, inOut);
  const flat = 1 - ramp(f, 80, 92, inOut);

  // camera: India -> pull back to a globe -> settle on West Africa. The first view is
  // fitted (least squares on the eight ports) to the flat map, so the crossfade lines up;
  // the camera only moves once the crossfade is done. The pulled-back globe stays clear
  // of the title, and the final view puts the rim left of the title margin.
  const zoomOut = ramp(f, 88, 136, inOut);
  const zoomIn = ramp(f, 154, 204, inOut);
  const lnR = (a: number, b: number, t: number) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t);
  const v: View = {
    lon: 82.88 + (48 - 82.88) * zoomOut + (3 - 48) * zoomIn,
    lat: 22.5 + (12 - 22.5) * zoomOut + (2 - 12) * zoomIn,
    R: lnR(lnR(1565, 440, zoomOut), 1400, zoomIn),
    cx: 1494 + (1460 - 1494) * zoomOut + (1440 - 1460) * zoomIn,
    cy: 585 + (560 - 585) * zoomOut,
  };
  const arc = ramp(f, 122, 160, inOut);
  const globeIn = ramp(f, 78, 92);
  const lib = project(LIBREVILLE[0], LIBREVILLE[1], v);
  const cam = project(CAMEROON[0], CAMEROON[1], v);
  const india = project(CHENNAI[0], CHENNAI[1], v);
  return (
    <Scene bg={C.paper}>
      {f >= 78 && <Globe v={v} opacity={globeIn} arc={arc} ports={1} />}
      {flat > 0 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: flat }}>
          <g transform={`translate(${ox} ${oy}) scale(${S})`}>
            <path d={INDIA_PATH} fill={C.navy} fillOpacity={ramp(f, 30, 60) * 0.07} stroke="none" />
            {draw > 0 && <path d={MAINLAND} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} fill="none" stroke={C.navy} strokeWidth={3 / S} strokeLinejoin="round" strokeLinecap="round" />}
            <path d={ISLANDS} fill="none" stroke={C.navy} strokeWidth={3 / S} strokeLinejoin="round" opacity={ramp(f, 40, 52)} />
          </g>
          {PORTS.map((p, i) => {
            const a = 28 + i * 5;
            const q = pos(p.x, p.y);
            const pop = ramp(f, a, a + 14);
            const ring = ramp(f, a, a + 28, Easing.out(Easing.cubic));
            const hq = p.tag === "HQ";
            const r = hq ? 12 : 8;
            const dx = (p.labelDx / 100) * mapW;
            const dy = (p.labelDy / 100) * mapH;
            const anchor = p.labelAlign === "left" ? "start" : p.labelAlign === "right" ? "end" : "middle";
            return (
              <g key={p.name}>
                <circle cx={q.x} cy={q.y} r={r + ring * 26} fill="none" stroke={C.green} strokeWidth={3} opacity={(1 - ring) * pop} />
                <circle cx={q.x} cy={q.y} r={r * pop} fill={hq ? C.green : C.navy} />
                <text x={q.x + dx} y={q.y + dy + 10} textAnchor={anchor} style={{ fontFamily: FONT, fontWeight: 600 }} fontSize={30} fill={C.navy} stroke={C.paper} strokeWidth={8} paintOrder="stroke" strokeLinejoin="round" opacity={ramp(f, a + 8, a + 24)}>
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {f >= 100 && f < 176 && (
        <div style={{ position: "absolute", left: india.x + 34, top: india.y - 30, ...DS, fontSize: 52, color: C.navy, opacity: ramp(f, 100, 118) * (1 - ramp(f, 150, 166)), whiteSpace: "nowrap", WebkitTextStroke: `10px ${C.paper}`, paintOrder: "stroke fill" }}>
          India
        </div>
      )}
      <div style={{ position: "absolute", left: 160, top: 190 }}>
        <Line at={WIPE - 4} out={146} size={100} color={C.navy} halo={C.paper}>From India’s coasts</Line>
        <Line at={WIPE + 14} out={146} size={100} color={C.green} halo={C.paper}>to West Africa.</Line>
      </div>
      <div style={{ position: "absolute", left: 160, top: 190 }}>
        <Line at={176} size={120} color={C.navy} halo={C.paper}>West Africa</Line>
      </div>
      {f >= 190 && <Pin x={lib.x} y={lib.y} at={196} label="Libreville" sub="Gabon" side="left" />}
      {f >= 190 && <Pin x={cam.x} y={cam.y} at={210} label="Cameroon" side="left" />}
    </Scene>
  );
};

// logo files come from the website's data, so a renamed or redrawn logo is picked up.
// Sized by visual area (as in the film's client wall), so the tall Navy crest doesn't
// read smaller than the wide wordmarks; capped at the files' own 156 px height.
const LOGOS = ["Indian Navy", "Adani Ports & SEZ", "JSW Group"].map((name) => {
  const logo = CLIENTS.find((c) => c.name === name)!.logo;
  const [w, h] = (LOGO_DIMS as Record<string, number[]>)[logo.replace(/^\/photos\/logos\//, "logos-trim/")] ?? [1, 1];
  const height = Math.min(156, Math.sqrt(14000 / (w / h)), 200 / (w / h));
  return { name, src: sitePhoto(logo), width: height * (w / h), height };
});

const Proof: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(CLIENT_COUNT * ramp(f, WIPE - 6, WIPE + 34, Easing.out(Easing.cubic)));
  return (
    <Scene bg={C.navy}>
      <div style={{ position: "absolute", left: 160, top: 210, display: "flex", alignItems: "baseline", gap: 34 }}>
        <div style={{ ...DS, fontSize: 380, lineHeight: 1, letterSpacing: "-0.04em", color: C.white }}>{n}</div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 600 }}>
        <Line at={WIPE + 24} size={62}>clients across government,</Line>
        <Line at={WIPE + 32} size={62} color={C.mint}>industry and shipping.</Line>
      </div>
      {LOGOS.map((l, i) => {
        const p = ramp(f, WIPE + 14 + i * 12, WIPE + 40 + i * 12);
        return (
          <div key={l.name} style={{ position: "absolute", left: 1030 + i * 290, top: 190, width: 250, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
            <div style={{ width: 250, height: 250, background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={staticFile(l.src)} style={{ width: l.width, height: l.height }} />
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 28, whiteSpace: "nowrap", color: C.soft, marginTop: 18, lineHeight: 1.25 }}>{l.name}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 1030, top: 610, width: 800 }}>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 40, color: C.soft, marginBottom: 20, opacity: ramp(f, WIPE + 30, WIPE + 46) }}>
          {cap(numberWord(CERTIFICATIONS.length))} certifications &amp; licences
        </div>
        {/* straight from the website's data; two ISO 9001 certificates belong to different
            group companies, so each line carries its company's name in an aligned column */}
        <div style={{ display: "grid", gridTemplateColumns: "auto auto", justifyContent: "start", alignItems: "baseline", columnGap: 30, rowGap: 8 }}>
          {CERTIFICATIONS.map((c, i) => {
            // four lines, so a tighter stagger: the last settles before the end-card wipe
            const p = ramp(f, WIPE + 32 + i * 5, WIPE + 52 + i * 5);
            const move = { opacity: p, transform: `translateX(${(1 - p) * 30}px)`, whiteSpace: "nowrap" } as const;
            return (
              <React.Fragment key={c.number}>
                <span style={{ ...DS, fontSize: 48, color: C.white, ...move }}>{CERT_SHORT[c.standard] ?? c.standard}</span>
                <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 30, color: C.soft, ...move }}>{c.org.replace(" Pvt Ltd", "")}</span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};

// the same short labels as the 2-minute film's certificate list
const CERT_SHORT: Record<string, string> = { "ISM Document of Compliance": "ISM DOC", "RPSL Licence": "RPSL licence" };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 120], [1.05, 1.12], clamp);
  return (
    <Scene bg={C.navy}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img src={staticFile("site/hero/antigoon-2312.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(10,14,42,0.74)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, display: "flex", justifyContent: "center", opacity: ramp(f, WIPE - 6, WIPE + 14), transform: `translateY(${(1 - ramp(f, WIPE - 6, WIPE + 18)) * 30}px)` }}>
        <Img src={staticFile("libraa/logo.webp")} style={{ width: 300, height: "auto" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 500, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Line at={WIPE + 10} size={76} style={{ display: "flex", justifyContent: "center" }}>Ship Management, Crew Management</Line>
        <Line at={WIPE + 24} size={76} color={C.mint} style={{ display: "flex", justifyContent: "center" }}>and Marine Services.</Line>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", gap: 64, ...{ fontFamily: FONT, fontWeight: 600 }, fontSize: 52, color: C.white, opacity: ramp(f, WIPE + 44, WIPE + 64) }}>
        <span>{COMPANY.site}</span>
        <span style={{ color: C.soft, fontWeight: 500 }}>{COMPANY.email}</span>
      </div>
    </Scene>
  );
};

export const Motion30: React.FC = () => {
  const f = useCurrentFrame();
  const vol = interpolate(f, [0, 20, MOTION_FRAMES - 48, MOTION_FRAMES], [0, 0.75, 0.75, 0], clamp);
  const seq = (from: number, next: number | null, el: React.ReactNode) => (
    <Sequence from={from} durationInFrames={(next ?? MOTION_FRAMES) - from + (next ? WIPE + 2 : 0)} layout="none">
      {el}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <Fonts />
      <Audio src={staticFile("music/libraa-score-30s.wav")} volume={vol} />
      {seq(T.open, T.name, <Open />)}
      {seq(T.name, T.services, <Name />)}
      {seq(T.services, T.map, <Services />)}
      {seq(T.map, T.proof, <Map />)}
      {seq(T.proof, T.close, <Proof />)}
      {seq(T.close, null, <Close />)}
    </AbsoluteFill>
  );
};
