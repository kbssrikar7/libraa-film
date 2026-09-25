import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CERT_COUNT, CERTIFICATIONS, CLIENT_COUNT, CLIENT_SECTORS, CLIENTS, COMPANY, COMPANY_COUNT, GROUP_COMPANIES, sitePhoto } from "../facts";
import LOGO_DIMS from "../logo-dims.json";
import { C, Clip, FONT, Headline, Kicker, Rise, useIn } from "../ui";

type P = { d: number; at: number };

const SHORT: Record<string, string> = {
  "ISM Document of Compliance": "ISM DOC",
  "RPSL Licence": "RPSL licence",
};

// Scene 8 - both headings land at once (so the viewer never reads a half-built
// layout), the three companies and four certificates build within ~3s, then
// the composition holds with restrained micro-motion: a slow camera push, a
// soft light sweep across the cards and a gentle glow on the seals. Alive,
// never frozen - and never bouncing.
export const Companies: React.FC<P> = ({ d }) => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, d], [1.0, 1.035]);
  const certsAt = 26;
  return (
    <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
      {/* slow-drifting light keeps the background alive */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 90% at ${interpolate(f, [0, d], [18, 32])}% ${interpolate(f, [0, d], [30, 45])}%, ${C.navyMid} 0%, ${C.navy} 72%)`,
        }}
      />
      {/* content clears before the clients scene washes in - no text-on-text */}
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "60% 55%", opacity: interpolate(f, [d - 9, d - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <AbsoluteFill style={{ padding: "120px 120px", flexDirection: "row", gap: 80 }}>
          <div style={{ width: 620, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Rise at={0} dur={16}>
              <Kicker>{COMPANY_COUNT} group companies</Kicker>
            </Rise>
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 30 }}>
              {GROUP_COMPANIES.map((c, i) => (
                <Rise key={c.name} at={6 + i * 7} dur={18}>
                  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, color: C.white, lineHeight: 1.15 }}>{c.name}</div>
                  <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 30, color: C.mint, marginTop: 6 }}>{c.role}</div>
                </Rise>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Rise at={2} dur={18}>
              <Headline size={72}>
                {CERT_COUNT} certifications
                <br />& licences
              </Headline>
            </Rise>
            <div style={{ marginTop: 50, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, position: "relative" }}>
              {CERTIFICATIONS.map((c, i) => (
                <Seal key={c.number} at={certsAt + i * 10} seal={sitePhoto(c.seal)} label={SHORT[c.standard] ?? c.standard} org={c.org} />
              ))}
              <Sweep start={certsAt + 50} period={d} />
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** One soft highlight gliding across the cards, once, after they settle. */
const Sweep: React.FC<{ start: number; period: number }> = ({ start, period }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [start, start + Math.max(90, period - start - 20)], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderRadius: 18,
        background: `linear-gradient(100deg, rgba(255,255,255,0) ${x - 18}%, rgba(255,255,255,0.10) ${x}%, rgba(255,255,255,0) ${x + 18}%)`,
      }}
    />
  );
};

const Seal: React.FC<{ at: number; seal: string; label: string; org: string }> = ({ at, seal, label, org }) => {
  const f = useCurrentFrame();
  const p = useIn(at, 22);
  const glow = 0.25 + 0.2 * Math.sin((f - at) / 22); // slow breathing glow
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "22px 24px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.14)",
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px) scale(${1.03 - 0.03 * p})`,
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: C.white,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          boxShadow: `0 0 ${18 + 10 * glow}px rgba(143,224,172,${p > 0.99 ? glow : 0})`,
        }}
      >
        <Img src={staticFile(seal)} style={{ width: 72, height: 72, objectFit: "contain" }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.white, whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 22, color: C.soft, marginTop: 4, whiteSpace: "nowrap" }}>{org.replace(" Pvt Ltd", "")}</div>
      </div>
    </div>
  );
};

