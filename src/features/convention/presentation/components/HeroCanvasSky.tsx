/* eslint-disable max-lines, max-lines-per-function, sonarjs/pseudo-random */
import { useEffect, useRef } from "react";

import { useIsMobileViewport } from "@/shared/application/hooks/useIsMobileViewport";
import { usePrefersReducedMotion } from "@/shared/application/hooks/usePrefersReducedMotion";

interface HeroCanvasSkyProps {
  readonly className?: string;
  readonly fixed?: boolean;
}

/** Describes the properties of a single star in the canvas sky. */
interface Star {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly phase: number;
  readonly twinkleSpeed: number;
  readonly alpha: number;
  readonly tint: "cool" | "ice" | "gold";
  readonly flicker: number;
  readonly shimmerPhase: number;
}

/** Describes the live state of a shooting star trail. */
interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  ttl: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Renders an animated canvas night sky with twinkling stars and shooting stars.
 * Disables animations when the user prefers reduced motion or is on a mobile viewport.
 */
export function HeroCanvasSky({
  className = "",
  fixed = false,
}: Readonly<HeroCanvasSkyProps>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMobileViewport = useIsMobileViewport();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const farStars: Star[] = [];
    const midStars: Star[] = [];
    const brightStars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    const farStarCount = isMobileViewport ? 500 : 1600;
    const midStarCount = isMobileViewport ? 220 : 600;
    const brightStarCount = isMobileViewport ? 90 : 260;
    const quickFarStarCount = isMobileViewport ? 200 : 500;
    const quickMidStarCount = isMobileViewport ? 100 : 240;
    const quickBrightStarCount = isMobileViewport ? 50 : 110;
    const maxShootingStars = isMobileViewport ? 3 : 5;
    const minShootDelayMs = isMobileViewport ? 1200 : 900;
    const maxShootDelayMs = isMobileViewport ? 2800 : 2200;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId = 0;
    let lastTimestamp = 0;
    let nextShotAt = 0;
    let hasValidSize = false;
    let resizeObserver: ResizeObserver | null = null;
    let hasFullStars = false;
    let fullStarTimer = 0;

    const buildStars = (
      farCount: number,
      midCount: number,
      brightCount: number
    ) => {
      const buildStar = (
        yLimit: number,
        yBiasPower: number,
        sizeMin: number,
        sizeRange: number,
        alphaMin: number,
        alphaRange: number,
        twinkleMin: number,
        twinkleRange: number
      ): Star => {
        const tintRoll = Math.random();
        let tint: Star["tint"] = "cool";
        if (tintRoll > 0.94) {
          tint = "gold";
        } else if (tintRoll > 0.7) {
          tint = "ice";
        }
        const yDistribution = Math.pow(Math.random(), yBiasPower);
        return {
          x: Math.random() * width,
          y: yDistribution * height * yLimit,
          size: sizeMin + Math.random() * sizeRange,
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: twinkleMin + Math.random() * twinkleRange,
          alpha: alphaMin + Math.random() * alphaRange,
          tint,
          flicker: 0.18 + Math.random() * 0.82,
          shimmerPhase: Math.random() * Math.PI * 2,
        };
      };

      farStars.length = 0;
      midStars.length = 0;
      brightStars.length = 0;

      for (let index = 0; index < farCount; index += 1) {
        farStars.push(buildStar(0.94, 6.0, 0.3, 0.9, 0.08, 0.24, 0.35, 1.2));
      }
      for (let index = 0; index < midCount; index += 1) {
        midStars.push(buildStar(0.86, 5.4, 0.6, 1.2, 0.16, 0.42, 0.6, 1.4));
      }
      for (let index = 0; index < brightCount; index += 1) {
        brightStars.push(buildStar(0.78, 4.8, 0.9, 1.8, 0.28, 0.54, 0.95, 2));
      }
    };

    const scheduleFullStars = () => {
      if (hasFullStars || fullStarTimer !== 0) {
        return;
      }
      fullStarTimer = window.setTimeout(() => {
        buildStars(farStarCount, midStarCount, brightStarCount);
        hasFullStars = true;
        fullStarTimer = 0;
      }, 0);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const fallbackWidth = Math.max(1, Math.round(window.innerWidth));
      const fallbackHeight = Math.max(1, Math.round(window.innerHeight));
      const nextWidth = Math.max(1, Math.round(bounds.width || fallbackWidth));
      const nextHeight = Math.max(
        1,
        Math.round(bounds.height || fallbackHeight)
      );
      if (
        Math.abs(nextWidth - width) <= 20 &&
        Math.abs(nextHeight - height) <= 20
      ) {
        return;
      }
      width = nextWidth;
      height = nextHeight;
      hasValidSize = width > 16 && height > 16;
      dpr = clamp(window.devicePixelRatio || 1, 1, isMobileViewport ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      staticOverlay = null;
      buildStars(quickFarStarCount, quickMidStarCount, quickBrightStarCount);
      scheduleFullStars();
    };

    const spawnShootingStar = () => {
      if (prefersReducedMotion || shootingStars.length >= maxShootingStars) {
        return;
      }

      const startX = width * (0.05 + Math.random() * 0.55);
      const startY = height * (0.08 + Math.random() * 0.45);
      const speed = isMobileViewport ? 260 : 340;
      const angle = (-25 * Math.PI) / 180;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed * -1;

      shootingStars.push({
        x: startX,
        y: startY,
        vx,
        vy,
        length: 120 + Math.random() * 120,
        life: 0,
        ttl: 0.95 + Math.random() * 0.75,
      });
    };

    const drawBackground = () => {
      context.clearRect(0, 0, width, height);
    };

    const starColor = (tint: Star["tint"], alpha: number) => {
      if (tint === "gold") {
        return `rgba(255, 220, 152, ${alpha.toFixed(3)})`;
      }
      if (tint === "ice") {
        return `rgba(198, 231, 255, ${alpha.toFixed(3)})`;
      }
      return `rgba(170, 201, 248, ${alpha.toFixed(3)})`;
    };

    const drawStarField = (
      stars: readonly Star[],
      timeSeconds: number,
      brightnessBoost: number
    ) => {
      const pi2 = Math.PI * 2;
      for (const star of stars) {
        const twinkle = prefersReducedMotion
          ? 0.78
          : 0.55 +
            0.45 * Math.sin(timeSeconds * star.twinkleSpeed + star.phase);
        const pulse = prefersReducedMotion
          ? 0.88
          : 0.2 +
            0.8 *
              Math.abs(
                Math.sin(
                  timeSeconds * (0.3 + star.flicker * 0.9) + star.shimmerPhase
                )
              );
        const alpha = clamp(
          star.alpha * twinkle * pulse * brightnessBoost,
          0.004,
          0.95
        );
        context.fillStyle = starColor(star.tint, alpha);
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, pi2);
        context.fill();

        if (star.size > 1.8 && alpha > 0.45) {
          const spikeAlpha = alpha * 0.35;
          context.strokeStyle = `rgba(219, 237, 255, ${spikeAlpha.toFixed(3)})`;
          context.lineWidth = 0.8;
          context.beginPath();
          context.moveTo(star.x - star.size * 1.6, star.y);
          context.lineTo(star.x + star.size * 1.6, star.y);
          context.moveTo(star.x, star.y - star.size * 1.6);
          context.lineTo(star.x, star.y + star.size * 1.6);
          context.stroke();
        }
      }
    };

    /* ---------- cached static gradient overlay ---------- */
    let staticOverlay: HTMLCanvasElement | null = null;
    let staticOverlayW = 0;
    let staticOverlayH = 0;

    const buildStaticOverlay = () => {
      const oc = document.createElement("canvas");
      oc.width = Math.round(width * dpr);
      oc.height = Math.round(height * dpr);
      const oc2d = oc.getContext("2d");
      if (!oc2d) {
        return null;
      }
      oc2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = isMobileViewport ? 1 : 0.34;

      const topCap = oc2d.createLinearGradient(0, 0, 0, height);
      topCap.addColorStop(
        0,
        isMobileViewport ? "rgba(136,178,245,0.1)" : "rgba(136,178,245,0.2)"
      );
      topCap.addColorStop(
        isMobileViewport ? 0.16 : 0.1,
        isMobileViewport ? "rgba(112,154,224,0.06)" : "rgba(112,154,224,0.12)"
      );
      topCap.addColorStop(
        isMobileViewport ? 0.28 : 0.2,
        "rgba(90,132,202,0.02)"
      );
      topCap.addColorStop(isMobileViewport ? 0.42 : 0.28, "rgba(90,132,202,0)");
      topCap.addColorStop(1, "rgba(90,132,202,0)");
      oc2d.fillStyle = topCap;
      oc2d.fillRect(0, 0, width, height);

      const leftBloom = oc2d.createRadialGradient(
        width * 0.18,
        height * 0.03,
        0,
        width * 0.18,
        height * 0.03,
        width * 0.45
      );
      leftBloom.addColorStop(0, `rgba(140,183,243,${(0.18 * s).toFixed(3)})`);
      leftBloom.addColorStop(
        0.34,
        `rgba(100,151,230,${(0.11 * s).toFixed(3)})`
      );
      leftBloom.addColorStop(1, "rgba(120,171,255,0)");
      oc2d.fillStyle = leftBloom;
      oc2d.fillRect(0, 0, width, height);

      const rightBloom = oc2d.createRadialGradient(
        width * 0.84,
        height * 0.06,
        0,
        width * 0.84,
        height * 0.06,
        width * 0.42
      );
      rightBloom.addColorStop(0, `rgba(108,167,235,${(0.16 * s).toFixed(3)})`);
      rightBloom.addColorStop(0.35, `rgba(74,126,214,${(0.1 * s).toFixed(3)})`);
      rightBloom.addColorStop(1, "rgba(86,138,232,0)");
      oc2d.fillStyle = rightBloom;
      oc2d.fillRect(0, 0, width, height);

      const topFade = oc2d.createLinearGradient(0, 0, 0, height);
      topFade.addColorStop(0, `rgba(175,202,242,${(0.05 * s).toFixed(3)})`);
      topFade.addColorStop(
        isMobileViewport ? 0.5 : 0.34,
        `rgba(134,170,224,${(0.02 * s).toFixed(3)})`
      );
      topFade.addColorStop(
        isMobileViewport ? 0.62 : 0.38,
        "rgba(110,148,206,0)"
      );
      topFade.addColorStop(1, "rgba(216,232,255,0)");
      oc2d.fillStyle = topFade;
      oc2d.fillRect(0, 0, width, height);

      const planetLight = oc2d.createRadialGradient(
        width * 0.52,
        height * (isMobileViewport ? 1.16 : 1.24),
        width * 0.03,
        width * 0.52,
        height * (isMobileViewport ? 1.16 : 1.24),
        width * (isMobileViewport ? 1.06 : 0.84)
      );
      planetLight.addColorStop(0, `rgba(106,165,236,${(0.12 * s).toFixed(3)})`);
      planetLight.addColorStop(
        0.24,
        `rgba(81,136,221,${(0.09 * s).toFixed(3)})`
      );
      planetLight.addColorStop(
        0.56,
        `rgba(56,103,194,${(0.05 * s).toFixed(3)})`
      );
      planetLight.addColorStop(1, "rgba(54,104,196,0)");
      oc2d.fillStyle = planetLight;
      oc2d.fillRect(0, 0, width, height);

      const upperMist = oc2d.createLinearGradient(0, 0, 0, height);
      upperMist.addColorStop(0, `rgba(96,146,226,${(0.06 * s).toFixed(3)})`);
      upperMist.addColorStop(
        isMobileViewport ? 0.34 : 0.3,
        `rgba(70,111,193,${(0.04 * s).toFixed(3)})`
      );
      upperMist.addColorStop(
        isMobileViewport ? 0.52 : 0.42,
        "rgba(94,143,228,0)"
      );
      upperMist.addColorStop(1, "rgba(94,143,228,0)");
      oc2d.fillStyle = upperMist;
      oc2d.fillRect(0, 0, width, height);

      staticOverlayW = width;
      staticOverlayH = height;
      return oc;
    };

    const drawTopHighlights = (timeSeconds: number) => {
      const drift = prefersReducedMotion
        ? 0.5
        : 0.5 + 0.5 * Math.sin(timeSeconds * 0.23);
      const s = isMobileViewport ? 1 : 0.34;

      /* Dynamic zenith glow (depends on drift) */
      const zenithGlow = context.createLinearGradient(0, 0, 0, height);
      zenithGlow.addColorStop(
        0,
        `rgba(92,142,230,${((0.26 + drift * 0.1) * s).toFixed(3)})`
      );
      zenithGlow.addColorStop(
        0.25,
        `rgba(70,113,218,${(0.21 * s).toFixed(3)})`
      );
      zenithGlow.addColorStop(
        isMobileViewport ? 0.46 : 0.38,
        `rgba(36,57,133,${(0.07 * s).toFixed(3)})`
      );
      zenithGlow.addColorStop(
        isMobileViewport ? 0.6 : 0.46,
        "rgba(16,28,77,0)"
      );
      zenithGlow.addColorStop(1, "rgba(10,16,46,0)");
      context.fillStyle = zenithGlow;
      context.fillRect(0, 0, width, height);

      /* Dynamic curtain (depends on drift) */
      const curtain = context.createLinearGradient(0, height * 0.04, 0, height);
      curtain.addColorStop(
        0,
        `rgba(165,197,245,${((0.1 + drift * 0.04) * s).toFixed(3)})`
      );
      curtain.addColorStop(
        isMobileViewport ? 0.45 : 0.36,
        `rgba(99,132,207,${(0.06 * s).toFixed(3)})`
      );
      curtain.addColorStop(isMobileViewport ? 0.58 : 0.46, "rgba(54,79,168,0)");
      curtain.addColorStop(1, "rgba(54,79,168,0)");
      context.fillStyle = curtain;
      context.fillRect(0, 0, width, height);

      /* Static overlays — drawn once, blitted each frame */
      if (
        !staticOverlay ||
        staticOverlayW !== width ||
        staticOverlayH !== height
      ) {
        staticOverlay = buildStaticOverlay();
      }
      if (staticOverlay) {
        context.drawImage(staticOverlay, 0, 0, width, height);
      }
    };

    const drawCinematicVignette = () => {
      const edgeVignette = context.createRadialGradient(
        width * 0.5,
        height * 0.34,
        width * 0.25,
        width * 0.5,
        height * 0.5,
        width * 0.95
      );
      edgeVignette.addColorStop(0, "rgba(2, 4, 16, 0)");
      edgeVignette.addColorStop(0.8, "rgba(2, 4, 16, 0.12)");
      edgeVignette.addColorStop(1, "rgba(1, 2, 8, 0.2)");
      context.fillStyle = edgeVignette;
      context.fillRect(0, 0, width, height);

      const bottomRollOff = context.createLinearGradient(
        0,
        height * 0.62,
        0,
        height
      );
      bottomRollOff.addColorStop(0, "rgba(8, 14, 40, 0)");
      bottomRollOff.addColorStop(0.55, "rgba(5, 8, 24, 0.1)");
      bottomRollOff.addColorStop(1, "rgba(2, 3, 12, 0.18)");
      context.fillStyle = bottomRollOff;
      context.fillRect(0, height * 0.62, width, height * 0.38);
    };

    const drawShootingStars = (deltaSeconds: number) => {
      for (let index = shootingStars.length - 1; index >= 0; index -= 1) {
        const star = shootingStars[index];
        if (!star) {
          continue;
        }
        star.life += deltaSeconds;
        if (star.life >= star.ttl) {
          shootingStars.splice(index, 1);
          continue;
        }

        star.x += star.vx * deltaSeconds;
        star.y += star.vy * deltaSeconds;

        const progress = star.life / star.ttl;
        const opacity = (1 - progress) * 0.8;
        const tailX =
          star.x - (star.vx / Math.hypot(star.vx, star.vy)) * star.length;
        const tailY =
          star.y - (star.vy / Math.hypot(star.vx, star.vy)) * star.length;

        const trail = context.createLinearGradient(
          star.x,
          star.y,
          tailX,
          tailY
        );
        trail.addColorStop(
          0,
          `rgba(238, 248, 255, ${(opacity * 0.9).toFixed(3)})`
        );
        trail.addColorStop(
          0.4,
          `rgba(196, 226, 255, ${(opacity * 0.5).toFixed(3)})`
        );
        trail.addColorStop(1, "rgba(196, 226, 255, 0)");

        context.strokeStyle = trail;
        context.lineWidth = 1.8;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(star.x, star.y);
        context.lineTo(tailX, tailY);
        context.stroke();
      }
    };

    let isVisible = true;

    const animate = (timestamp: number) => {
      const now = timestamp || performance.now();
      const deltaSeconds = lastTimestamp
        ? clamp((now - lastTimestamp) / 1000, 0, 0.05)
        : 0.016;
      lastTimestamp = now;

      if (!isVisible) {
        animationFrameId = window.requestAnimationFrame(animate);
        return;
      }

      if (!hasValidSize) {
        resize();
      }

      if (!hasValidSize) {
        animationFrameId = window.requestAnimationFrame(animate);
        return;
      }

      const timeSeconds = now / 1000;

      drawBackground();
      drawTopHighlights(timeSeconds);
      drawStarField(farStars, timeSeconds, 0.74);
      drawStarField(midStars, timeSeconds, 0.96);
      drawStarField(brightStars, timeSeconds, 1.14);
      drawCinematicVignette();

      if (!prefersReducedMotion) {
        if (now >= nextShotAt) {
          spawnShootingStar();
          nextShotAt =
            now +
            minShootDelayMs +
            Math.random() * (maxShootDelayMs - minShootDelayMs);
        }
        drawShootingStars(deltaSeconds);
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    resize();
    if (width > 16 && height > 16) {
      const immediateTime = performance.now() / 1000;
      drawBackground();
      drawTopHighlights(immediateTime);
      drawStarField(farStars, immediateTime, 0.74);
      drawStarField(midStars, immediateTime, 0.96);
      drawStarField(brightStars, immediateTime, 1.14);
      drawCinematicVignette();
    }
    nextShotAt =
      performance.now() +
      minShootDelayMs +
      Math.random() * (maxShootDelayMs - minShootDelayMs);
    animate(performance.now());

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    /* Pause the canvas draw loop once the user scrolls past 1.5 viewports
       (the hero + post-hero area). Resume when they scroll back up. */
    const onScroll = () => {
      isVisible = window.scrollY < window.innerHeight * 1.5;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(fullStarTimer);
    };
  }, [isMobileViewport, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`.trim()}
      style={{
        position: fixed ? "fixed" : "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        background:
          "linear-gradient(to bottom, #01020a 0%, #040824 18%, #09133a 44%, #060c26 72%, #02040d 100%)",
        willChange: "transform",
        contain: "strict",
      }}
      aria-hidden="true"
    />
  );
}
