import ar from "@/assets/flags/ar.png";
import co from "@/assets/flags/co.png";
import cr from "@/assets/flags/cr.png";
import doFlag from "@/assets/flags/do.png";
import mx from "@/assets/flags/mx.png";
import pa from "@/assets/flags/pa.png";
import pr from "@/assets/flags/pr.png";
import sv from "@/assets/flags/sv.png";
import us from "@/assets/flags/us.png";
import ve from "@/assets/flags/ve.png";

/** Pixel width shared by every flag PNG; heights vary with each flag's proportions. */
export const FLAG_WIDTH = 320;

/**
 * A country that took part in the previous event: flag image, its pixel
 * height (so the browser reserves the right box before it loads) and its
 * i18n name key.
 */
export interface Country {
  readonly code: string;
  readonly src: string;
  readonly height: number;
  readonly nameKey: string;
}

/** Countries whose furries joined Moonfest 2026 (Colombia hosts, then the rest). */
export const RECAP_COUNTRIES: readonly Country[] = [
  { code: "co", src: co, height: 213, nameKey: "recap.countries.co" },
  { code: "ar", src: ar, height: 200, nameKey: "recap.countries.ar" },
  { code: "cr", src: cr, height: 192, nameKey: "recap.countries.cr" },
  { code: "do", src: doFlag, height: 213, nameKey: "recap.countries.do" },
  { code: "sv", src: sv, height: 181, nameKey: "recap.countries.sv" },
  { code: "mx", src: mx, height: 183, nameKey: "recap.countries.mx" },
  { code: "pa", src: pa, height: 213, nameKey: "recap.countries.pa" },
  { code: "pr", src: pr, height: 213, nameKey: "recap.countries.pr" },
  { code: "ve", src: ve, height: 213, nameKey: "recap.countries.ve" },
  { code: "us", src: us, height: 168, nameKey: "recap.countries.us" },
];
