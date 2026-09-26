import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent exposing server-side errors to clients in production
  productionBrowserSourceMaps: false,

  // Powered-By header removed (fingerprinting mitigation)
  poweredByHeader: false,

  // TypeScript strict on build
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // Restrict image domains to known safe origins only
    remotePatterns: [],
    // Disallow SVG to prevent script injection via SVG data URIs
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'none'; script-src 'none'; sandbox;",
  },

  // Restrict server actions to same-origin
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        process.env.NEXTAUTH_URL ?? "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
