import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";
import { withAxiom } from "next-axiom";
import nextMdx from "@next/mdx";
import createJiti from "jiti";
import withSerwistInit from "@serwist/next";

const jiti = createJiti(fileURLToPath(import.meta.url));
 
// Import env here to validate during build. Using jiti we can import .ts files :)
const env = jiti("./env");

const withMDX = nextMdx();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ["@sentry/nextjs", "@sentry/node"],
    instrumentationHook: true,
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "ph-avatars.imgix.net",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/bulk-unsubscribe',
        has: [
          {
            type: 'cookie',
            key: '__Secure-authjs.session-token',
          }
        ],
        permanent: false,
      },
      {
        source: "/feature-requests",
        destination: "https://inboxzero.featurebase.app",
        permanent: true,
      },
      {
        source: "/feedback",
        destination: "https://inboxzero.featurebase.app",
        permanent: true,
      },
      {
        source: "/roadmap",
        destination: "https://inboxzero.featurebase.app/roadmap",
        permanent: true,
      },
      {
        source: "/changelog",
        destination: "https://inboxzero.featurebase.app/changelog",
        permanent: true,
      },
      {
        source: "/twitter",
        destination: "https://twitter.com/inboxzero_ai",
        permanent: true,
      },
      {
        source: "/github",
        destination: "https://github.com/elie222/inbox-zero",
        permanent: true,
      },
      {
        source: "/discord",
        destination: "https://discord.gg/UnBwsydrug",
        permanent: true,
      },
      {
        source: "/linkedin",
        destination: "https://www.linkedin.com/company/inbox-zero-ai/",
        permanent: true,
      },
      {
        source: "/waitlist",
        destination: "https://airtable.com/shr7HNx6FXaIxR5q6",
        permanent: true,
      },
      {
        source: "/affiliates",
        destination: "https://inboxzero.lemonsqueezy.com/affiliates",
        permanent: true,
      },
      {
        source: "/newsletters",
        destination: "/bulk-unsubscribe",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/:path*",
        destination: "https://app.posthog.com/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

const sentryOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: env.SENTRY_ORGANIZATION,
  project: env.SENTRY_PROJECT,
};

const sentryConfig = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

const mdxConfig = withMDX(nextConfig);

const exportConfig =
  env.NEXT_PUBLIC_SENTRY_DSN && env.SENTRY_ORGANIZATION && env.SENTRY_PROJECT
    ? withSentryConfig(mdxConfig, { ...sentryOptions, ...sentryConfig })
    : mdxConfig;

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

export default withAxiom(withSerwist(exportConfig));
