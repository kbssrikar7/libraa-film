import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { FLAGS_ADJ, SHIPS, ship, sitePhoto } from "../facts";
import { C, DS, px, FadeIn, FONT, Headline, Kicker, LowerThird, Photo, Rise, Rule, SAFE, Scrim, useTrack, XF } from "../ui";
import { beatCuts } from "./Work";

type P = { d: number; at: number };

// Scene 5 - fast fleet montage cut on the beat. KOUNDINYA is held back for
// its own hero scene. The montage opens on a wide shot that is NOT used in
// the Services scene just before it (JHANSI RANI closes Services), and the
// "11 vessels" title lives only on that opening shot - after it the ships
// carry just their name + flag.
const OPENING_SHIP = "rajendra-prasad";
const MONTAGE = [
  ...SHIPS.filter((s) => s.id === OPENING_SHIP),
  ...SHIPS.filter((s) => s.id !== OPENING_SHIP && s.id !== "koundinya"),
];

export const Fleet: React.FC<P> = ({ d, at }) => {
  // the title shot runs a little longer; every ship after it gets an equal share
  const weights = MONTAGE.map((_, i) => (i === 0 ? 1.8 : 1));
  const cuts = beatCuts(at, d, MONTAGE.length, weights);
  return (
    <AbsoluteFill>
      {MONTAGE.map((s, i) => {
        const len = cuts[i + 1] - cuts[i];
        const last = i === MONTAGE.length - 1;
        return (
          <Sequence key={s.id} from={cuts[i]} durationInFrames={len + (last ? 0 : XF)}>
            <FadeIn on={i > 0}>
              <Photo src={sitePhoto(s.photo)} to={len + XF} zoom={i % 2 ? [1.1, 1.03] : [1.03, 1.1]} pan={i % 2 ? [1.5, -1.5] : [-1.5, 1.5]} grade={0.1} />
              <Scrim side="bottom" strength={0.8} />
              {i === 0 ? (
                // no vessel count anywhere (client rule) - the fleet is named, not counted
                <LowerThird kicker="Selected vessels" title={s.name} sub={`${FLAGS_ADJ.join(" & ")} flags`} at={8} out={len - 12} size={130} />
              ) : (
                <ShipName name={s.name} flag={s.flagName} out={last ? len - 16 : len - 8} />
              )}
            </FadeIn>
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
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 26, letterSpacing: "0.24em", textTransform: "uppercase", color: C.mint }}>{flag}</div>
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
  const track = useTrack(30, 0.22, 0.04, 110); // the name settles into place
  return (
    <AbsoluteFill>
      <Photo src={sitePhoto(k.photo)} to={d} zoom={[1.02, 1.2]} pan={[1.5, -2.5]} position="45% 55%" grade={lift} />
      <Scrim side="bottom" strength={0.85} />
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: `0 ${SAFE.x}px ${SAFE.bottom}px`, opacity: textOut }}>
        <Rise at={26} dur={20}>
          <Rule at={26} width={90} />
        </Rise>
        <Rise at={30} dur={34} style={{ marginTop: 24 }}>
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
const FIELD = [
  { src: "site/cameroon-port-team.webp", text: "From India to West Africa", position: "50% 40%" },
  { src: "site/cameroon-shipyard-team.webp", text: "From India to West Africa", position: "50% 45%" },
  { src: sitePhoto(ship("bitam").photo), text: "Every job starts with a toolbox talk", position: "50% 72%" },
];

export const Field: React.FC<P> = ({ d, at }) => {
  const cuts = beatCuts(at, d, FIELD.length);
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
              <Photo
                src={b.src}
                to={len + XF}
                zoom={[[1.04, 1.12], [1.12, 1.04], [1.02, 1.1]][i % 3] as [number, number]}
                pan={[[1.5, -1.5], [-1.5, 1.5], [0, 0]][i % 3] as [number, number]}
                position={b.position}
                grade={0.15}
              />
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
