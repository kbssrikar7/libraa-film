import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { ship, sitePhoto } from "../facts";
import { TYPE, C, Clip, DS, FadeIn, FONT, LowerThird, Photo, px, Rise, SAFE, Scrim, useTrack, XF } from "../ui";
import { beatCuts } from "./Work";

type P = { d: number; at: number };

// Scene 5 - fast fleet montage cut on the beat. KOUNDINYA is held back for
// its own hero scene. The montage opens on a wide shot that is NOT used in
// the Services scene just before it (JHANSI RANI closes Services), and the
// "11 vessels" title lives only on that opening shot - after it the ships
// carry just their name + flag.
// Only some of the many vessels Libraa has worked on, chosen for the best
// photographs (client). None repeats a ship already seen in Services
// (ANTIGOON, KANGO, SEJAL, JHANSI RANI), BITAM belongs to the safety beat and
// KOUNDINYA has its own hero scene.
const MONTAGE = [
  "rajendra-prasad",
  "tuticorin",
  "rani-gaidinliu",
  "capstar-1",
  "awala",
  "kalindi",
  "sejal-2",
  "ganesh",
  "sanvi-69",
  "supreme-diamond",
].map(ship);

export const Fleet: React.FC<P> = ({ d, at }) => {
  // the title shot runs a little longer; every ship after it gets an equal share
  const weights = MONTAGE.map(() => 1);
  const cuts = beatCuts(at, d, MONTAGE.length, weights);
  return (
    <AbsoluteFill>
      {MONTAGE.map((s, i) => {
        const len = cuts[i + 1] - cuts[i];
        const last = i === MONTAGE.length - 1;
        // a fast montage cuts hard on the beat - no dissolves, no fleet title
        // and no vessel count (client rule): the ships carry their names only
        return (
          <Sequence key={s.id} from={cuts[i]} durationInFrames={len}>
            <Photo src={sitePhoto(s.photo)} to={len} zoom={i % 2 ? [1.08, 1.03] : [1.03, 1.08]} pan={i % 2 ? [1, -1] : [-1, 1]} grade={0.1} />
            <Scrim side="bottom" strength={0.7} />
            <ShipName name={s.name} flag={s.flagName} out={last ? len - 16 : len - 8} />
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
      <div style={{ ...DS, fontSize: px(92), lineHeight: 1, letterSpacing: "0.02em", color: C.white, textShadow: "0 2px 24px rgba(6,9,26,0.5)" }}>{name}</div>
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
  const lift = interpolate(f, [0, 40], [0.55, 0.12], { extrapolateRight: "clamp" }); // opens from dark
  // the title clears before the hard cut, so it never overlaps the next scene
  const textOut = interpolate(f, [d - 18, d - 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const track = useTrack(30, TYPE.tracking + 0.06, TYPE.tracking, 110); // the name settles into place
  return (
    <AbsoluteFill>
      <Photo src={sitePhoto(k.photo)} to={d} zoom={[1.02, 1.2]} pan={[1.5, -2.5]} position="45% 55%" grade={lift} />
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
const FIELD: { src: string; text: string; position: string; clip?: boolean }[] = [
  { src: "site/cameroon-port-team.webp", text: "From India to West Africa", position: "50% 40%" },
  { src: "site/cameroon-shipyard-team.webp", text: "From India to West Africa", position: "50% 45%" },
  // stock, on the general safety line only - a welder gearing up, no face
  { src: "stock/mk-welder-safety.mp4", clip: true, text: "Every job starts with a toolbox talk", position: "50% 50%" },
  { src: sitePhoto(ship("bitam").photo), text: "Every job starts with a toolbox talk", position: "50% 72%" },
];

export const Field: React.FC<P> = ({ d, at }) => {
  const cuts = beatCuts(at, d, FIELD.length, [1.2, 1, 0.8, 1.2]);
  return (
    <AbsoluteFill>
      {FIELD.map((b, i) => {
        const len = cuts[i + 1] - cuts[i];
        const last = i === FIELD.length - 1;
        const newText = i === 0 || FIELD[i - 1].text !== b.text;
        const keepsText = !last && FIELD[i + 1].text === b.text;
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
