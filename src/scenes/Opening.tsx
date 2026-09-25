import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COMPANY } from "../facts";
import { beatCuts } from "./Work";
import { TYPE, C, Clip, DS, FONT, px, Reel, Rise, type Shot, useIn, useTrack } from "../ui";

type P = { d: number };

// Scene 1 - a cold open on three strong shots, cut on the music: a tanker at
// sunset from the air, the view over a bow at sea, then a ship coming
// head-on at the drone. Stock (Pexels licence) on a
// general line - "a voyage begins long before a vessel leaves port" -
// never shown as a Libraa vessel.
const OPEN: Shot[] = [
  { src: "stock/px-tanker-sunset-aerial.mp4", from: 0, zoom: [1.0, 1.04] },
  { src: "stock/px-tanker-bow-at-sea.mp4", from: 1, zoom: [1.04, 1.0] },
  { src: "stock/px-ship-headon-drone.mp4", from: 2, zoom: [1.02, 1.06] },
];

export const Open: React.FC<P & { at: number }> = ({ d, at }) => {
  const f = useCurrentFrame();
  const cuts = beatCuts(at, d, OPEN.length, [1.3, 1, 1.2]);
  const fadeIn = interpolate(f, [0, 24], [0, 1], { extrapolateRight: "clamp" });
  // ease down toward navy before the logo, so the brand dissolve never flickers
  const dusk = interpolate(f, [d - 30, d], [0, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Reel shots={OPEN} cuts={cuts} xf={14} />
      <AbsoluteFill style={{ background: `rgba(10,14,42,${dusk})` }} />
    </AbsoluteFill>
  );
};

// Scene 2 - the brand lands over dark water: logo, name, "Since 2009".
export const Brand: React.FC<P> = ({ d }) => {
  const logo = useIn(4, 26);
  const track = useTrack(14, TYPE.tracking + 0.06, TYPE.tracking, 90); // the name settles as it lands
  return (
    <AbsoluteFill>
      <Clip src="stock/px-ship-silhouette-sunset.mp4" startFrom={30} rate={0.7} grade={0.45} zoom={[1.05, 1.0]} to={d} />
      <AbsoluteFill style={{ background: "radial-gradient(60% 60% at 50% 48%, rgba(10,14,42,0.2), rgba(10,14,42,0.75))" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        <div
          style={{
            width: 220,
            height: 180,
            background: C.white,
            display: "grid",
            placeItems: "center",
            opacity: logo,
            transform: `scale(${0.86 + 0.14 * logo})`,
          }}
        >
          <Img src={staticFile("libraa/logo.webp")} style={{ width: 174 }} />
        </div>
        <Rise at={16} dur={24}>
          <div style={{ ...DS, fontSize: px(150), lineHeight: 1, letterSpacing: `${track}em`, color: C.white, paddingLeft: `${track}em` }}>
            LIBRAA GROUP
          </div>
        </Rise>
        <Rise at={34} dur={22} distance={30}>
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 40, color: C.soft }}>Since {COMPANY.founded}</div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
