import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/willkommen",
        permanent: true,
      },
      {
        // Backward compatibility: the standings page moved from
        // /rangliste to /tabelle. Keep old bookmarks and links in
        // already-sent emails working. Query params are forwarded.
        source: "/turniere/:slug/rangliste",
        destination: "/turniere/:slug/tabelle",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source:
          "/((?!(?:ausschreibung|turnierordnung|uhren|anleitung)(?:\\/|$)|turniere\\/[^\\/]+\\/(?:ausschreibung|turnierordnung)(?:\\/|$)).*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
