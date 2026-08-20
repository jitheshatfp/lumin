import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://hdr-luminance.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Design Prototypes",
    template: "%s · Design Prototypes",
  },
  description:
    "Interactive prototypes: tune Display P3 HDR glow CSS, and explore an interactive plexus node field.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Design Prototypes",
    description:
      "Interactive prototypes: tune Display P3 HDR glow CSS, and explore an interactive plexus node field.",
    url: "/",
    siteName: "Design Prototypes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Prototypes",
    description:
      "Interactive prototypes: tune Display P3 HDR glow CSS, and explore an interactive plexus node field.",
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
