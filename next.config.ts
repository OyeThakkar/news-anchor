import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages render fully on the server instead of streaming in behind loading placeholders,
  // which some embedded browsers never reveal.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
