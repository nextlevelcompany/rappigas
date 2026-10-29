import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    rules: {
      "**/*.{tsx,jsx}": {
        loaders: [
          {
            loader: "@locator/webpack-loader",
            options: {
              env: "development",
            },
          },
        ],
      },
    },
  },
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      config.module.rules.push({
        test: /\.(tsx|ts|jsx|js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "@locator/webpack-loader",
            options: { env: "development" },
          },
        ],
      })
    }
    return config
  },
}

export default nextConfig
