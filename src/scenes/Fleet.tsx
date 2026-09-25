import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { ship, sitePhoto } from "../facts";
import { TYPE, C, Clip, DS, FadeIn, FONT, LowerThird, Photo, px, Rise, SAFE, Scrim, useTrack, XF } from "../ui";
import { beatCuts } from "./Work";
import TONE from "../photo-tone.json";

const tone = (id: string) => (TONE as Record<string, { brightness: number; contrast: number }>)[id];

type P = { d: number; at: number };

// Scene 5 - the fleet, cut hard on the beat, and the fleet line starts on
// its first ship. ANTIGOON, the biggest vessel Libraa works on, leads and is
// held longest with its type and length; KANGO, SEJAL and JHANSI RANI follow
// (client, Sept 2026), then the rest - only some of the many vessels Libraa
// has worked on, chosen for the best photographs. Every ship appears once:
// BITAM belongs to the safety beat and KOUNDINYA has its own hero scene.
const LEAD = ["antigoon", "kango", "sejal", "jhansi-rani"];
// After the lead four, shots are grouped so each hard cut joins two related
// images: close-ups at the quay, aerial ferries on teal water, vessels at sea
// in grey light, then red hulls on slipways - ending in the yard, so the cut
// to KOUNDINYA on calm water lands as a contrast.
const MONTAGE = [
  ...LEAD,
  "tuticorin",
  "rajendra-prasad",
  "rani-gaidinliu",
  "sejal-2",
  "ganesh",
  "capstar-1",
  "sanvi-69",
  "awala",
  "kalindi",
  "supreme-diamond",
].map(ship);
const POSITION: Record<string, string> = { antigoon: "50% 60%", kango: "50% 45%", "jhansi-rani": "50% 55%" };

export const Fleet: React.FC<P> = ({ d, at }) => {
  const cuts = beatCuts(at, d, MONTAGE.length, MONTAGE.map((s) => (s.id === "antigoon" ? 1.6 : 1)));
  return (
    <AbsoluteFill>
      {MONTAGE.map((s, i) => {
        const len = cuts[i + 1] - cuts[i];
        const last = i === MONTAGE.length - 1;
        const facts = s.id === "antigoon" ? [s.type, s.specs?.find((x) => x.label === "Length")?.value].filter(Boolean).join(" · ") : undefined;
        // no dissolves, no fleet title and no vessel count (client rule):
        // the ships carry their names only
        return (
          <Sequence key={s.id} from={cuts[i]} durationInFrames={len}>
            <Photo src={sitePhoto(s.photo)} to={len} zoom={i % 2 ? [1.08, 1.03] : [1.03, 1.08]} pan={i % 2 ? [1, -1] : [-1, 1]} position={POSITION[s.id]} grade={0.1} tone={tone(s.id)} />
            <Scrim side="bottom" strength={0.7} />
            <ShipName name={s.name} flag={facts ? `${s.flagName} · ${facts}` : s.flagName} out={last ? len - 16 : len - 8} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/** Ship caption: same lower-left spot on every ship, name then flag. */
const ShipName: React.FC<{ name: string; flag: string; out: number }> = ({ name, flag, out }) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", padding: `0 ${SAFE.x}px ${SAFE.bottom}px` }}>
    <Rise at={3} out={out} dur={16} distance={16}>
      <div style={{ ...DS, fontSize: px(104), lineHeight: 1, letterSpacing: "0.02em", color: C.white, textShadow: "0 2px 24px rgba(6,9,26,0.5)" }}>{name}</div>
    </Rise>
    <Rise at={7} out={out} dur={16} distance={12} style={{ marginTop: 12 }}>
      <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 34, color: C.soft }}>{flag}</div>
    </Rise>
  </AbsoluteFill>
);

// Scene 6 - everything slows down for KOUNDINYA, the ship Libraa built itself.
export const Hero: React.FC<P> = ({ d }) => {
  const k = ship("koundinya");
  const f = useCurrentFrame();
  // the title clears before the hard cut, so it never overlaps the next scene
  const textOut = interpolate(f, [d - 18, d - 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const track = useTrack(30, TYPE.tracking + 0.06, TYPE.tracking, 110); // the name settles into place
  return (
    <AbsoluteFill>
      <Photo src={sitePhoto(k.photo)} tone={tone(k.id)} to={d} zoom={[1.1, 1.24]} pan={[1.5, -2.5]} position="45% 55%" grade={0.12} />
      <Scrim side="bottom" strength={0.85} />
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: `0 ${SAFE.x}px ${SAFE.bottom}px`, opacity: textOut }}>
        <Rise at={30} dur={34}>
          <div style={{ ...DS, fontSize: px(220), letterSpacing: `${track}em`, color: C.white, lineHeight: 0.9, textShadow: "0 2px 30px rgba(6,9,26,0.5)" }}>{k.name}</div>
        </Rise>
        <Rise at={56} dur={24} style={{ marginTop: 22 }}>
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 44, color: C.mint }}>{k.status}</div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 7 - people on site from India to West Africa, then safety.
const FIELD: { src: string; text: string; sub?: string; position: string; clip?: boolean }[] = [
  // captions as the website gives them (GALLERY in libraa-website data.ts)
  { src: "site/cameroon-port-team.webp", text: "Cameroon", sub: "Libraa's team at the port", position: "50% 40%" },
  { src: "site/cameroon-shipyard-team.webp", text: "Cameroon", sub: "Libraa's team at the shipyard", position: "50% 45%" },
  // stock, on the general safety line only: a supervisor briefing a crew in
  // hard hats - an actual toolbox talk, not just someone in safety gear
  { src: "stock/px-toolbox-talk.mp4", clip: true, text: "Every job starts with a toolbox talk", position: "50% 50%" },
  { src: sitePhoto(ship("bitam").photo), text: "Every job starts with a toolbox talk", position: "50% 72%" },
];

export const Field: React.FC<P> = ({ d, at }) => {
  const cuts = beatCuts(at, d, FIELD.length, [1.2, 1, 0.8, 1.2]);
  return (
    <AbsoluteFill>
      {FIELD.map((b, i) => {
        const len = cuts[i + 1] - cuts[i];
        const last = i === FIELD.length - 1;
        const cap = (x: (typeof FIELD)[number]) => `${x.text}|${x.sub ?? ""}`;
        const newText = i === 0 || cap(FIELD[i - 1]) !== cap(b);
        const keepsText = !last && cap(FIELD[i + 1]) === cap(b);
        return (
          <Sequence key={b.src} from={cuts[i]} durationInFrames={len + (last ? 0 : XF)}>
            <FadeIn on={i > 0}>
              {b.clip ? (
                <Clip src={b.src} grade={0.15} zoom={[1.03, 1.08]} to={len + XF} />
              ) : (
              <Photo
                src={b.src}
                to={len + XF}
                zoom={[[1.04, 1.12], [1.12, 1.04], [1.02, 1.1]][i % 3] as [number, number]}
                pan={[[1.5, -1.5], [-1.5, 1.5], [0, 0]][i % 3] as [number, number]}
                position={b.position}
                grade={0.15}
              />
              )}
              <Scrim side="bottom" strength={0.9} />
            </FadeIn>
            {/* a line that carries across two shots stays put through the
                dissolve instead of re-animating */}
            <LowerThird
              title={b.text}
              sub={b.sub}
              at={newText ? 6 : -60}
              out={keepsText ? undefined : last ? len - 16 : len - 10}
              size={104}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
