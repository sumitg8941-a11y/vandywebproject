import type { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Search Deals & Offers',
  description: 'Search thousands of coupons, flyers, and retail offers on DealNamaa.',
  openGraph: {
    title: 'Search Deals & Offers | DealNamaa',
    description: 'Search thousands of coupons, flyers, and retail offers on DealNamaa.',
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
