"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PlexusAnimation.module.css";

const MIN_NODES = 20;
const MAX_NODES = 160;
const DEFAULT_NODES = 80;
const NODE_STEP = 5;

const MIN_BRIGHTNESS = 0.3;
const MAX_BRIGHTNESS = 8;
const DEFAULT_BRIGHTNESS = 1;
const BRIGHTNESS_STEP = 0.1;
const MAX_EFFECT_BRIGHTNESS = 6;

const INFLUENCE_RADIUS = 180;
const MAX_LINK_DISTANCE = 120;
const BASELINE_BRIGHTNESS = 0.15;
const EASE = 0.08;

type PlexusNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  brightness: number;
};

function createNodes(count: number, width: number, height: number): PlexusNode[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: 1.5 + Math.random() * 1.5,
    brightness: BASELINE_BRIGHTNESS,
  }));
}

export default function PlexusAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<PlexusNode[]>([]);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const brightnessRef = useRef(DEFAULT_BRIGHTNESS);
  const reducedMotionRef = useRef(false);

  const glowEnabledRef = useRef(true);

  const [nodeCount, setNodeCount] = useState(DEFAULT_NODES);
  const [brightness, setBrightness] = useState(DEFAULT_BRIGHTNESS);
  const [glowEnabled, setGlowEnabled] = useState(true);

  useEffect(() => {
    brightnessRef.current = brightness;
  }, [brightness]);

  useEffect(() => {
    glowEnabledRef.current = glowEnabled;
  }, [glowEnabled]);

  // Canvas setup, resize/pointer listeners, and the draw loop — created once.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;
    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };
    motionQuery.addEventListener("change", handleMotionChange);

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width: rect.width, height: rect.height };
      for (const node of nodesRef.current) {
        node.x = Math.min(node.x, rect.width);
        node.y = Math.min(node.y, rect.height);
      }
    }
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }
    function handlePointerLeave() {
      pointerRef.current = null;
    }
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    let frameId: number;

    function draw() {
      const { width, height } = sizeRef.current;
      ctx!.clearRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const globalBrightness = brightnessRef.current;
      const nodes = nodesRef.current;

      for (const node of nodes) {
        if (!reducedMotionRef.current) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
          node.x = Math.min(Math.max(node.x, 0), width);
          node.y = Math.min(Math.max(node.y, 0), height);
        }

        let target = BASELINE_BRIGHTNESS;
        if (pointer) {
          const dx = node.x - pointer.x;
          const dy = node.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < INFLUENCE_RADIUS) {
            target =
              BASELINE_BRIGHTNESS +
              (1 - BASELINE_BRIGHTNESS) * (1 - dist / INFLUENCE_RADIUS);
          }
        }
        node.brightness += (target - node.brightness) * EASE;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= MAX_LINK_DISTANCE) continue;

          const proximity = 1 - dist / MAX_LINK_DISTANCE;
          const avgBrightness = (a.brightness + b.brightness) / 2;
          const alpha = Math.min(1, proximity * avgBrightness * globalBrightness * 1.15);
          if (alpha < 0.01) continue;

          ctx!.lineWidth = 0.5;
          ctx!.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      for (const node of nodes) {
        const alpha = Math.min(1, node.brightness * globalBrightness);
        const radius =
          node.r * (0.6 + 1.8 * node.brightness * Math.min(globalBrightness, MAX_EFFECT_BRIGHTNESS));

        if (glowEnabledRef.current) {
          const glow = Math.max(0, (node.brightness - 0.35) / 0.65);
          if (glow > 0.02) {
            ctx!.shadowColor = `rgba(255, 255, 255, ${Math.min(1, glow * globalBrightness)})`;
            ctx!.shadowBlur = 18 * glow * Math.min(globalBrightness, MAX_EFFECT_BRIGHTNESS);
          } else {
            ctx!.shadowBlur = 0;
          }
        } else {
          ctx!.shadowBlur = 0;
        }

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx!.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.shadowBlur = 0;

      frameId = requestAnimationFrame(draw);
    }

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Regenerate the node field whenever the requested count changes.
  useEffect(() => {
    const { width, height } = sizeRef.current;
    if (width && height) {
      nodesRef.current = createNodes(nodeCount, width, height);
    }
  }, [nodeCount]);

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Plexus</h2>
      <p className={styles.subtitle}>
        Move the pointer over the field — nearby nodes brighten and connect,
        the rest fade into the dark.
      </p>

      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      </div>

      <div className={styles.controls}>
        <fieldset className={styles.controlGroup}>
          <legend className={styles.visuallyHidden}>Field</legend>
          <div className={styles.groupLabel} aria-hidden="true">
            Field
          </div>
          <div className={styles.sliderRow}>
            <label htmlFor="plexus-brightness" className={styles.sliderLabel}>
              Brightness
            </label>
            <input
              type="range"
              className={styles.slider}
              id="plexus-brightness"
              min={MIN_BRIGHTNESS}
              max={MAX_BRIGHTNESS}
              step={BRIGHTNESS_STEP}
              value={brightness}
              onChange={(e) => setBrightness(parseFloat(e.target.value))}
              aria-describedby="plexus-brightness-val"
            />
            <output
              htmlFor="plexus-brightness"
              id="plexus-brightness-val"
              className={styles.sliderValue}
            >
              {brightness.toFixed(1)}x
            </output>
          </div>
          <div className={styles.sliderRow}>
            <label htmlFor="plexus-nodes" className={styles.sliderLabel}>
              Nodes
            </label>
            <input
              type="range"
              className={styles.slider}
              id="plexus-nodes"
              min={MIN_NODES}
              max={MAX_NODES}
              step={NODE_STEP}
              value={nodeCount}
              onChange={(e) => setNodeCount(parseInt(e.target.value, 10))}
              aria-describedby="plexus-nodes-val"
            />
            <output
              htmlFor="plexus-nodes"
              id="plexus-nodes-val"
              className={styles.sliderValue}
            >
              {nodeCount}
            </output>
          </div>
          <div className={styles.checkboxRow}>
            <span id="plexus-glow-label" className={styles.sliderLabel}>
              Glow
            </span>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                role="switch"
                className={styles.toggleInput}
                checked={glowEnabled}
                onChange={(e) => setGlowEnabled(e.target.checked)}
                aria-labelledby="plexus-glow-label"
              />
              <span className={styles.toggleTrack} aria-hidden="true" />
            </label>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
