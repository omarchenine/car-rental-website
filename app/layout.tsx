import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { GoogleAnalytics } from "@/components/google-analytics"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "DCMotors — Premium Car Dealership",
    template: "%s | DCMotors",
  },
  description:
    "Hand-picked premium cars. Browse our curated inventory of quality vehicles, each inspected and ready to drive.",
  generator: "v0.app",
  openGraph: {
    title: "DCMotors — Premium Car Dealership",
    description: "Hand-picked premium cars, curated and inspected.",
    type: "website",
  },
  verification: {
    google: "google96fc682b85be962e",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f4ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1220" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <head>
        <GoogleAnalytics />
      </head>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
