import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://backend:8080";
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/ws/:path*',
        destination: `${backendUrl}/ws/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/about', destination: '/nosotros', permanent: true },
      { source: '/contact', destination: '/contacto', permanent: true },
      { source: '/fidelidad', destination: '/premios', permanent: true },
      { source: '/catalogo', destination: '/premios/catalogo', permanent: true },
      { source: '/libro-reclamaciones', destination: '/libro-de-reclamaciones', permanent: true },
      { source: '/login', destination: '/auth/login', permanent: true },
      { source: '/politica-privacidad', destination: '/nosotros', permanent: false },
      { source: '/service', destination: '/productos', permanent: true },
      { source: '/terminos-condiciones', destination: '/nosotros', permanent: false },
      { source: '/terminos-servicio', destination: '/nosotros', permanent: false },
    ];
  },
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
