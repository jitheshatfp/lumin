"use client";

import { useMemo, useState, type CSSProperties } from "react";
import styles from "./HDRLuminanceControls.module.css";

type FieldKey =
  | "p3r"
  | "p3g"
  | "p3b"
  | "glowOpacity"
  | "glowInner"
  | "glowMid"
  | "glowOuter"
  | "dotSize"
  | "containerSize"
  | "containerRadius";

type FieldConfig = {
  key: FieldKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: "ratio" | "px";
};

type FieldGroup = {
  legend: string;
  fullWidth?: boolean;
  fields: FieldConfig[];
};

const initialValues: Record<FieldKey, number> = {
  p3r: 1,
  p3g: 1,
  p3b: 1,
  glowOpacity: 0.6,
  glowInner: 4,
  glowMid: 12,
  glowOuter: 24,
  dotSize: 8,
  containerSize: 64,
  containerRadius: 12,
};

const groups: FieldGroup[] = [
  {
    legend: "P3 Channels",
    fields: [
      { key: "p3r", label: "Red", min: 0, max: 1.5, step: 0.01, unit: "ratio" },
      { key: "p3g", label: "Green", min: 0, max: 1.5, step: 0.01, unit: "ratio" },
      { key: "p3b", label: "Blue", min: 0, max: 1.5, step: 0.01, unit: "ratio" },
      { key: "glowOpacity", label: "Glow α", min: 0, max: 1, step: 0.01, unit: "ratio" },
    ],
  },
  {
    legend: "Glow Spread",
    fields: [
      { key: "glowInner", label: "Inner", min: 0, max: 20, step: 0.5, unit: "px" },
      { key: "glowMid", label: "Mid", min: 0, max: 40, step: 1, unit: "px" },
      { key: "glowOuter", label: "Outer", min: 0, max: 80, step: 1, unit: "px" },
    ],
  },
  {
    legend: "Geometry",
    fullWidth: true,
    fields: [
      { key: "dotSize", label: "Dot size", min: 2, max: 32, step: 1, unit: "px" },
      { key: "containerSize", label: "Box size", min: 32, max: 200, step: 2, unit: "px" },
      { key: "containerRadius", label: "Radius", min: 0, max: 50, step: 1, unit: "px" },
    ],
  },
];

function formatValue(unit: FieldConfig["unit"], value: number) {
  return unit === "ratio" ? value.toFixed(2) : `${value}px`;
}

function buildCss(v: Record<FieldKey, number>) {
  const r = v.p3r.toFixed(2);
  const g = v.p3g.toFixed(2);
  const b = v.p3b.toFixed(2);
  const o = v.glowOpacity.toFixed(2);
  const midOpacity = (v.glowOpacity * 0.5).toFixed(2);
  const outerOpacity = (v.glowOpacity * 0.15).toFixed(2);
  const innerSpread = (v.glowInner * 0.25).toFixed(1);
  const midSpread = (v.glowMid * 0.33).toFixed(1);
  const outerSpread = (v.glowOuter * 0.33).toFixed(1);

  return `.container { width: ${v.containerSize}px; height: ${v.containerSize}px; background: #000; border-radius: ${v.containerRadius}px; }
.dot { width: ${v.dotSize}px; height: ${v.dotSize}px; border-radius: 50%; background: #fff; }
@media (dynamic-range: high) {
  .dot {
    background: color(display-p3 ${r} ${g} ${b});
    box-shadow:
      0 0 ${v.glowInner}px ${innerSpread}px color(display-p3 ${r} ${g} ${b} / ${o}),
      0 0 ${v.glowMid}px ${midSpread}px color(display-p3 ${r} ${g} ${b} / ${midOpacity}),
      0 0 ${v.glowOuter}px ${outerSpread}px color(display-p3 ${r} ${g} ${b} / ${outerOpacity});
  }
}`;
}

export default function HDRLuminanceControls() {
  const [values, setValues] = useState(initialValues);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const generatedCss = useMemo(() => buildCss(values), [values]);

  function setField(key: FieldKey, raw: string) {
    setValues((prev) => ({ ...prev, [key]: parseFloat(raw) }));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generatedCss);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    } finally {
      setTimeout(() => setCopyState("idle"), 1500);
    }
  }

  const stageStyle: CSSProperties = {
    "--container-size": `${values.containerSize}px`,
    "--container-radius": `${values.containerRadius}px`,
    "--dot-size": `${values.dotSize}px`,
    "--p3-r": values.p3r.toFixed(3),
    "--p3-g": values.p3g.toFixed(3),
    "--p3-b": values.p3b.toFixed(3),
    "--glow-opacity": values.glowOpacity.toFixed(3),
    "--glow-inner": `${values.glowInner}px`,
    "--glow-inner-spread": `${(values.glowInner * 0.25).toFixed(1)}px`,
    "--glow-mid": `${values.glowMid}px`,
    "--glow-mid-spread": `${(values.glowMid * 0.33).toFixed(1)}px`,
    "--glow-outer": `${values.glowOuter}px`,
    "--glow-outer-spread": `${(values.glowOuter * 0.33).toFixed(1)}px`,
  } as CSSProperties;

  return (
    <main className={styles.app}>
      <h1 className={styles.title}>HDR Luminance Controls</h1>
      <p className={styles.subtitle}>
        Tune Display P3 channel values and glow spread for HDR-capable
        screens, then copy the generated CSS.
      </p>

      <div className={styles.stage} style={stageStyle}>
        <div className={styles.container}>
          <div className={`${styles.dot} ${styles.hdrActive}`} />
        </div>
      </div>

      <div className={styles.controls}>
        {groups.map((group) => (
          <fieldset
            key={group.legend}
            className={`${styles.controlGroup} ${group.fullWidth ? styles.fullWidth : ""}`}
          >
            <legend className={styles.groupLabel}>{group.legend}</legend>
            {group.fields.map((field) => (
              <div className={styles.sliderRow} key={field.key}>
                <label htmlFor={field.key} className={styles.sliderLabel}>
                  {field.label}
                </label>
                <input
                  type="range"
                  className={styles.slider}
                  id={field.key}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={values[field.key]}
                  onChange={(e) => setField(field.key, e.target.value)}
                  aria-describedby={`${field.key}-val`}
                />
                <output
                  htmlFor={field.key}
                  id={`${field.key}-val`}
                  className={styles.sliderValue}
                >
                  {formatValue(field.unit, values[field.key])}
                </output>
              </div>
            ))}
          </fieldset>
        ))}
      </div>

      <section className={styles.output} aria-labelledby="css-output-heading">
        <div className={styles.outputHeader}>
          <h2 id="css-output-heading">Generated CSS</h2>
          <button
            type="button"
            className={styles.copyBtn}
            onClick={handleCopy}
            aria-live="polite"
          >
            {copyState === "copied"
              ? "Copied"
              : copyState === "failed"
                ? "Copy failed"
                : "Copy"}
          </button>
        </div>
        <pre className={styles.codeBlock}>
          <code>{generatedCss}</code>
        </pre>
      </section>
    </main>
  );
}
