import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"

import UIThemeProvider from "@/providers/ui-theme-provider"
import LocatorSetup from "@/components/LocatorSetup"

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "RappiGas Perú - Pedidos de Gas a Domicilio",

  description:
    "RappiGas: La plataforma líder de pedidos y distribución de gas GLP en el Perú con pesaje exacto garantizado.",

  icons: {
    icon: [
      { url: "/api/favicon", sizes: "any" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/api/favicon",
    apple: "/api/favicon",
  },

  keywords: [
    "RappiGas",
    "Gas a domicilio",
    "Balón de gas",
    "Gas GLP Perú",
    "Pide tu gas",
    "Osinergmin",
    "Distribuidora de gas",
  ],

  authors: [
    {
      name: "RappiGas",
    },
  ],

  creator: "RappiGas Perú",

  openGraph: {
    title: "RappiGas Perú – Pedidos y Distribución de Gas GLP",

    description:
      "Plataforma inteligente de pedidos de balones de gas a domicilio en Perú.",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "RappiGas Perú – Pedidos y Distribución de Gas GLP",

    description:
      "Plataforma inteligente de pedidos de balones de gas a domicilio en Perú.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <LocatorSetup />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UIThemeProvider>
            {children}
          </UIThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}