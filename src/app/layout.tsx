import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://hdr-luminance.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HDR Luminance Controls",
    template: "%s · HDR Luminance Controls",
  },
  description:
    "Tune Display P3 channel values and glow spread for HDR-capable screens, then copy ready-to-use CSS built on @media (dynamic-range: high).",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HDR Luminance Controls",
    description:
      "Tune Display P3 channel values and glow spread for HDR-capable screens, then copy the generated CSS.",
    url: "/",
    siteName: "HDR Luminance Controls",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HDR Luminance Controls",
    description:
      "Tune Display P3 channel values and glow spread for HDR-capable screens, then copy the generated CSS.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