// Logos trimmed of their built-in padding (public/logos-trim, generated from
// the website's logos) and then sized by visual area rather than by box: a
// square emblem and a long wordmark each cover roughly the same area, so no
// logo reads as much bigger or smaller than its neighbours.
const trimmed = (logo: string) => logo.replace(/^\/photos\/logos\//, "logos-trim/");
const LOGO_AREA = 4200; // px^2 at 1080p, per tile
function logoSize(src: string) {
  const [w, h] = (LOGO_DIMS as Record<string, number[]>)[src] ?? [2, 1];
  const aspect = w / h;
  let height = Math.sqrt(LOGO_AREA / aspect);
  let width = height * aspect;
  if (height > 72) { height = 72; width = height * aspect; }
  if (width > 148) { width = 148; height = width / aspect; }
  return { width, height };
}

// Scene 9 - client logos flow past in three sector rows. The scene dissolves
// in over the previous one with its title already in place (never an empty
// cream frame), and the rows fade at the screen edges so logos enter and
// leave deliberately rather than being clipped.
export const Clients: React.FC<P> = ({ d }) => {
  const f = useCurrentFrame();
  // navy -> warm cream wash, with the title and rows emerging in the same move
  // ~0.27s wash, eased so it races through the grey midpoint and the cream
  // settles almost at once; the title and rows come in right behind it
  const wash = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const content = interpolate(f, [5, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <AbsoluteFill style={{ background: C.paper, opacity: wash }} />
      <AbsoluteFill style={{ opacity: content }}>
      <AbsoluteFill style={{ padding: "90px 0 0 140px" }}>
        <Rise at={-20}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 36 }}>
            <Headline size={130} style={{ color: C.navy, textShadow: "none" }}>
              {CLIENT_COUNT} clients
            </Headline>
          </div>
        </Rise>
        <Rise at={-10} dur={20} style={{ marginTop: 10 }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: "rgba(10,14,42,0.62)" }}>Navy · Ports · Energy · Shipping</div>
        </Rise>
      </AbsoluteFill>
      {/* a static, centred grid - nothing crosses the frame edge. Logos fade
          in one after another, then the whole grid pushes in very slowly */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 400,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${interpolate(f, [0, d], [1, 1.04])})`,
          transformOrigin: "50% 40%",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_COLS}, ${TILE_W}px)`, gap: 20, justifyContent: "center" }}>
          {ORDERED.map((c, i) => (
            <Tile key={c.name} at={14 + i * 2}>
              <Img src={staticFile(trimmed(c.logo))} style={{ ...logoSize(trimmed(c.logo)), objectFit: "contain" }} />
            </Tile>
          ))}
        </div>
      </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const GRID_COLS = 9;
const TILE_W = 180;
const TILE_H = 104;
// grouped by sector (navy/government/ports, energy/industry, shipping) so
// similar organisations sit together
const ORDERED = CLIENT_SECTORS.flatMap((sec) => CLIENTS.filter((c) => c.sector === sec.id));

const Tile: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const p = useIn(at, 18);
  return (
    <div
      style={{
        width: TILE_W,
        height: TILE_H,
        borderRadius: 14,
        background: C.white,
        boxShadow: "0 8px 24px rgba(10,14,42,0.08)",
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
  return (
    <AbsoluteFill style={{ opacity: out, background: "#000" }}>
      {/* the clip is 14s; slow it just enough to cover the whole scene, so it
          never runs out and freezes on its last frame */}
      <Clip src="stock/dusk-sea.mp4" grade={0.2} zoom={[1.0, 1.08]} to={d} rate={Math.min(1, (14 * 30 - 6) / d)} />
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
        <div style={{ width: 170, height: 140, borderRadius: 30, background: C.white, display: "grid", placeItems: "center", boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
          <Img src={staticFile("libraa/logo.webp")} style={{ width: 134 }} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 96, letterSpacing: "0.22em", color: C.white, paddingLeft: "0.22em" }}>LIBRAA GROUP</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 38, letterSpacing: "0.08em", color: C.mint }}>Shipbuilding · Ship Management · Marine Services</div>
        <div style={{ marginTop: 30, fontFamily: FONT, fontWeight: 700, fontSize: 64, color: C.white, letterSpacing: "0.03em" }}>libraa.com</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 44, color: C.soft, letterSpacing: "0.03em" }}>{COMPANY.email}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
