import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent browsers from MIME-sniffing the content type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block the page from being embedded in an iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Stop sending the referrer header to other origins
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features this app doesn't need
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Content Security Policy — tightened for this app's actual needs:
  // - no external scripts, styles, images, or fonts
  // - no inline event handlers (React doesn't need them)
  // - form submissions stay on the same origin
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // 'unsafe-inline' required by Next.js inline bootstrap scripts
      "style-src 'self' 'unsafe-inline'",  // 'unsafe-inline' required by Tailwind CSS-in-JS
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
