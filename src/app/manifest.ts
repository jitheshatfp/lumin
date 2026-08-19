import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HDR Luminance Controls",
    short_name: "HDR Luminance",
    description:
      "Tune Display P3 channel values and glow spread for HDR-capable screens.",
    start_url: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
