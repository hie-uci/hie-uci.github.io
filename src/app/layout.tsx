import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Instrument_Serif, Martian_Mono, Mona_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import CommandPalette from "@/components/CommandPalette";
import { DEFAULT_SOCIAL_IMAGE, serializeJsonLd, SITE_NAME, SITE_URL } from "@/lib/metadata";
import { MOTION_BOOT_SCRIPT } from "@/lib/motionPreference";

// Mona Sans carries the whole type system. Its width axis is the brand gesture:
// display lines are set expanded, text stays at normal width.
const monaSans = Mona_Sans({
  variable: "--font-mona",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

// One accent face, used for a single word per page at most.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// Readouts, kickers, axis labels, dates.
const martianMono = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#060a12" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HIE Lab | UC Irvine - High-speed Integrated Electronics",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "High-speed Integrated Electronics Laboratory at UC Irvine — mm-wave and terahertz circuit design, AI-driven analog design, and emerging device technologies.",
  keywords: [
    "HIE Lab",
    "UC Irvine",
    "mm-wave",
    "terahertz",
    "integrated circuits",
    "RFIC",
    "analog design",
    "EECS",
  ],
  alternates: { canonical: "/" },
  authors: [{ name: "High-speed Integrated Electronics Laboratory" }],
  creator: "High-speed Integrated Electronics Laboratory at UC Irvine",
  publisher: "University of California, Irvine",
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: "HIE Lab | UC Irvine - High-speed Integrated Electronics",
    description:
      "High-speed Integrated Electronics Laboratory at UC Irvine — mm-wave and terahertz circuit design, AI-driven analog design, and emerging device technologies.",
    images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: "HIE Lab at UC Irvine" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HIE Lab | UC Irvine - High-speed Integrated Electronics",
    description:
      "High-speed Integrated Electronics Laboratory at UC Irvine — mm-wave and terahertz circuit design, AI-driven analog design, and emerging device technologies.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "High-speed Integrated Electronics Laboratory",
  alternateName: "HIE Lab",
  url: SITE_URL,
  logo: `${SITE_URL}${DEFAULT_SOCIAL_IMAGE}`,
  email: "haghasi@uci.edu",
  telephone: "+1-949-824-8810",
  description:
    "UC Irvine research laboratory advancing mm-wave and terahertz integrated circuits, radar systems, AI-driven analog design, and emerging electronic devices.",
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "University of California, Irvine",
    url: "https://uci.edu",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Irvine",
    addressRegion: "CA",
    postalCode: "92697",
    addressCountry: "US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before first paint so a reduced-motion choice never flashes an animation. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
      </head>
      <body
        className={`${monaSans.variable} ${instrumentSerif.variable} ${martianMono.variable} antialiased`}
      >
        <Providers>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
          />
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Navbar />
          <ViewTransition>
            <div id="main" className="min-h-dvh">
              {children}
            </div>
          </ViewTransition>
          <Footer />
          <ScrollToTop />
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
