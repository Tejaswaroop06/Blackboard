import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  async headers() {
    const headers = [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          // Only allow unsafe-eval in development
          `script-src 'self' ${isProd ? "" : "'unsafe-eval'"} 'unsafe-inline'`,
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https:",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https: wss:",
          "media-src 'self' blob:",
          "frame-ancestors 'none'",
        ].join("; "),
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(self), geolocation=()",
      },
    ];

    // Add HSTS only in production
    if (isProd) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default nextConfig;
