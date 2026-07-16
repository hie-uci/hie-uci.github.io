import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { DEFAULT_SOCIAL_IMAGE, serializeJsonLd, SITE_NAME, SITE_URL } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-500`}
      >
        <Providers>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
          />
          <Navbar />
          {children}
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
