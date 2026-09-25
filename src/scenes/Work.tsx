import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { INDIA_MAP_VIEWBOX, INDIA_PATH, LOCATION_COUNT, OFFICE_COUNT, OFFICES, PORTS, ship, sitePhoto } from "../facts";
import { beatsBetween, type TimedScene } from "../timing";
import { wordAt } from "../script";
import { SAFE, TYPE, C, Clip, FadeIn, FONT, Reel, type Shot, Headline, LowerThird, Sub, Photo, Rise, Scrim, useIn, XF } from "../ui";

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

// Scene 3 - what Libraa does, one service per beat, on stock footage that
// shows the kind of work (never presented as a Libraa ship or yard). Libraa's
// own ships are kept for the fleet, so none is seen twice (client).
// Labels follow the narration's word order, and each beat cuts in just ahead
// of the words that name it (see `cues` in script.ts).
const SERVICE_BEATS: { label: string; media: { photo?: string; clip?: string }; position?: string }[] = [
  { label: "Ship management", media: { clip: "stock/px-bulk-carrier-at-sea.mp4" } },
  { label: "Surveys & repairs", media: { clip: "stock/px-welding-sparks.mp4" } },
  { label: "New-build supervision", media: { clip: "stock/pb-shipyard-ship-dusk.mp4" } },
  { label: "Offshore services", media: { clip: "stock/px-offshore-rig-sunset.mp4" } },
  { label: "Crew management", media: { clip: "stock/px-crew-mooring-line.mp4" } },
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
              {/* the title arrives once its picture has dissolved in, never over
                  the outgoing shot */}
              <LowerThird title={b.label} at={i > 0 ? XF + 2 : 4} out={last ? len - 16 : len - 10} />
            </FadeIn>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Scene 4 - where: every office and operating port appears in turn on the
// website's own India map (Government of India boundary), each with its
// name, placed with the website's own label offsets. The map holds still
// (client: no zoom); only the pins and the background light move.
// The map box has the SVG's own 800x900 aspect, so pin percentages land
// exactly on the drawn coastline.
const MAP_H = 940;
const MAP_W = Math.round((MAP_H * 800) / 900);

export const MapScene: React.FC<P & { scene: TimedScene }> = ({ d, at, scene }) => {
  const f = useCurrentFrame();
  const order = [...PORTS].sort((a, b) => (a.tag ? 0 : 1) - (b.tag ? 0 : 1)); // offices first
  // each office lights up as the narrator names it, the other ports on
  // "locations" - the map keeps changing for as long as the line runs
  const voiceAt = (scene.voice?.from ?? at) - at;
  const lineSec = (scene.voice?.durationInFrames ?? 0) / 30;
  const onWord = (w: string) => voiceAt + Math.round(wordAt(scene, w, lineSec) * 30) - 4;
  const pinAt = (name: string, i: number) =>
    scene.line?.includes(name) ? onWord(name) : onWord("locations") + (i - OFFICE_COUNT) * 8;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(90% 90% at ${interpolate(f, [0, d], [64, 76])}% ${interpolate(f, [0, d], [42, 60])}%, ${C.navyMid} 0%, ${C.navy} 70%)`,
      }}
    >
      <AbsoluteFill style={{ justifyContent: "center", padding: `0 0 0 ${SAFE.x}px`, width: "50%" }}>
        <Rise at={4}>
          <Sub color={C.mint}>Where we work</Sub>
        </Rise>
        <Rise at={10} dur={22} style={{ marginTop: 28 }}>
          <Headline size={120}>
            {OFFICE_COUNT} offices
            <br />
            <span style={{ color: C.mint }}>{LOCATION_COUNT} locations</span>
          </Headline>
        </Rise>
      </AbsoluteFill>
      <div style={{ position: "absolute", right: 150, top: 70, width: MAP_W, height: MAP_H }}>
        <svg viewBox={INDIA_MAP_VIEWBOX} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d={INDIA_PATH} fill="rgba(255,255,255,0.16)" stroke="rgba(143,224,172,0.85)" strokeWidth={2} />
        </svg>
        {order.map((p, i) => (
          <Pin key={p.name} port={p} at={pinAt(p.name, i)} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Pin: React.FC<{ port: (typeof PORTS)[number]; at: number }> = ({ port, at }) => {
  const p = useIn(at, 16);
  const office = !!port.tag;
  const size = office ? 24 : 16;
  const shift = port.labelAlign === "center" ? "-50%" : port.labelAlign === "right" ? "-100%" : "0%";
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: `${port.x}%`,
          top: `${port.y}%`,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderRadius: "50%",
          background: office ? C.white : C.mint,
          border: `3px solid ${C.navy}`,
          opacity: p,
          transform: `scale(${0.4 + 0.6 * p})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${port.x + port.labelDx}%`,
          top: `${port.y + port.labelDy}%`,
          transform: `translate(${shift}, -50%)`,
          whiteSpace: "nowrap",
          fontFamily: FONT,
          fontWeight: office ? 700 : TYPE.bodyWeight,
          fontSize: office ? 40 : 34,
          color: office ? C.white : C.soft,
          textShadow: "0 2px 10px rgba(0,0,0,0.6)",
          opacity: p,
        }}
      >
        {port.name}
      </div>
    </>
  );
};
