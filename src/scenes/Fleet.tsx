import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { FLAGS_ADJ, FLEET_COUNT, SHIPS, ship, sitePhoto } from "../facts";
import { C, FONT, Headline, Kicker, Photo, Rise, Scrim, useIn } from "../ui";
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
  const weights = MONTAGE.map((_, i) => (i === 0 ? 1.5 : 1));
  const cuts = beatCuts(at, d, MONTAGE.length, weights);
  const title = useIn(6, 22);
  const f = useCurrentFrame();
  // the title belongs to the opening shot only and leaves with it on the cut -
  // no fade across the cut, so it never ghosts over the next ship
  const titleOut = f < cuts[1] ? 1 : 0;
  const capOut = interpolate(f, [d - 12, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {MONTAGE.map((s, i) => {
        const len = cuts[i + 1] - cuts[i];
        return (
          <Sequence key={s.id} from={cuts[i]} durationInFrames={len}>
            <Photo src={sitePhoto(s.photo)} to={len} zoom={i % 2 ? [1.12, 1.04] : [1.04, 1.12]} pan={i % 2 ? [2, -2] : [-2, 2]} grade={0.1} />
            <Scrim side="bottom" strength={0.7} />
            {i > 0 && (
              <AbsoluteFill
                style={{
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  padding: "0 140px 130px",
                  opacity: capOut,
                  // soft dark pool behind the caption, for bright/light shots
                  background: "radial-gradient(38% 30% at 88% 88%, rgba(10,14,42,0.62) 0%, rgba(10,14,42,0) 100%)",
                }}
              >
                <Rise at={2} dur={12} distance={24}>
                  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 54, letterSpacing: "0.12em", color: C.white, textAlign: "right" }}>{s.name}</div>
                  <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, letterSpacing: "0.18em", color: C.mint, textAlign: "right", textTransform: "uppercase", marginTop: 8 }}>
                    {s.flagName}
                  </div>
                </Rise>
              </AbsoluteFill>
            )}
          </Sequence>
        );
      })}
      {/* the headline rides over the first half of the montage */}
      <AbsoluteFill style={{ opacity: titleOut }}>
        <Scrim side="left" strength={0.75} />
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 140px" }}>
          <div style={{ opacity: title }}>
            <Kicker>Our fleet</Kicker>
          </div>
          <Rise at={10} dur={22} style={{ marginTop: 30 }}>
            <Headline size={200} style={{ letterSpacing: "-0.03em" }}>
              {FLEET_COUNT} vessels
            </Headline>
          </Rise>
          <Rise at={24} dur={20} style={{ marginTop: 18 }}>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 48, color: C.soft }}>{FLAGS_ADJ.join(" & ")} flags</div>
          </Rise>
          <Rise at={34} dur={18} style={{ marginTop: 26 }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, letterSpacing: "0.12em", color: C.white }}>
              {MONTAGE[0].name} <span style={{ color: C.mint, fontWeight: 600 }}>· {MONTAGE[0].flagName}</span>
            </div>
          </Rise>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 6 - everything slows down for KOUNDINYA, the ship Libraa built itself.
export const Hero: React.FC<P> = ({ d }) => {
  const k = ship("koundinya");
  const f = useCurrentFrame();
  const lift = interpolate(f, [0, 40], [0.55, 0.12], { extrapolateRight: "clamp" }); // opens from dark
  // the title clears before the hard cut, so it never overlaps the next scene
  const textOut = interpolate(f, [d - 18, d - 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Photo src={sitePhoto(k.photo)} to={d} zoom={[1.02, 1.2]} pan={[1.5, -2.5]} position="45% 55%" grade={lift} />
      <Scrim side="bottom" strength={0.85} />
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 140px 150px", opacity: textOut }}>
        <Rise at={30} dur={26}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 168, letterSpacing: "0.16em", color: C.white, lineHeight: 1 }}>{k.name}</div>
        </Rise>
        <Rise at={52} dur={24} style={{ marginTop: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: FONT, fontWeight: 600, fontSize: 46, color: C.mint }}>
            <span style={{ width: 70, height: 3, background: C.mint }} />
            {k.status}
          </div>
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
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {FIELD.map((b, i) => {
        const len = cuts[i + 1] - cuts[i];
        const newText = i === 0 || FIELD[i - 1].text !== b.text;
        return (
          <Sequence key={b.src} from={cuts[i]} durationInFrames={len}>
            <Photo
              src={b.src}
              to={len}
              zoom={[[1.04, 1.14], [1.14, 1.04], [1.02, 1.12]][i % 3] as [number, number]}
              pan={[[2, -2], [-2, 2], [0, 0]][i % 3] as [number, number]}
              position={b.position}
              grade={0.15}
            />
            <Scrim side="bottom" strength={0.9} />
            <AbsoluteFill
              style={{
                justifyContent: "flex-end",
                padding: "0 140px 150px",
                opacity: i === FIELD.length - 1 ? interpolate(f, [cuts[i] + len - 16, cuts[i] + len - 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1,
              }}
            >
              {newText ? (
                <Rise at={6} dur={20}>
                  <Headline size={96}>{b.text}</Headline>
                </Rise>
              ) : (
                <Headline size={96}>{b.text}</Headline>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
