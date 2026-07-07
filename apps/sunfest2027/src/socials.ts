/** A Furry Colombia community account, rendered as an icon link. */
export interface Social {
  readonly label: string;
  readonly href: string;
  readonly slug: string;
}

/**
 * Furry Colombia's public accounts. Telegram is intentionally omitted — it is
 * the primary "join the pack" call-to-action, not part of this secondary row.
 */
export const SOCIALS: readonly Social[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/furrycolombia/",
    slug: "instagram",
  },
  { label: "X", href: "https://twitter.com/FurryColombia", slug: "x" },
  {
    label: "Bluesky",
    href: "https://bsky.app/profile/furrycolombia.bsky.social",
    slug: "bluesky",
  },
  { label: "Discord", href: "https://discord.gg/ymPPhvd62D", slug: "discord" },
  {
    label: "Facebook",
    href: "https://www.facebook.com/furry.colombia",
    slug: "facebook",
  },
  {
    label: "FurAffinity",
    href: "https://www.furaffinity.net/user/furrycolombia/",
    slug: "furaffinity",
  },
];

/** simpleicons.org hex color (cream) for the social row on the dark ground. */
export const SOCIAL_ICON_COLOR = "fbeecb";
