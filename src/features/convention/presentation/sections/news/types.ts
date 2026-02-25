export interface TelegramMediaItem {
  type: string;
  path: string;
  name?: string;
  mime?: string;
  size?: number;
}

export interface TelegramMessage {
  id: number;
  date: string;
  text?: string;
  media?: TelegramMediaItem[];
}

export interface TelegramArchive {
  source: string;
  fetchedAt: string;
  translatedBy?: string;
  messages: TelegramMessage[];
}

export type NewsLayoutMode =
  | "focus"
  | "drawer"
  | "accordion"
  | "zoom"
  | "spotlight"
  | "carouselThumbs"
  | "masonry"
  | "timeline"
  | "magazine"
  | "mosaic"
  | "index"
  | "billboard"
  | "poster"
  | "gallery"
  | "split"
  | "rail"
  | "zigzag"
  | "diagonal"
  | "wall"
  | "table"
  | "banner"
  | "email"
  | "slanted"
  | "polaroid"
  | "polaroidReadmore"
  | "readmore";

export const DEFAULT_NEWS_LAYOUT: NewsLayoutMode = "magazine";

export const NEWS_LAYOUT_MODES: { id: NewsLayoutMode; labelKey: string }[] = [
  { id: "focus", labelKey: "convention.news.modes.focus" },
  { id: "drawer", labelKey: "convention.news.modes.drawer" },
  { id: "accordion", labelKey: "convention.news.modes.accordion" },
  { id: "zoom", labelKey: "convention.news.modes.zoom" },
  { id: "spotlight", labelKey: "convention.news.modes.spotlight" },
  { id: "carouselThumbs", labelKey: "convention.news.modes.carouselThumbs" },
  { id: "masonry", labelKey: "convention.news.modes.masonry" },
  { id: "timeline", labelKey: "convention.news.modes.timeline" },
  { id: "magazine", labelKey: "convention.news.modes.magazine" },
  { id: "mosaic", labelKey: "convention.news.modes.mosaic" },
  { id: "index", labelKey: "convention.news.modes.index" },
  { id: "billboard", labelKey: "convention.news.modes.billboard" },
  { id: "poster", labelKey: "convention.news.modes.poster" },
  { id: "gallery", labelKey: "convention.news.modes.gallery" },
  { id: "split", labelKey: "convention.news.modes.split" },
  { id: "rail", labelKey: "convention.news.modes.rail" },
  { id: "zigzag", labelKey: "convention.news.modes.zigzag" },
  { id: "diagonal", labelKey: "convention.news.modes.diagonal" },
  { id: "wall", labelKey: "convention.news.modes.wall" },
  { id: "table", labelKey: "convention.news.modes.table" },
  { id: "banner", labelKey: "convention.news.modes.banner" },
  { id: "email", labelKey: "convention.news.modes.email" },
  { id: "slanted", labelKey: "convention.news.modes.slanted" },
  { id: "polaroid", labelKey: "convention.news.modes.polaroid" },
  {
    id: "polaroidReadmore",
    labelKey: "convention.news.modes.polaroidReadmore",
  },
  { id: "readmore", labelKey: "convention.news.modes.readmore" },
];
