import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { COMPANY } from "../facts";
import { C, Clip, FONT, Rise, useIn } from "../ui";

type P = { d: number };

// Scene 1 - atmosphere only: sunrise over open sea, then a hull cutting
// through water. Stock, no identifiable vessel, no text.
export const Open: React.FC<P> = ({ d }) => {
  const f = useCurrentFrame();
  const cut = Math.round(d * 0.46);
  const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  // ease the sea down toward navy before the logo scene, so there's no
  // sudden dark flicker when the brand dissolves in
  const dusk = interpolate(f, [d - 30, d], [0, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <AbsoluteFill style={{ background: `rgba(10,14,42,${dusk})`, zIndex: 5 }} />
      <Sequence durationInFrames={cut + 12}>
        <Clip src="stock/sunrise-sea.mp4" grade={0.1} zoom={[1.02, 1.1]} to={cut + 12} />
      </Sequence>
      <Sequence from={cut} durationInFrames={d - cut}>
        <CrossIn>
          <Clip src="stock/bow-water.mp4" startFrom={30} grade={0.12} zoom={[1.08, 1.0]} to={d - cut} />
        </CrossIn>
      </Sequence>
    </AbsoluteFill>
  );
};

const CrossIn: React.FC<{ children: React.ReactNode; dur?: number }> = ({ children, dur = 12 }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, dur], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};

// Scene 2 - the brand lands over dark water: logo, name, "Since 2009".
export const Brand: React.FC<P> = ({ d }) => {
  const logo = useIn(4, 26);
  return (
    <AbsoluteFill>
      <Clip src="stock/dark-water.mp4" grade={0.45} zoom={[1.05, 1.0]} to={d} />
      <AbsoluteFill style={{ background: "radial-gradient(60% 60% at 50% 48%, rgba(10,14,42,0.2), rgba(10,14,42,0.75))" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        <div
          style={{
            width: 220,
            height: 180,
            borderRadius: 34,
            background: C.white,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            opacity: logo,
            transform: `scale(${0.86 + 0.14 * logo})`,
          }}
        >
          <Img src={staticFile("libraa/logo.webp")} style={{ width: 174 }} />
        </div>
        <Rise at={16} dur={24}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 118, letterSpacing: "0.22em", color: C.white, paddingLeft: "0.22em" }}>
            LIBRAA GROUP
          </div>
        </Rise>
        <Rise at={34} dur={22} distance={30}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: FONT, fontWeight: 500, fontSize: 38, letterSpacing: "0.3em", color: C.mint, textTransform: "uppercase" }}>
            <span style={{ width: 70, height: 2, background: C.mint }} />
            Since {COMPANY.founded}
            <span style={{ width: 70, height: 2, background: C.mint }} />
          </div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
