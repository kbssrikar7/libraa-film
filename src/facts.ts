// Every fact in the film comes from the website's own verified data file -
// the same source libraa-website renders from - so the film and the site
// can never disagree. When the fleet grows or a client is added, update
// libraa-website/src/data.ts and re-run `npm run voice` + `npm run render`.
import {
  CERTIFICATIONS,
  CLIENT_SECTORS,
  CLIENTS,
  CLIENTS_TEXT_ONLY,
  COMPANY,
  GROUP_COMPANIES,
  OFFICES,
  PORTS,
  SHIPS,
} from "../../libraa-website/src/data";
import { INDIA_MAP_VIEWBOX, INDIA_PATH } from "../../libraa-website/src/lib/indiaMap";
import { numberWord } from "../../libraa-website/src/lib/words";

export {
  CERTIFICATIONS,
  CLIENT_SECTORS,
  CLIENTS,
  CLIENTS_TEXT_ONLY,
  COMPANY,
  GROUP_COMPANIES,
  INDIA_MAP_VIEWBOX,
  INDIA_PATH,
  OFFICES,
  PORTS,
  SHIPS,
  numberWord,
};

/** Website photo paths are "/photos/..."; the film serves them from public/site. */
export const sitePhoto = (p: string) => p.replace(/^\/photos\//, "site/");

export const FLEET_COUNT = SHIPS.length;
export const FLAGS = [...new Set(SHIPS.map((s) => s.flagName))];
export const LOCATION_COUNT = PORTS.length;
export const OFFICE_COUNT = OFFICES.length;
export const CLIENT_COUNT = CLIENTS.length + CLIENTS_TEXT_ONLY.length;
export const COMPANY_COUNT = GROUP_COMPANIES.length;
export const CERT_COUNT = CERTIFICATIONS.length;

export const ship = (id: string) => {
  const s = SHIPS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown ship id "${id}" - check libraa-website/src/data.ts`);
  return s;
};

/** "Indian and Gabonese" from the fleet's flag registries. */
const DEMONYM: Record<string, string> = { India: "Indian", Gabon: "Gabonese" };
export const FLAGS_ADJ = FLAGS.map((f) => DEMONYM[f] ?? f);
