// AlumniTextSphere.jsx
import React, { useEffect, useRef } from "react";

export default function AlumniTextSphere({
  items = [
    "Entrepreneurship",
    "Leadership",
    "Nostalgia",
    "Reconnect",
    "Heritage",
    "Futuristic",
    "Giving Back",
    "Networking",
  ],
  background = "transparent",
  textColor = "#ffffff",
  autoSpin = 0.002, // base spin speed
  className,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  // ====== 🔧 TWEAKABLE VARIABLES ======
  const BASE_RADIUS_FACTOR = 0.20;
  const SAFE_MARGIN = 25;

  const BASE_FONT_SIZE = 19;
  const FONT_SCALE = 5;
  const MAX_FONT_SIZE = 50;
  const FONT_FAMILY =
    'ui-serif, Georgia, Cambria, "Times New Roman", serif';

  const SHADOW_COLOR = "rgba(0,0,0,0.35)";
  const SHADOW_BLUR = 6;
  const SHADOW_OFFSET_X = 0;
  const SHADOW_OFFSET_Y = 1;

  const MIN_OPACITY = 0.4;
  const VELOCITY_EASING = 0.06;
  const FOV = 1.8;

  const HOVER_SLOWDOWN = 0.0003; // 🔥 very slow spin on hover
  // ===================================

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    let w = canvas.parentElement.clientWidth || 600;
    let h = Math.max(360, Math.min(600, w));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const center = { x: w / 2, y: h / 2 };
    let radius = Math.min(w, h) * BASE_RADIUS_FACTOR;

    // Fibonacci sphere distribution
    const N = items.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const points = Array.from({ length: N }).map((_, i) => {
      const k = i + 0.5;
      const y = 1 - (k * 2) / N;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * k;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      return { x, y, z, text: items[i] };
    });

    // rotation state
    let rotX = 0;
    let rotY = 0;
    let velX = autoSpin;
    let velY = -autoSpin * 0.6;
    let targetVelX = velX;
    let targetVelY = velY;

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
      const my = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
      const dx = (mx - center.x) / center.x;
      const dy = (my - center.y) / center.y;
      targetVelY = dx * 0.03;
      targetVelX = -dy * 0.03;
    }
    function onPointerLeave() {
      targetVelX = autoSpin;
      targetVelY = -autoSpin * 0.6;
    }

    // 🔥 Slow down on hover
    function onPointerEnter() {
      targetVelX = HOVER_SLOWDOWN;
      targetVelY = -HOVER_SLOWDOWN;
    }

    canvas.addEventListener("mousemove", onPointerMove);
    canvas.addEventListener("touchmove", onPointerMove, { passive: true });
    canvas.addEventListener("mouseleave", onPointerLeave);
    canvas.addEventListener("touchend", onPointerLeave);
    canvas.addEventListener("mouseenter", onPointerEnter);

    function onResize() {
      w = canvas.parentElement.clientWidth || 600;
      h = Math.max(360, Math.min(600, w));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      center.x = w / 2;
      center.y = h / 2;
      radius = Math.min(w, h) * BASE_RADIUS_FACTOR;
    }
    window.addEventListener("resize", onResize);

    function project(p) {
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      let y = p.y * cosX - p.z * sinX;
      let z = p.y * sinX + p.z * cosX;
      let x = p.x * cosY + z * sinY;
      z = -p.x * sinY + z * cosY;

      const depth = FOV / (FOV - z);
      const sx = x * radius * depth + center.x;
      const sy = y * radius * depth + center.y;
      return { sx, sy, scale: depth, z };
    }

    function render() {
      velX += (targetVelX - velX) * VELOCITY_EASING;
      velY += (targetVelY - velY) * VELOCITY_EASING;

      rotX += velX;
      rotY += velY;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      if (background !== "transparent") {
        // ctx.fillStyle = background;
        // ctx.fillRect(0, 0, w, h);
      }

      const projected = points
        .map((p) => ({ ...p, ...project(p) }))
        .sort((a, b) => a.z - b.z);

      for (const p of projected) {
        let size = Math.max(BASE_FONT_SIZE, FONT_SCALE * p.scale);
        size = Math.min(size, MAX_FONT_SIZE);

        ctx.font = `${size}px ${FONT_FAMILY}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = Math.max(MIN_OPACITY, Math.min(1, p.scale));
        ctx.fillStyle = textColor;
        ctx.shadowColor = SHADOW_COLOR;
        ctx.shadowBlur = SHADOW_BLUR;
        ctx.shadowOffsetX = SHADOW_OFFSET_X;
        ctx.shadowOffsetY = SHADOW_OFFSET_Y;

        if (
          p.sx < SAFE_MARGIN ||
          p.sx > w - SAFE_MARGIN ||
          p.sy < SAFE_MARGIN ||
          p.sy > h - SAFE_MARGIN
        ) {
          continue;
        }

        ctx.fillText(p.text, p.sx, p.sy);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onPointerMove);
      canvas.removeEventListener("touchmove", onPointerMove);
      canvas.removeEventListener("mouseleave", onPointerLeave);
      canvas.removeEventListener("touchend", onPointerLeave);
      canvas.removeEventListener("mouseenter", onPointerEnter);
    };
  }, [items, background, textColor, autoSpin]);

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", cursor: "grab", touchAction: "none" }}
        aria-label="Rotating text sphere"
      />
    </div>
  );
}
