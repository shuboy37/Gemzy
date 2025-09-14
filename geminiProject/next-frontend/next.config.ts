import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix workspace root detection issues
  outputFileTracingRoot: __dirname,

  // Production optimization - standalone output for Docker/deployment
  output: "standalone",

  // Enable static optimization and compression
  compress: true,
  poweredByHeader: false, // Remove "X-Powered-By: Next.js" header for security

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Prevent clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Prevent MIME type sniffing
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin", // Control referrer information
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()", // Disable unnecessary permissions
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"], // Modern image formats
    minimumCacheTTL: 31536000, // Cache images for 1 year
    dangerouslyAllowSVG: true, // Allow SVG (you have favicon.svg)
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // // Allow blob URLs for optimized AI images
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "**",
    //   },
    // ],
    // // Enable optimization for blob URLs
    // unoptimized: false,
  },

  // Turbopack configuration
  experimental: {
    turbo: {
      root: __dirname,
    },
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tooltip",
      "axios", // Add axios to optimization
      "motion", // Your motion package
    ],
    // Enable server actions and other modern features
    serverComponentsExternalPackages: ["axios"], // Optimize server-side packages
  },

  // Compiler optimizations
  compiler: {
    // Remove console statements in production - keep only console.error for debugging
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"], // Keep console.error for critical debugging
          }
        : false,
    // Remove React DevTools in production
    reactRemoveProperties:
      process.env.NODE_ENV === "production"
        ? { properties: ["data-testid"] }
        : false,
  },

  // Bundle analyzer (helpful for production optimization)
  ...(process.env.ANALYZE === "true" && {
    webpack: (config: any) => {
      if (process.env.NODE_ENV === "production") {
        const { BundleAnalyzerPlugin } = require("@next/bundle-analyzer")();
        config.plugins.push(new BundleAnalyzerPlugin());
      }
      return config;
    },
  }),

  // Better dev server configuration
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: "bottom-right",
  },

  // Production caching strategy
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // Dispose entries after 25s of inactivity
    pagesBufferLength: 2, // Keep 2 pages in memory
  },

  // TypeScript optimization
  typescript: {
    ignoreBuildErrors: false, // Don't deploy with TypeScript errors
  },

  // ESLint optimization
  eslint: {
    ignoreDuringBuilds: false, // Don't deploy with ESLint errors
  },
};
