import { CloudSilhouette } from "./CloudSilhouette";
import { CraneSilhouette } from "./CraneSilhouette";
import { MountainSilhouette } from "./MountainSilhouette";
import { SectionParallaxLayer } from "./SectionParallaxLayer";
import { SteamWisp } from "./SteamWisp";

/** Renders layered parallax decorative elements (mountains, clouds, cranes, steam wisps) for the Venue section background. */
export function VenueDecorations() {
  return (
    <>
      <SectionParallaxLayer
        speed={0.04}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute bottom-0 left-0 right-0 opacity-[0.04]">
          <MountainSilhouette variant="far" className="text-accent" />
        </div>
        <div className="drift-cloud absolute top-[15%] left-[20%] w-28 opacity-[0.04] md:w-40">
          <CloudSilhouette className="text-foreground" />
        </div>
      </SectionParallaxLayer>

      <SectionParallaxLayer
        speed={0.08}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute bottom-0 left-0 right-0 opacity-[0.06]">
          <MountainSilhouette variant="mid" className="text-primary" />
        </div>
        <div className="steam-rise absolute bottom-[20%] right-[15%] w-6 opacity-[0.1] md:w-8">
          <SteamWisp className="text-foreground" />
        </div>
        <div
          className="steam-rise absolute bottom-[25%] right-[22%] w-4 opacity-[0.06]"
          style={{ animationDelay: "2s" }}
        >
          <SteamWisp className="text-foreground" />
        </div>
      </SectionParallaxLayer>

      <SectionParallaxLayer
        speed={0.14}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute bottom-0 left-0 right-0 opacity-[0.08]">
          <MountainSilhouette
            variant="near"
            className="text-muted-foreground"
          />
        </div>
        <div className="drift-cloud absolute top-[20%] right-[10%] w-12 opacity-[0.06] md:w-16">
          <CraneSilhouette className="text-accent" />
        </div>
        <div
          className="drift-cloud absolute top-[28%] right-[25%] w-8 opacity-[0.04] md:w-10"
          style={{ animationDelay: "4s" }}
        >
          <CraneSilhouette className="text-accent" />
        </div>
      </SectionParallaxLayer>

      <SectionParallaxLayer
        speed={-0.06}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute top-1/2 left-1/4 h-32 w-64 rounded-full bg-accent/[0.03] blur-3xl" />
        <div className="water-shimmer absolute bottom-[5%] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        <div
          className="water-shimmer absolute bottom-[8%] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="drift-cloud absolute top-[25%] left-[50%] w-20 opacity-[0.03] md:w-32"
          style={{ animationDelay: "8s" }}
        >
          <CloudSilhouette className="text-foreground" />
        </div>
      </SectionParallaxLayer>

      <SectionParallaxLayer
        speed={0.1}
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="steam-rise absolute bottom-[15%] left-[12%] w-5 opacity-[0.07] md:w-7"
          style={{ animationDelay: "3s" }}
        >
          <SteamWisp className="text-foreground" />
        </div>
        <div
          className="steam-rise absolute bottom-[22%] left-[18%] w-3 opacity-[0.05]"
          style={{ animationDelay: "5s" }}
        >
          <SteamWisp className="text-foreground" />
        </div>
      </SectionParallaxLayer>
    </>
  );
}
