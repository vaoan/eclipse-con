/* eslint-disable max-lines, max-lines-per-function, sonarjs/cognitive-complexity, sonarjs/pseudo-random */
import { useEffect, useRef } from "react";

import { useIsMobileViewport } from "@/shared/application/hooks/useIsMobileViewport";
import { usePrefersReducedMotion } from "@/shared/application/hooks/usePrefersReducedMotion";

interface HeroCanvasSkyProps {
  readonly className?: string;
  readonly fixed?: boolean;
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
    const farStarCount = isMobileViewport ? 760 : 1900;
    const midStarCount = isMobileViewport ? 320 : 780;
    const brightStarCount = isMobileViewport ? 120 : 320;
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
    let moonYOffset = 0;

    const readScrollProgress = () => {
      const heroScrollRange = Math.max(window.innerHeight * 1.2, 1);
      return clamp(window.scrollY / heroScrollRange, 0, 1);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      hasValidSize = width > 16 && height > 16;
      dpr = clamp(window.devicePixelRatio || 1, 1, isMobileViewport ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

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

      for (let index = 0; index < farStarCount; index += 1) {
        farStars.push(buildStar(0.95, 2.55, 0.3, 0.9, 0.08, 0.24, 0.35, 1.2));
      }
      for (let index = 0; index < midStarCount; index += 1) {
        midStars.push(buildStar(0.9, 2.15, 0.6, 1.2, 0.16, 0.42, 0.6, 1.4));
      }
      for (let index = 0; index < brightStarCount; index += 1) {
        brightStars.push(buildStar(0.84, 1.65, 0.9, 1.8, 0.28, 0.54, 0.95, 2));
      }
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
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#01020a");
      gradient.addColorStop(0.18, "#040824");
      gradient.addColorStop(0.44, "#09133a");
      gradient.addColorStop(0.72, "#060c26");
      gradient.addColorStop(1, "#02040d");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
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
      for (const star of stars) {
        const twinkle = prefersReducedMotion
          ? 0.78
          : 0.55 +
            0.45 * Math.sin(timeSeconds * star.twinkleSpeed + star.phase);
        const shimmer = prefersReducedMotion
          ? 0.86
          : 0.45 +
            0.55 *
              Math.pow(
                Math.abs(
                  Math.sin(
                    timeSeconds * (0.8 + star.flicker * 2.4) + star.shimmerPhase
                  )
                ),
                1.5 + star.flicker
              );
        const appearDisappear = prefersReducedMotion
          ? 0.9
          : 0.04 +
            0.96 *
              Math.pow(
                0.5 +
                  0.5 *
                    Math.sin(
                      timeSeconds * (0.3 + star.flicker * 1.05) +
                        star.phase * 1.7
                    ),
                2.8
              );
        const breathe = prefersReducedMotion
          ? 0.9
          : 0.15 +
            0.85 *
              Math.pow(
                0.5 +
                  0.5 *
                    Math.sin(
                      timeSeconds * (0.14 + star.flicker * 0.22) +
                        star.shimmerPhase * 0.9
                    ),
                1.9
              );
        const alpha = clamp(
          star.alpha *
            twinkle *
            shimmer *
            appearDisappear *
            breathe *
            brightnessBoost,
          0.004,
          0.95
        );
        context.fillStyle = starColor(star.tint, alpha);
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
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

    const drawTopHighlights = (timeSeconds: number) => {
      const drift = prefersReducedMotion
        ? 0.5
        : 0.5 + 0.5 * Math.sin(timeSeconds * 0.23);
      const desktopTintScale = isMobileViewport ? 1 : 0.34;

      const zenithGlow = context.createLinearGradient(0, 0, 0, height);
      zenithGlow.addColorStop(
        0,
        `rgba(92, 142, 230, ${((0.23 + drift * 0.08) * desktopTintScale).toFixed(3)})`
      );
      zenithGlow.addColorStop(
        0.25,
        `rgba(70, 113, 218, ${(0.18 * desktopTintScale).toFixed(3)})`
      );
      zenithGlow.addColorStop(
        isMobileViewport ? 0.42 : 0.34,
        `rgba(36, 57, 133, ${(0.05 * desktopTintScale).toFixed(3)})`
      );
      zenithGlow.addColorStop(
        isMobileViewport ? 0.6 : 0.46,
        "rgba(16, 28, 77, 0)"
      );
      zenithGlow.addColorStop(1, "rgba(10, 16, 46, 0)");
      context.fillStyle = zenithGlow;
      context.fillRect(0, 0, width, height);

      const topCap = context.createLinearGradient(0, 0, 0, height);
      topCap.addColorStop(
        0,
        isMobileViewport
          ? "rgba(136, 178, 245, 0.1)"
          : "rgba(136, 178, 245, 0.2)"
      );
      topCap.addColorStop(
        isMobileViewport ? 0.16 : 0.1,
        isMobileViewport
          ? "rgba(112, 154, 224, 0.06)"
          : "rgba(112, 154, 224, 0.12)"
      );
      topCap.addColorStop(
        isMobileViewport ? 0.28 : 0.2,
        "rgba(90, 132, 202, 0.02)"
      );
      topCap.addColorStop(
        isMobileViewport ? 0.42 : 0.28,
        "rgba(90, 132, 202, 0)"
      );
      topCap.addColorStop(1, "rgba(90, 132, 202, 0)");
      context.fillStyle = topCap;
      context.fillRect(0, 0, width, height);

      const leftBloom = context.createRadialGradient(
        width * 0.18,
        height * 0.03,
        0,
        width * 0.18,
        height * 0.03,
        width * 0.45
      );
      leftBloom.addColorStop(
        0,
        `rgba(140, 183, 243, ${(0.18 * desktopTintScale).toFixed(3)})`
      );
      leftBloom.addColorStop(
        0.34,
        `rgba(100, 151, 230, ${(0.11 * desktopTintScale).toFixed(3)})`
      );
      leftBloom.addColorStop(1, "rgba(120, 171, 255, 0)");
      context.fillStyle = leftBloom;
      context.fillRect(0, 0, width, height);

      const rightBloom = context.createRadialGradient(
        width * 0.84,
        height * 0.06,
        0,
        width * 0.84,
        height * 0.06,
        width * 0.42
      );
      rightBloom.addColorStop(
        0,
        `rgba(108, 167, 235, ${(0.16 * desktopTintScale).toFixed(3)})`
      );
      rightBloom.addColorStop(
        0.35,
        `rgba(74, 126, 214, ${(0.1 * desktopTintScale).toFixed(3)})`
      );
      rightBloom.addColorStop(1, "rgba(86, 138, 232, 0)");
      context.fillStyle = rightBloom;
      context.fillRect(0, 0, width, height);

      const curtain = context.createLinearGradient(0, height * 0.04, 0, height);
      curtain.addColorStop(
        0,
        `rgba(165, 197, 245, ${((0.1 + drift * 0.04) * desktopTintScale).toFixed(3)})`
      );
      curtain.addColorStop(
        isMobileViewport ? 0.45 : 0.36,
        `rgba(99, 132, 207, ${(0.06 * desktopTintScale).toFixed(3)})`
      );
      curtain.addColorStop(
        isMobileViewport ? 0.58 : 0.46,
        "rgba(54, 79, 168, 0)"
      );
      curtain.addColorStop(1, "rgba(54, 79, 168, 0)");
      context.fillStyle = curtain;
      context.fillRect(0, 0, width, height);

      const topFade = context.createLinearGradient(0, 0, 0, height);
      topFade.addColorStop(
        0,
        `rgba(175, 202, 242, ${(0.05 * desktopTintScale).toFixed(3)})`
      );
      topFade.addColorStop(
        isMobileViewport ? 0.5 : 0.34,
        `rgba(134, 170, 224, ${(0.02 * desktopTintScale).toFixed(3)})`
      );
      topFade.addColorStop(
        isMobileViewport ? 0.62 : 0.38,
        "rgba(110, 148, 206, 0)"
      );
      topFade.addColorStop(1, "rgba(216, 232, 255, 0)");
      context.fillStyle = topFade;
      context.fillRect(0, 0, width, height);

      const planetLight = context.createRadialGradient(
        width * 0.52,
        height * (isMobileViewport ? 1.16 : 1.24),
        width * 0.03,
        width * 0.52,
        height * (isMobileViewport ? 1.16 : 1.24),
        width * (isMobileViewport ? 1.06 : 0.84)
      );
      planetLight.addColorStop(
        0,
        `rgba(106, 165, 236, ${(0.12 * desktopTintScale).toFixed(3)})`
      );
      planetLight.addColorStop(
        0.24,
        `rgba(81, 136, 221, ${(0.09 * desktopTintScale).toFixed(3)})`
      );
      planetLight.addColorStop(
        0.56,
        `rgba(56, 103, 194, ${(0.05 * desktopTintScale).toFixed(3)})`
      );
      planetLight.addColorStop(1, "rgba(54, 104, 196, 0)");
      context.fillStyle = planetLight;
      context.fillRect(0, 0, width, height);

      const upperMist = context.createLinearGradient(0, 0, 0, height);
      upperMist.addColorStop(
        0,
        `rgba(96, 146, 226, ${(0.06 * desktopTintScale).toFixed(3)})`
      );
      upperMist.addColorStop(
        isMobileViewport ? 0.34 : 0.3,
        `rgba(70, 111, 193, ${(0.04 * desktopTintScale).toFixed(3)})`
      );
      upperMist.addColorStop(
        isMobileViewport ? 0.52 : 0.42,
        "rgba(94, 143, 228, 0)"
      );
      upperMist.addColorStop(1, "rgba(94, 143, 228, 0)");
      context.fillStyle = upperMist;
      context.fillRect(0, 0, width, height);
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

    const drawMoon = (timeSeconds: number, visibility: number) => {
      if (visibility <= 0.02) {
        return;
      }

      const moonX = width * 0.5;
      const moonY = height * 0.36 + moonYOffset;
      const moonRadius = clamp(Math.min(width, height) * 0.086, 18, 118);
      const pulse = prefersReducedMotion
        ? 0.88
        : 0.78 + 0.22 * Math.sin(timeSeconds * 0.9);
      const breathe = prefersReducedMotion
        ? 1
        : 0.94 +
          0.06 * Math.sin(timeSeconds * 0.52 + 0.8) +
          0.03 * Math.sin(timeSeconds * 1.18 + 2.1);
      const moonAlpha = clamp(visibility, 0, 1);

      const nearAura = context.createRadialGradient(
        moonX,
        moonY,
        moonRadius * 0.55,
        moonX,
        moonY,
        moonRadius * (1.72 * breathe)
      );
      nearAura.addColorStop(
        0,
        `rgba(255, 235, 178, ${(0.34 * pulse * moonAlpha).toFixed(3)})`
      );
      nearAura.addColorStop(
        0.45,
        `rgba(255, 205, 126, ${(0.18 * pulse * moonAlpha).toFixed(3)})`
      );
      nearAura.addColorStop(1, "rgba(255, 194, 112, 0)");
      context.fillStyle = nearAura;
      context.beginPath();
      context.arc(moonX, moonY, moonRadius * (1.76 * breathe), 0, Math.PI * 2);
      context.fill();

      const midAura = context.createRadialGradient(
        moonX,
        moonY,
        moonRadius * 0.95,
        moonX,
        moonY,
        moonRadius * (3.05 * breathe)
      );
      midAura.addColorStop(
        0,
        `rgba(255, 219, 149, ${(0.22 * moonAlpha).toFixed(3)})`
      );
      midAura.addColorStop(
        0.5,
        `rgba(232, 190, 124, ${(0.1 * moonAlpha).toFixed(3)})`
      );
      midAura.addColorStop(1, "rgba(232, 190, 124, 0)");
      context.fillStyle = midAura;
      context.beginPath();
      context.arc(moonX, moonY, moonRadius * (3.12 * breathe), 0, Math.PI * 2);
      context.fill();

      const farAura = context.createRadialGradient(
        moonX,
        moonY,
        moonRadius * 1.6,
        moonX,
        moonY,
        moonRadius * (4.9 * breathe)
      );
      farAura.addColorStop(
        0,
        `rgba(170, 180, 255, ${(0.09 * moonAlpha).toFixed(3)})`
      );
      farAura.addColorStop(
        0.48,
        `rgba(128, 148, 242, ${(0.06 * moonAlpha).toFixed(3)})`
      );
      farAura.addColorStop(1, "rgba(112, 132, 220, 0)");
      context.fillStyle = farAura;
      context.beginPath();
      context.arc(moonX, moonY, moonRadius * (4.92 * breathe), 0, Math.PI * 2);
      context.fill();

      const moonGradient = context.createRadialGradient(
        moonX - moonRadius * 0.22,
        moonY - moonRadius * 0.25,
        moonRadius * 0.3,
        moonX,
        moonY,
        moonRadius
      );
      moonGradient.addColorStop(0, "#e8d1ab");
      moonGradient.addColorStop(1, "#8e7756");
      context.fillStyle = moonGradient;
      context.globalAlpha = moonAlpha * 0.5;
      context.beginPath();
      context.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "rgba(9, 11, 28, 0.86)";
      context.beginPath();
      context.arc(
        moonX + moonRadius * 0.28,
        moonY - moonRadius * 0.02,
        moonRadius * 0.92,
        0,
        Math.PI * 2
      );
      context.fill();
      context.globalAlpha = 1;
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

    const animate = (timestamp: number) => {
      const now = timestamp || performance.now();
      const deltaSeconds = lastTimestamp
        ? clamp((now - lastTimestamp) / 1000, 0, 0.05)
        : 0.016;
      lastTimestamp = now;

      if (!hasValidSize) {
        resize();
      }

      if (!hasValidSize) {
        animationFrameId = window.requestAnimationFrame(animate);
        return;
      }

      const scrollProgress = readScrollProgress();
      const maxMoonDrop = isMobileViewport ? height * 0.2 : height * 0.26;
      const targetMoonYOffset = scrollProgress * maxMoonDrop;
      moonYOffset += (targetMoonYOffset - moonYOffset) * 0.09;
      const moonVisibility = clamp(1 - scrollProgress * 1.2, 0, 1);

      const timeSeconds = now / 1000;

      drawBackground();
      drawTopHighlights(timeSeconds);
      drawStarField(farStars, timeSeconds, 0.74);
      drawStarField(midStars, timeSeconds, 0.96);
      drawStarField(brightStars, timeSeconds, 1.14);
      drawMoon(timeSeconds, moonVisibility);
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
    nextShotAt =
      performance.now() +
      minShootDelayMs +
      Math.random() * (maxShootDelayMs - minShootDelayMs);
    animationFrameId = window.requestAnimationFrame(animate);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
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
          "linear-gradient(to bottom, #050714 0%, #0a1030 50%, #03050f 100%)",
      }}
      aria-hidden="true"
    />
  );
}
