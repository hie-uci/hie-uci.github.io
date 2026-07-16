import type { Metadata } from 'next';

export const SITE_NAME = 'HIE Lab at UC Irvine';
export const SITE_URL = 'https://hie.eng.uci.edu';
export const DEFAULT_SOCIAL_IMAGE = '/images/logo/hie-logo.png';

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonicalPath = path.endsWith('/') ? path : `${path}/`;
  const socialTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'website',
      url: canonicalPath,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: 'HIE Lab at UC Irvine' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [DEFAULT_SOCIAL_IMAGE],
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
