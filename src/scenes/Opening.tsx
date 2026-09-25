import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COMPANY } from "../facts";
import { beatCuts } from "./Work";
import { C, Clip, DS, FONT, px, Reel, Rise, type Shot, useIn, useTrack } from "../ui";

type P = { d: number };

// Scene 1 - a cold open on moving footage, cut on the music: a low flight
// over the sea at sunrise, a tanker at its berth from the air, then cranes
// working a port. Stock (Mixkit free licence) on a general line - "a
// voyage begins long before a vessel leaves port" - never shown as Libraa's.
const OPEN: Shot[] = [
  { src: "stock/mk-sunrise-sea-flyover.mp4", from: 0, zoom: [1.0, 1.04] },
  { src: "stock/mk-tanker-berth-aerial.mp4", from: 1, zoom: [1.04, 1.0] },
  { src: "stock/mk-port-cranes-wide.mp4", from: 2, zoom: [1.0, 1.05] },
];

export const Open: React.FC<P & { at: number }> = ({ d, at }) => {
  const f = useCurrentFrame();
  const cuts = beatCuts(at, d, OPEN.length, [1.3, 1, 1]);
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
  const track = useTrack(14, 0.3, 0.1, 90); // the name settles as it lands
  return (
    <AbsoluteFill>
      <Clip src="stock/mk-sea-flyover-dawn.mp4" startFrom={60} rate={0.6} grade={0.5} zoom={[1.05, 1.0]} to={d} />
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
