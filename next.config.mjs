/** @type {import('next').NextConfig} */
const nextConfig = {
  // self-contained server bundle in .next/standalone, for Docker images
  output: "standalone",
  allowedDevOrigins: [
    'local-origin.dev',
    '*.local-origin.dev',
    '192.168.18.12',
    // ngrok tunnels (the subdomain changes each session on the free plan)
    '*.ngrok-free.dev',
    '*.ngrok-free.app',
  ],
  turbopack: {
    rules: {
      // Tailwind v4 runs as a Turbopack loader (no PostCSS config needed)
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  reactCompiler: true,
  reactStrictMode: true,
};

export default nextConfig;
