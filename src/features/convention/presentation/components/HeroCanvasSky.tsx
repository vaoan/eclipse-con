/* eslint-disable max-lines-per-function, sonarjs/pseudo-random */
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

    const stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    const starCount = isMobileViewport ? 170 : 320;
    const maxShootingStars = isMobileViewport ? 2 : 4;
    const minShootDelayMs = isMobileViewport ? 1700 : 1200;
    const maxShootDelayMs = isMobileViewport ? 3600 : 2700;

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

      stars.length = 0;
      for (let index = 0; index < starCount; index += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.82,
          size: 0.35 + Math.random() * 1.35,
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.6 + Math.random() * 1.9,
          alpha: 0.14 + Math.random() * 0.66,
        });
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
      gradient.addColorStop(0, "#090b1f");
      gradient.addColorStop(0.5, "#11173b");
      gradient.addColorStop(1, "#07091b");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    };

    const drawStars = (timeSeconds: number) => {
      for (const star of stars) {
        const twinkle = prefersReducedMotion
          ? 0.78
          : 0.55 +
            0.45 * Math.sin(timeSeconds * star.twinkleSpeed + star.phase);
        const alpha = clamp(star.alpha * twinkle, 0.08, 0.9);
        context.fillStyle = `rgba(210, 234, 255, ${alpha.toFixed(3)})`;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      }
    };

    const drawMoon = (timeSeconds: number, visibility: number) => {
      if (visibility <= 0.02) {
        return;
      }

      const moonX = width * 0.5;
      const moonY = height * 0.36 + moonYOffset;
      const moonRadius = clamp(Math.min(width, height) * 0.09, 18, 120);
      const pulse = prefersReducedMotion
        ? 0.88
        : 0.78 + 0.22 * Math.sin(timeSeconds * 0.9);
      const moonAlpha = clamp(visibility, 0, 1);

      const outerGlow = context.createRadialGradient(
        moonX,
        moonY,
        moonRadius * 0.9,
        moonX,
        moonY,
        moonRadius * 3.4
      );
      outerGlow.addColorStop(
        0,
        `rgba(255, 223, 154, ${(0.24 * pulse * moonAlpha).toFixed(3)})`
      );
      outerGlow.addColorStop(
        0.55,
        `rgba(255, 194, 112, ${(0.1 * pulse * moonAlpha).toFixed(3)})`
      );
      outerGlow.addColorStop(1, "rgba(255, 194, 112, 0)");
      context.fillStyle = outerGlow;
      context.beginPath();
      context.arc(moonX, moonY, moonRadius * 3.5, 0, Math.PI * 2);
      context.fill();

      const moonGradient = context.createRadialGradient(
        moonX - moonRadius * 0.22,
        moonY - moonRadius * 0.25,
        moonRadius * 0.3,
        moonX,
        moonY,
        moonRadius
      );
      moonGradient.addColorStop(0, "#ffe6b0");
      moonGradient.addColorStop(1, "#d6ac64");
      context.fillStyle = moonGradient;
      context.globalAlpha = moonAlpha;
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
      drawStars(timeSeconds);
      drawMoon(timeSeconds, moonVisibility);

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
          "linear-gradient(to bottom, #090b1f 0%, #11173b 50%, #07091b 100%)",
      }}
      aria-hidden="true"
    />
  );
}
