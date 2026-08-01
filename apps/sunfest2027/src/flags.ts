import ar from "@/assets/flags/ar.png";
import co from "@/assets/flags/co.png";
import cr from "@/assets/flags/cr.png";
import doFlag from "@/assets/flags/do.png";
import mx from "@/assets/flags/mx.png";
import sv from "@/assets/flags/sv.png";
import us from "@/assets/flags/us.png";
import ve from "@/assets/flags/ve.png";

/** A country that took part in the previous event: flag image + i18n name key. */
export interface Country {
  readonly code: string;
  readonly src: string;
  readonly nameKey: string;
}

/** Countries whose furries joined Moonfest 2026 (Colombia hosts, then the rest). */
export const RECAP_COUNTRIES: readonly Country[] = [
  { code: "co", src: co, nameKey: "recap.countries.co" },
  { code: "ar", src: ar, nameKey: "recap.countries.ar" },
  { code: "cr", src: cr, nameKey: "recap.countries.cr" },
  { code: "do", src: doFlag, nameKey: "recap.countries.do" },
  { code: "sv", src: sv, nameKey: "recap.countries.sv" },
  { code: "mx", src: mx, nameKey: "recap.countries.mx" },
  { code: "ve", src: ve, nameKey: "recap.countries.ve" },
  { code: "us", src: us, nameKey: "recap.countries.us" },
];
