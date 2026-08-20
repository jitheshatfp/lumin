import PrototypeTabs from "@/components/PrototypeTabs";

// This page must render per-request (not be statically prerendered) so the
// CSP nonce middleware.ts generates for each request matches the nonce Next
// embeds in that response's inline hydration scripts. A prerendered page
// would ship a nonce baked in at build time that never matches the
// per-request header, and the browser blocks every script on the page.
export const dynamic = "force-dynamic";

export default function Home() {
  return <PrototypeTabs />;
}
