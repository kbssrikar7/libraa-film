// A dot-matrix globe drawn on a canvas: land as dots (Natural Earth texture,
// src/motion/land-dots.json), an orthographic projection, and a great-circle
// route lifted off the surface. Used by the 2-minute film's map scene to turn
// the flat India map into the world and carry the eye to West Africa.
import LAND_DOTS from "./motion/land-dots.json";

const LAND = LAND_DOTS as [number, number][]; // [lat, lon]
const RAD = Math.PI / 180;

export type View = { lon: number; lat: number; R: number; cx: number; cy: number };
export type LonLat = [number, number];

export const CHENNAI: LonLat = [80.2707, 13.0827];
export const LIBREVILLE: LonLat = [9.4673, 0.4162];
// Cameroon is shown at country level (the website names no city there)
export const CAMEROON: LonLat = [12.6, 5.6];

/** Orthographic projection. `h` lifts a point off the surface (for routes);
 *  `face` is 1 at the centre of the disc and 0 at the rim. */
export function project(lon: number, lat: number, v: View, h = 0) {
  const d = (lon - v.lon) * RAD;
  const φ = lat * RAD;
  const φ0 = v.lat * RAD;
  const k = v.R * (1 + h);
  const face = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(d);
  return {
    x: v.cx + k * Math.cos(φ) * Math.sin(d),
    y: v.cy - k * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(d)),
    vis: face > 0.02,
    face,
  };
}

/** Points along the great circle between two places, t from 0 to 1. */
export function greatCircle(a: LonLat, b: LonLat, n: number) {
  const vec = (p: LonLat) => [Math.cos(p[1] * RAD) * Math.cos(p[0] * RAD), Math.cos(p[1] * RAD) * Math.sin(p[0] * RAD), Math.sin(p[1] * RAD)];
  const A = vec(a);
  const B = vec(b);
  const om = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const w1 = Math.sin((1 - t) * om) / Math.sin(om);
    const w2 = Math.sin(t * om) / Math.sin(om);
    const x = w1 * A[0] + w2 * B[0];
    const y = w1 * A[1] + w2 * B[1];
    const z = w1 * A[2] + w2 * B[2];
    return { t, lon: Math.atan2(y, x) / RAD, lat: Math.asin(z) / RAD };
  });
}

// the eight Indian ports of the website's map, so they carry over onto the globe
export const PORT_LONLAT: Record<string, LonLat> = {
  Tuticorin: [78.1348, 8.7642],
  Kochi: [76.2673, 9.9312],
  Chennai: CHENNAI,
  Kakinada: [82.2475, 16.9891],
  Visakhapatnam: [83.2185, 17.6868],
  Paradeep: [86.6108, 20.3163],
  Karwar: [74.124, 14.8022],
  "Port Blair": [92.7265, 11.6234],
};

export type GlobeStyle = { land: [number, number, number]; landAlpha: number; rim: string; route: string };

/** Draws the globe at 1920x1080 into `g` (already scaled for the canvas size).
 *  `route` is 0..1 of the way along `path`. */
export function drawGlobe(
  g: CanvasRenderingContext2D,
  v: View,
  s: GlobeStyle,
  path: ReturnType<typeof greatCircle>,
  route: number,
  dots: { at: LonLat; r: number; color: string }[] = [],
) {
  g.clearRect(0, 0, 1920, 1080);
  g.beginPath();
  g.arc(v.cx, v.cy, v.R, 0, Math.PI * 2);
  g.lineWidth = 2.5;
  g.strokeStyle = s.rim;
  g.stroke();
  // As the sphere turns away, dot rows close up sideways and run into
  // stripes, so dots shrink and fade towards the rim; ten bands, one fill each.
  const r = Math.min(6, Math.max(1.6, v.R * 0.0042));
  const bands = Array.from({ length: 10 }, () => new Path2D());
  for (const [la, lo] of LAND) {
    const p = project(lo, la, v);
    if (!p.vis || p.x < -20 || p.x > 1940 || p.y < -20 || p.y > 1100) continue;
    const band = Math.min(9, Math.floor(p.face * 10));
    const rr = r * Math.min(1, (band + 0.5) * 0.13);
    bands[band].moveTo(p.x + rr, p.y);
    bands[band].arc(p.x, p.y, rr, 0, Math.PI * 2);
  }
  const [cr, cg, cb] = s.land;
  bands.forEach((b, i) => {
    g.fillStyle = `rgba(${cr},${cg},${cb},${(s.landAlpha * Math.min(1, 0.35 + i * 0.1)).toFixed(3)})`;
    g.fill(b);
  });
  for (const d of dots) {
    const p = project(d.at[0], d.at[1], v);
    if (!p.vis) continue;
    g.beginPath();
    g.arc(p.x, p.y, d.r, 0, Math.PI * 2);
    g.fillStyle = d.color;
    g.fill();
  }
  const upto = Math.floor(route * path.length);
  if (upto > 1) {
    g.beginPath();
    let pen = false;
    for (let i = 0; i < upto; i++) {
      const q = path[i];
      const p = project(q.lon, q.lat, v, 0.1 * Math.sin(Math.PI * q.t));
      if (!p.vis) {
        pen = false;
        continue;
      }
      if (!pen) g.moveTo(p.x, p.y);
      else g.lineTo(p.x, p.y);
      pen = true;
    }
    g.lineWidth = 4;
    g.lineCap = "round";
    g.strokeStyle = s.route;
    g.stroke();
  }
}
