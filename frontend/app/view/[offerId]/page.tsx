import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OfferViewClient from './OfferViewClient';

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

async function getOffer(id: string) {
  try {
    const res = await fetch(`${API}/api/offer/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getRetailer(id: string) {
  try {
    const res = await fetch(`${API}/api/retailer/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ offerId: string }> }): Promise<Metadata> {
  const { offerId } = await params;
  const offer = await getOffer(offerId);
  if (!offer) return { title: 'Offer Not Found' };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com';
  return {
    title: offer.metaTitle || offer.title,
    description: offer.metaDescription || `${offer.badge ? offer.badge + ' — ' : ''}Valid until ${new Date(offer.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}. View the full flyer on DealNamaa.`,
    openGraph: {
      title: `${offer.metaTitle || offer.title} | DealNamaa`,
      description: offer.metaDescription || `Valid until ${new Date(offer.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}.`,
      ...(offer.image && { images: [{ url: offer.image.startsWith('http') ? offer.image : `${siteUrl}${offer.image}` }] }),
      type: 'website',
    },
  };
}

export default async function OfferViewPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const offer = await getOffer(offerId);
  if (!offer) notFound();

  const retailer = offer.retailerId ? await getRetailer(offer.retailerId) : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

  // Build JSON-LD server-side so Google can read it
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: offer.title,
    description: offer.badge ? `${offer.badge} - ${offer.title}` : offer.title,
    url: `${siteUrl}/view/${offer.id}`,
    priceValidUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : undefined,
    availability: offer.validUntil && new Date(offer.validUntil) > new Date()
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    ...(offer.validFrom && { validFrom: new Date(offer.validFrom).toISOString() }),
    ...(offer.image && { image: offer.image.startsWith('http') ? offer.image : `${apiBaseUrl}${offer.image}` }),
    ...(retailer && {
      seller: {
        '@type': 'Organization',
        name: retailer.name,
        url: retailer.websiteUrl || `${siteUrl}/offers/${retailer.id}`,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <OfferViewClient offer={offer} retailer={retailer} offerId={offerId} />
    </>
  );
}
