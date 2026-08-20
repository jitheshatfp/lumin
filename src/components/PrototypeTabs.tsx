"use client";

import { useRef, useState } from "react";
import HDRLuminanceControls from "./HDRLuminanceControls";
import PlexusAnimation from "./PlexusAnimation";
import styles from "./PrototypeTabs.module.css";

const TABS = [
  { id: "hdr", label: "HDR Luminance" },
  { id: "plexus", label: "Plexus" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function PrototypeTabs() {
  const [active, setActive] = useState<TabId>("hdr");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusTab(index: number) {
    const tab = TABS[index];
    setActive(tab.id);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab((index + 1) % TABS.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab((index - 1 + TABS.length) % TABS.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(TABS.length - 1);
    }
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Design Prototypes</h1>

      <div role="tablist" aria-label="Prototype demos" className={styles.tablist}>
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className={`${styles.tab} ${active === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActive(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        tabIndex={0}
      >
        {active === "hdr" ? <HDRLuminanceControls /> : <PlexusAnimation />}
      </div>
    </main>
  );
}
