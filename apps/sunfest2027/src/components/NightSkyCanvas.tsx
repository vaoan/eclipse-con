/* eslint-disable max-lines-per-function, sonarjs/pseudo-random */
import { useEffect, useRef } from "react";

import { useMediaQuery } from "@/lib/useMediaQuery";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/** Viewport width at or below which the star counts drop, to stay cheap on phones. */
const MOBILE_BREAKPOINT_QUERY = "(max-width: 768px)";

interface NightSkyCanvasProps {
  readonly className?: string;
}

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

function getStarColor(tint: Star["tint"], alpha: number) {
  if (tint === "gold") {
    return `rgba(255, 220, 152, ${alpha.toFixed(3)})`;
  }
  if (tint === "ice") {
    return `rgba(198, 231, 255, ${alpha.toFixed(3)})`;
  }
  return `rgba(170, 201, 248, ${alpha.toFixed(3)})`;
}

/**
 * Renders an animated stars-only canvas: three parallax star layers that
 * twinkle, plus occasional shooting stars. Ported from the Moonfest site so
 * the recap section carries that sky verbatim. The gradient behind it lives in
 * CSS, not here.
 *
 * @param className - Extra class applied to the canvas element.
 */
export function NightSkyCanvas({
  className = "",
}: Readonly<NightSkyCanvasProps>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMobileViewport = useMediaQuery(MOBILE_BREAKPOINT_QUERY);
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
    // Moonfest's counts were sized for a sky that filled its whole page. Here
    // the sky is one section, and every star is an arc+fill each frame, so the
    // phone tier is thinned hard — it is the difference between a phone
    // rendering this comfortably and pegging its main thread.
    const farStarCount = isMobileViewport ? 170 : 1600;
    const midStarCount = isMobileViewport ? 80 : 600;
    const brightStarCount = isMobileViewport ? 40 : 260;
    const quickFarStarCount = isMobileViewport ? 90 : 500;
    const quickMidStarCount = isMobileViewport ? 45 : 240;
    const quickBrightStarCount = isMobileViewport ? 22 : 110;
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
    let lastDrawAt = 0;
    const minFrameGapMs = isMobileViewport ? 1000 / 30 : 0;
    let resizeObserver: ResizeObserver | null = null;
    let hasFullStars = false;
    let fullStarTimer = 0;

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

      return {
        x: Math.random() * width,
        y: Math.pow(Math.random(), yBiasPower) * height * yLimit,
        size: sizeMin + Math.random() * sizeRange,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: twinkleMin + Math.random() * twinkleRange,
        alpha: alphaMin + Math.random() * alphaRange,
        tint,
        flicker: 0.18 + Math.random() * 0.82,
        shimmerPhase: Math.random() * Math.PI * 2,
      };
    };

    const buildStars = (
      farCount: number,
      midCount: number,
      brightCount: number
    ) => {
      farStars.length = 0;
      midStars.length = 0;
      brightStars.length = 0;

      for (let index = 0; index < farCount; index += 1) {
        farStars.push(buildStar(0.94, 6, 0.3, 0.9, 0.08, 0.24, 0.35, 1.2));
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
      buildStars(quickFarStarCount, quickMidStarCount, quickBrightStarCount);
      scheduleFullStars();
    };

    const spawnShootingStar = () => {
      if (prefersReducedMotion || shootingStars.length >= maxShootingStars) {
        return;
      }

      const startX = isMobileViewport
        ? width * (0.34 + Math.random() * 0.5)
        : width * (0.26 + Math.random() * 0.58);
      const startY = isMobileViewport
        ? height * (0.14 + Math.random() * 0.16)
        : height * (0.08 + Math.random() * 0.24);
      const speed = isMobileViewport ? 260 : 340;
      const angle = (-25 * Math.PI) / 180;

      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * -1,
        length: 120 + Math.random() * 120,
        life: 0,
        ttl: 0.95 + Math.random() * 0.75,
      });
    };

    const drawStarField = (
      stars: readonly Star[],
      timeSeconds: number,
      brightnessBoost: number
    ) => {
      const fullCircle = Math.PI * 2;

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

        context.fillStyle = getStarColor(star.tint, alpha);
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, fullCircle);
        context.fill();

        if (star.size > 1.8 && alpha > 0.45) {
          context.strokeStyle = `rgba(219, 237, 255, ${(alpha * 0.35).toFixed(3)})`;
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
        const length = Math.hypot(star.vx, star.vy);
        const tailX = star.x - (star.vx / length) * star.length;
        const tailY = star.y - (star.vy / length) * star.length;
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

    const animate = (timestamp: number) => {
      const now = timestamp || performance.now();

      // Most of the per-frame cost is painting the canvas, not the maths, so
      // phones draw at 30fps. Ambient twinkling reads no differently, and the
      // shooting-star physics stay correct because the delta below is measured
      // from the last frame actually drawn.
      if (minFrameGapMs > 0 && lastDrawAt && now - lastDrawAt < minFrameGapMs) {
        if (running) {
          animationFrameId = window.requestAnimationFrame(animate);
        }
        return;
      }
      lastDrawAt = now;

      const deltaSeconds = lastTimestamp
        ? clamp((now - lastTimestamp) / 1000, 0, 0.05)
        : 0.016;
      lastTimestamp = now;

      if (!hasValidSize) {
        resize();
      }

      if (!hasValidSize) {
        if (running) {
          animationFrameId = window.requestAnimationFrame(animate);
        }
        return;
      }

      const timeSeconds = now / 1000;
      context.clearRect(0, 0, width, height);
      drawStarField(farStars, timeSeconds, 0.74);
      drawStarField(midStars, timeSeconds, 0.96);
      drawStarField(brightStars, timeSeconds, 1.14);

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

      if (running) {
        animationFrameId = window.requestAnimationFrame(animate);
      }
    };

    // The sky belongs to one section of a long page, so it must not burn the
    // main thread while that section is scrolled away or the tab is in the
    // background. Moonfest could animate unconditionally — its sky was the
    // whole page — but here the loop only runs while the canvas is on screen.
    let onScreen = true;
    let running = false;

    const start = () => {
      if (running || !onScreen || document.hidden) {
        return;
      }
      running = true;
      lastTimestamp = 0;
      lastDrawAt = 0;
      // Do not fire the backlog of shooting stars that "accrued" while paused.
      nextShotAt =
        performance.now() +
        minShootDelayMs +
        Math.random() * (maxShootDelayMs - minShootDelayMs);
      animationFrameId = window.requestAnimationFrame(animate);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(animationFrameId);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    resize();

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "undefined") {
      start();
    } else {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          onScreen = entries.some((entry) => entry.isIntersecting);
          if (onScreen) {
            start();
          } else {
            stop();
          }
        },
        // A little margin so the sky is already alive as it scrolls into view.
        { rootMargin: "200px" }
      );
      intersectionObserver.observe(canvas);
    }

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearTimeout(fullStarTimer);
    };
  }, [isMobileViewport, prefersReducedMotion]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
