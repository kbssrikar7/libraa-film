import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { numberWord, CERTIFICATIONS, CLIENT_SECTORS, CLIENTS, COMPANY, COMPANY_COUNT, GROUP_COMPANIES, sitePhoto } from "../facts";
import LOGO_DIMS from "../logo-dims.json";
import { TYPE, C, Clip, DS, FONT, Headline, px, Rise, SAFE, Sub, useIn, useTrack } from "../ui";

type P = { d: number; at: number };

const SHORT: Record<string, string> = {
  "ISM Document of Compliance": "ISM DOC",
  "RPSL Licence": "RPSL licence",
};

// Scene 8 - the three companies on the left, the four certificates on the
// right, built in the order the narrator names them. Plain type and the
// real seals on a dark ground - no cards, borders, glows or light sweeps.
// A very slow push keeps the frame from sitting dead still.
export const Companies: React.FC<P> = ({ d }) => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, d], [1.0, 1.03]);
  const certsAt = 26;
  return (
    <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
      <Clip src="stock/px-ship-port-night.mp4" startFrom={30} rate={0.7} grade={0.72} zoom={[1.04, 1.0]} to={d} />
      {/* content clears before the clients scene washes in - no text-on-text */}
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 50%", opacity: interpolate(f, [d - 9, d - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <AbsoluteFill style={{ padding: `0 ${SAFE.x}px`, flexDirection: "row", alignItems: "center", gap: 90 }}>
          <div style={{ width: 780 }}>
            <Rise at={0}>
              <Sub color={C.mint}>{cap(numberWord(COMPANY_COUNT))} group companies</Sub>
            </Rise>
            <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 34 }}>
              {GROUP_COMPANIES.map((c, i) => (
                <Rise key={c.name} at={6 + i * 7}>
                  <div style={{ ...DS, fontSize: px(64), color: C.white, lineHeight: 1.05, whiteSpace: "nowrap" }}>{c.name}</div>
                  <Sub size={32}>{c.role}</Sub>
                </Rise>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Rise at={2}>
              <Sub color={C.mint}>Certified and licensed</Sub>
            </Rise>
            <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 30 }}>
              {CERTIFICATIONS.map((c, i) => (
                <Seal key={c.number} at={certsAt + i * 10} seal={sitePhoto(c.seal)} label={SHORT[c.standard] ?? c.standard} org={c.org} />
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const Seal: React.FC<{ at: number; seal: string; label: string; org: string }> = ({ at, seal, label, org }) => (
  <Rise at={at}>
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ width: 84, height: 84, borderRadius: "50%", background: C.white, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Img src={staticFile(seal)} style={{ width: 70, height: 70, objectFit: "contain" }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ ...DS, fontSize: px(56), color: C.white, whiteSpace: "nowrap", lineHeight: 1.05 }}>{label}</div>
        <div style={{ whiteSpace: "nowrap" }}><Sub size={28}>{org.replace(" Pvt Ltd", "")}</Sub></div>
      </div>
    </div>
  </Rise>
);

// Logos trimmed of their built-in padding (public/logos-trim, generated from
// the website's logos) and then sized by visual area rather than by box: a
// square emblem and a long wordmark each cover roughly the same area, so no
// logo reads as much bigger or smaller than its neighbours.
const trimmed = (logo: string) => logo.replace(/^\/photos\/logos\//, "logos-trim/");
const LOGO_AREA = 4200; // px^2 at 1080p, per tile
function logoSize(src: string, area = LOGO_AREA, maxH = 72, maxW = 148) {
  const [w, h] = (LOGO_DIMS as Record<string, number[]>)[src] ?? [2, 1];
  const aspect = w / h;
  let height = Math.sqrt(area / aspect);
  let width = height * aspect;
  if (height > maxH) { height = maxH; width = height * aspect; }
  if (width > maxW) { width = maxW; height = width / aspect; }
  return { width, height };
}

// Scene 9 - clients: the scene washes from navy to warm cream and the
// full client wall builds, Indian Navy first. No separate featured screen
// (client) and no client count.
export const Clients: React.FC<P> = () => {
  const f = useCurrentFrame();
  const wash = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <AbsoluteFill style={{ background: C.paper, opacity: wash }} />
      <AbsoluteFill style={{ padding: `100px 0 0 ${SAFE.x}px` }}>
        <Rise at={6} dur={20}>
          <Headline size={120} style={{ color: C.navy, textShadow: "none" }}>
            Our clients
          </Headline>
        </Rise>
      </AbsoluteFill>
      {/* a static, centred grid - nothing crosses the frame edge */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 340, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_COLS}, ${TILE_W}px)`, gap: 20, justifyContent: "center" }}>
          {ORDERED.map((c, i) => (
            <Tile key={c.name} at={14 + i * 2}>
              <Img src={staticFile(trimmed(c.logo))} style={{ ...logoSize(trimmed(c.logo)), objectFit: "contain" }} />
            </Tile>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const GRID_COLS = 9;
const TILE_W = 180;
const TILE_H = 104;
// grouped by sector (navy/government/ports, energy/industry, shipping) so
// similar organisations sit together
const LEAD = ["Indian Navy", "Adani Ports & SEZ", "JSW Group"];
const ORDERED = [
  ...LEAD.map((n) => CLIENTS.find((c) => c.name === n)!),
  ...CLIENT_SECTORS.flatMap((sec) => CLIENTS.filter((c) => c.sector === sec.id && !LEAD.includes(c.name))),
];

const Tile: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const p = useIn(at, 18);
  return (
    <div
      style={{
        width: TILE_W,
        height: TILE_H,
        background: C.white,
        display: "grid",
        placeItems: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
      }}
    >
      {children}
    </div>
  );
};

// Scene 10 - dusk sea, then the end card holds to 2:00.
export const End: React.FC<P> = ({ d }) => {
  const f = useCurrentFrame();
  const cardAt = 40;
  const card = useIn(cardAt, 30);
  const out = interpolate(f, [d - 12, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const track = useTrack(cardAt, TYPE.tracking + 0.06, TYPE.tracking, 120);
  return (
    <AbsoluteFill style={{ opacity: out, background: "#000" }}>
      {/* the clip is 12s; slow it just enough to cover the whole scene, so it
          never runs out and freezes on its last frame */}
      <Clip src="stock/px-sunset-ships-horizon.mp4" grade={0.2} zoom={[1.0, 1.06]} to={d} rate={Math.min(1, (12 * 30 - 6) / d)} />
      {/* lighter overlay so the moving sea stays visible behind the card, and a
          slow drift on the card itself - the long booth hold never goes still */}
      <AbsoluteFill style={{ background: `rgba(10,14,42,${0.25 + 0.42 * card})` }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 30,
          opacity: card,
          transform: `scale(${interpolate(f, [cardAt, d], [1.0, 1.035], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          textShadow: "0 2px 24px rgba(6,9,26,0.55)",
        }}
      >
        <div style={{ width: 170, height: 140, background: C.white, display: "grid", placeItems: "center" }}>
          <Img src={staticFile("libraa/logo.webp")} style={{ width: 134 }} />
        </div>
        <div style={{ ...DS, fontSize: px(130), lineHeight: 1, letterSpacing: `${track}em`, color: C.white, paddingLeft: `${track}em` }}>LIBRAA GROUP</div>
        {/* the approved closing tagline, word for word */}
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 40, letterSpacing: "0.02em", color: C.mint }}>Ship Management, Crew Management and Marine Services.</div>
        <div style={{ marginTop: 30, fontFamily: FONT, fontWeight: TYPE.bodyWeight, fontSize: 60, color: C.white, letterSpacing: "0.03em" }}>libraa.com</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 44, color: C.soft, letterSpacing: "0.03em" }}>{COMPANY.email}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
