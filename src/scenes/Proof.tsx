import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { numberWord, CERTIFICATIONS, CLIENT_COUNT, CLIENT_SECTORS, CLIENTS, CLIENTS_TEXT_ONLY, COMPANY, COMPANY_COUNT, GROUP_COMPANIES, sitePhoto } from "../facts";
import LOGO_DIMS from "../logo-dims.json";
import { wordAt } from "../script";
import type { TimedScene } from "../timing";
import { TYPE, C, Clip, DS, FONT, Headline, px, Rise, SAFE, Sub, useIn, useTrack } from "../ui";

type P = { d: number; at: number };

const SHORT: Record<string, string> = {
  "ISM Document of Compliance": "ISM DOC",
  "RPSL Licence": "RPSL licence",
};

// Scene 8 - the three companies on the left, the four certificates on the
// right, built in the order the narrator names them. Plain type and the
// real seals on a dark ground - no cards, borders, glows or light sweeps.
// The text stays perfectly still (scaling live text makes it shimmer); the
// footage behind it carries the motion.
export const Companies: React.FC<P> = ({ d }) => {
  const f = useCurrentFrame();
  const certsAt = 26;
  return (
    <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
      <Clip src="stock/pb-shipyard-cranes-dusk.mp4" startFrom={15} rate={0.8} grade={0.68} zoom={[1.04, 1.0]} to={d} />
      {/* the text fades out while the clients scene dissolves in over the same
          dusk footage (whose first logo only lands on "Indian Navy"), so there
          is no text-on-text and no empty stretch between the two */}
      <AbsoluteFill style={{ opacity: interpolate(f, [d - 18, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        {/* both columns hang from the same top line, so their headings align */}
        <AbsoluteFill style={{ padding: `0 ${SAFE.x}px`, justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 90 }}>
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
              <Sub color={C.mint}>{cap(numberWord(CERTIFICATIONS.length))} certifications & licences</Sub>
            </Rise>
            <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 30 }}>
              {CERTIFICATIONS.map((c, i) => (
                <Seal key={c.number} at={certsAt + i * 10} seal={sitePhoto(c.seal)} label={SHORT[c.standard] ?? c.standard} org={c.org} />
              ))}
            </div>
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
        <div style={{ ...DS, fontSize: px(72), color: C.white, whiteSpace: "nowrap", lineHeight: 1.05 }}>{label}</div>
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
const LOGO_AREA = 5600; // px^2 at 1080p, per tile - sized for a large TV
function logoSize(src: string, area = LOGO_AREA, maxH = 84, maxW = 160) {
  const [w, h] = (LOGO_DIMS as Record<string, number[]>)[src] ?? [2, 1];
  const aspect = w / h;
  let height = Math.sqrt(area / aspect);
  let width = height * aspect;
  if (height > maxH) { height = maxH; width = height * aspect; }
  if (width > maxW) { width = maxW; height = width / aspect; }
  return { width, height };
}

// Scene 9 - clients, on the film's own navy so there is no jump from the
// certificates. The Indian Navy, Adani Ports and JSW land on large tiles as
// the narrator names them (measured `marks`). On "port authorities" the row
// lifts, "31 clients" (the website's own count) counts up, and the rest of
// the logos fade in as one still wall, grouped by sector. After the line,
// the five clients without a logo are named, as on the website.
const LEAD = ["Indian Navy", "Adani Ports & SEZ", "JSW Group"];
const LEAD_WORD: Record<string, string> = { "Indian Navy": "Indian Navy", "Adani Ports & SEZ": "Adani", "JSW Group": "JSW" };

const FEAT_W = 540;
const FEAT_H = 220;
const FEAT_GAP = 30;
const M_W = 196; // 8 columns fill the same 1680px as the three named tiles
const M_H = 108;
const M_GAP = 16;

/** The rest of the logos as one still wall: each tile fades in, then nothing moves. */
const WALL_COLS = 8;
const WallTile: React.FC<{ client: (typeof CLIENTS)[number]; at: number }> = ({ client, at }) => {
  const p = useIn(at, 20);
  return (
    <div style={{ width: M_W, height: M_H, background: C.white, display: "grid", placeItems: "center", opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
      <Logo client={client} big={false} />
    </div>
  );
};

export const Clients: React.FC<P & { scene: TimedScene }> = ({ d, at, scene }) => {
  const f = useCurrentFrame();
  const voiceAt = (scene.voice?.from ?? at) - at;
  const lineSec = (scene.voice?.durationInFrames ?? 0) / 30;
  const onWord = (w: string) => voiceAt + Math.round(wordAt(scene, w, lineSec) * 30) - 4;
  const restAt = onWord("port authorities");
  const count = Math.round(CLIENT_COUNT * interpolate(f, [restAt, restAt + 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  // the named three sit mid-screen while they are introduced, then lift to
  // make room for the title and the logo wall
  const lift = interpolate(f, [restAt - 4, restAt + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const featTop = 360 + (270 - 360) * lift;
  const rest = ORDERED.slice(LEAD.length); // grouped by sector, so similar organisations sit together
  const plusAt = voiceAt + Math.round(lineSec * 30) + 8;
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      {/* the certificates' dusk shipyard carries on, very dark, behind the logos */}
      <Clip src="stock/pb-shipyard-cranes-dusk.mp4" startFrom={30} rate={0.8} grade={0.86} zoom={[1.0, 1.04]} to={d} />
      <AbsoluteFill style={{ padding: `84px 0 0 ${SAFE.x}px` }}>
        <Rise at={restAt + 4} dur={20}>
          <Headline size={120} style={{ textShadow: "none", fontVariantNumeric: "tabular-nums" }}>
            {count} clients
          </Headline>
        </Rise>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: SAFE.x, top: featTop, display: "flex", gap: FEAT_GAP }}>
        {LEAD.map((n) => {
          const c = CLIENTS.find((x) => x.name === n)!;
          return (
            <FeatTile key={n} at={onWord(LEAD_WORD[n])}>
              <Logo client={c} big />
            </FeatTile>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: SAFE.x, top: 520, display: "grid", gridTemplateColumns: `repeat(${WALL_COLS}, ${M_W}px)`, gap: M_GAP }}>
        {rest.map((c, i) => (
          <WallTile key={c.name} client={c} at={restAt + 10 + i * 2} />
        ))}
      </div>
      {/* after the narration ends, so it never crowds the last subtitle */}
      <Rise at={plusAt} dur={20} style={{ position: "absolute", left: 0, right: 0, top: 520 + 3 * (M_H + M_GAP) + 10, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: C.soft }}>Plus {and(CLIENTS_TEXT_ONLY)}.</div>
      </Rise>
    </AbsoluteFill>
  );
};

const FeatTile: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const p = useIn(at, 22);
  return (
    <div style={{ width: FEAT_W, height: FEAT_H, background: C.white, display: "grid", placeItems: "center", opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})` }}>
      {children}
    </div>
  );
};

const and = (xs: readonly string[]) => `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

const Logo: React.FC<{ client: (typeof CLIENTS)[number]; big: boolean }> = ({ client, big }) => {
  const src = trimmed(client.logo);
  const name = ICON_ONLY[client.name];
  if (name)
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: big ? 8 : 6 }}>
        <Img src={staticFile(src)} style={{ ...(big ? logoSize(src, 26000, 130, 340) : logoSize(src, 2600, 58, 130)), objectFit: "contain" }} />
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: big ? 30 : 20, color: C.navy, lineHeight: 1 }}>{name}</div>
      </div>
    );
  // featured tiles: logos as large as their 156 px source files allow, so they
  // fill the tile instead of floating small in a sea of white
  return <Img src={staticFile(src)} style={{ ...(big ? logoSize(src, 36000, 156, 400) : logoSize(src)), objectFit: "contain" }} />;
};

// Logos that are only an emblem (the website shows their name beside them) -
// without a name, JSW reads as a red swoosh. Short names from the website.
const ICON_ONLY: Record<string, string> = {
  "JSW Group": "JSW",
  "V.O. Chidambaranar Port Authority": "V.O.C. Port",
  "National Institute of Ocean Technology": "NIOT",
  "Chandra Shipping": "Chandra Shipping",
};

// the three named clients first, then grouped by sector (navy/government/
// ports, energy/industry, shipping) so similar organisations sit together
const ORDERED = [
  ...LEAD.map((n) => CLIENTS.find((c) => c.name === n)!),
  ...CLIENT_SECTORS.flatMap((sec) => CLIENTS.filter((c) => c.sector === sec.id && !LEAD.includes(c.name))),
];

// Scene 10 - dusk sea, then the end card holds to 2:00.
export const End: React.FC<P & { scene: TimedScene }> = ({ d, at, scene }) => {
  // the sunset plays on its own first; the card arrives with "Libraa Group..."
  const cardAt = Math.max(20, (scene.voice?.from ?? at + 40) - at - 8);
  const card = useIn(cardAt, 30);
  const track = useTrack(cardAt, TYPE.tracking + 0.06, TYPE.tracking, 48);
  return (
    // no fade-out: on a booth loop the clean end card holds to the last frame
    <AbsoluteFill style={{ background: "#000" }}>
      {/* the clip is 12s; slow it just enough to cover the whole scene, so it
          never runs out and freezes on its last frame */}
      <Clip src="stock/px-sunset-ships-horizon.mp4" grade={0.2} zoom={[1.0, 1.06]} to={d} rate={Math.min(1, (12 * 30 - 6) / d)} />
      {/* lighter overlay so the moving sea stays visible behind the card; the
          card itself holds perfectly still (the sea keeps the long hold alive) */}
      <AbsoluteFill style={{ background: `rgba(10,14,42,${0.25 + 0.42 * card})` }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 30,
          opacity: card,
          textShadow: "0 2px 24px rgba(6,9,26,0.55)",
        }}
      >
        {/* the same logo tile as the brand reveal, so the film opens and closes on one mark */}
        <div style={{ width: 220, height: 180, background: C.white, display: "grid", placeItems: "center" }}>
          <Img src={staticFile("libraa/logo.webp")} style={{ width: 174 }} />
        </div>
        <div style={{ ...DS, fontSize: px(130), lineHeight: 1, letterSpacing: `${track}em`, color: C.white, paddingLeft: `${track}em` }}>LIBRAA GROUP</div>
        {/* the approved closing tagline, word for word */}
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 46, letterSpacing: "0.02em", color: C.mint }}>Ship Management, Crew Management and Marine Services.</div>
        <div style={{ marginTop: 30, fontFamily: FONT, fontWeight: TYPE.bodyWeight, fontSize: 96, color: C.white, letterSpacing: "0.02em" }}>libraa.com</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 68, color: C.soft, letterSpacing: "0.02em" }}>{COMPANY.email}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
