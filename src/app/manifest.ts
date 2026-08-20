import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Design Prototypes",
    short_name: "Prototypes",
    description:
      "Interactive prototypes: tune Display P3 HDR glow CSS, and explore an interactive plexus node field.",
    start_url: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
