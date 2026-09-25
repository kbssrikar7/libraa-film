import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { INDIA_MAP_VIEWBOX, INDIA_PATH, LOCATION_COUNT, OFFICE_COUNT, OFFICES, PORTS, ship, sitePhoto } from "../facts";
import { beatsBetween, type TimedScene } from "../timing";
import { C, Clip, FadeIn, FONT, Headline, LowerThird, Sub, Photo, Rise, Scrim, useIn, XF } from "../ui";

type P = { d: number; at: number };

/** Split a scene into parts whose cut points land on music beats. `weights`
 *  (default all 1) lets one part run longer, e.g. an opening title shot. */
export function beatCuts(at: number, d: number, n: number, weights?: number[]): number[] {
  const beats = beatsBetween(at, at + d).map((b) => b - at);
  const w = weights ?? Array(n).fill(1);
  const wTotal = w.reduce((a, b) => a + b, 0);
  const cuts = [0];
  let acc = 0;
  for (let i = 1; i < n; i++) {
    acc += w[i - 1];
    const ideal = (d * acc) / wTotal;
    const b = beats.reduce((best, x) => (Math.abs(x - ideal) < Math.abs(best - ideal) ? x : best), beats[0] ?? ideal);
    cuts.push(b > cuts[cuts.length - 1] + 15 ? b : Math.round(ideal));
  }
  cuts.push(d);
  return cuts;
}

// Scene 3 - what Libraa does, one service per beat, all authentic material.
// Labels follow the narration's word order, and each beat cuts in just ahead
// of the words that name it (see `cues` in script.ts). KANGO on the slipway
// covers repairs, so the BITAM crew photo appears only once, in the safety scene.
const SERVICE_BEATS: { label: string; media: { photo?: string; clip?: string }; position?: string }[] = [
  { label: "Ship management", media: { photo: sitePhoto(ship("antigoon").photo) }, position: "50% 60%" },
  { label: "Surveys & repairs", media: { photo: sitePhoto(ship("kango").photo) }, position: "50% 45%" },
  { label: "New-build supervision", media: { clip: "libraa/vessel-launch.mp4" } },
  { label: "Offshore services", media: { photo: sitePhoto(ship("sejal").photo) } },
  { label: "Crew management", media: { photo: sitePhoto(ship("jhansi-rani").photo) }, position: "50% 55%" },
];

const LEAD_PICTURE = 6; // frames the picture arrives ahead of its words

export const Services: React.FC<P & { scene: TimedScene }> = ({ d, at, scene }) => {
  const voiceAt = (scene.voice?.from ?? at) - at; // voice start, in this scene's frames
  const cuts = scene.cues
    ? [0, ...scene.cues.slice(1).map((c) => Math.max(0, voiceAt + Math.round(c * 30) - LEAD_PICTURE)), d]
    : beatCuts(at, d, SERVICE_BEATS.length);
  return (
    <AbsoluteFill>
      {SERVICE_BEATS.map((b, i) => {
        const len = cuts[i + 1] - cuts[i];
        const last = i === SERVICE_BEATS.length - 1;
        // each shot runs on under the next one's dissolve
        return (
          <Sequence key={b.label} from={cuts[i]} durationInFrames={len + (last ? 0 : XF)}>
            <FadeIn on={i > 0}>
              {b.media.clip ? (
                <Clip src={b.media.clip} grade={0.2} zoom={[1.02, 1.1]} to={len + XF} />
              ) : (
                <Photo src={b.media.photo!} to={len + XF} zoom={i % 2 ? [1.12, 1.04] : [1.04, 1.12]} pan={i % 2 ? [1.5, -1.5] : [-1.5, 1.5]} position={b.position} grade={0.12} />
              )}
              <Scrim side="bottom" strength={b.media.clip ? 0.95 : 0.85} />
              {/* the caption eases out just before the dissolve, so two
                  captions never share the screen */}
              <LowerThird title={b.label} at={4} out={last ? len - 16 : len - 10} />
            </FadeIn>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Scene 4 - where: the eight locations light up in turn on the website's own
// India map (Government of India boundary), offices labelled.
export const MapScene: React.FC<P> = ({ d }) => {
  const f = useCurrentFrame();
  // no camera move on the map (client): it holds still and the pins bring
  // it to life; only the background light drifts
  const order = [...PORTS].sort((a, b) => (a.tag ? 0 : 1) - (b.tag ? 0 : 1)); // offices first
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(90% 90% at ${interpolate(f, [0, d], [64, 76])}% ${interpolate(f, [0, d], [42, 60])}%, ${C.navyMid} 0%, ${C.navy} 70%)`,
      }}
    >
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 0 0 140px", width: "52%" }}>
        <Rise at={4}>
          <Sub color={C.mint}>Where we work</Sub>
        </Rise>
        <Rise at={10} dur={22} style={{ marginTop: 34 }}>
          <Headline size={120}>
            {OFFICE_COUNT} offices
            <br />
            <span style={{ color: C.mint }}>{LOCATION_COUNT} locations</span>
          </Headline>
        </Rise>
        <Rise at={30} dur={22} style={{ marginTop: 40 }}>
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 42, color: C.soft, lineHeight: 1.5 }}>
            {OFFICES.map((o) => o.city).join("  ·  ")}
          </div>
        </Rise>
      </AbsoluteFill>
      <div style={{ position: "absolute", right: 110, top: 70, width: 900, height: 940, }}>
        <svg viewBox={INDIA_MAP_VIEWBOX} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d={INDIA_PATH} fill="rgba(255,255,255,0.2)" stroke="rgba(143,224,172,0.9)" strokeWidth={2} />
        </svg>
        {order.map((p, i) => (
          <Pin key={p.name} name={p.name} office={!!p.tag} x={p.x} y={p.y} at={20 + i * 14} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Pin: React.FC<{ name: string; office: boolean; x: number; y: number; at: number }> = ({ name, office, x, y, at }) => {
  const p = useIn(at, 16);
  const size = office ? 28 : 20;
  const labelLeft = x > 60 ? -1 : 1; // Port Blair label to the left
  return (
    <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", opacity: p }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: office ? C.white : C.mint,
          border: `3px solid ${office ? C.green : C.navy}`,
          transform: `scale(${0.4 + 0.6 * p})`,
        }}
      />
      {office && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            [labelLeft > 0 ? "left" : "right"]: size + 10,
            transform: "translateY(-50%)",
            whiteSpace: "nowrap",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 30,
            color: C.white,
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
          }}
        >
          {name}
        </div>
      )}
    </div>
  );
};
