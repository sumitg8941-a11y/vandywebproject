/**
 * Breadcrumb Utilities
 * 
 * Helper functions for parsing URLs and generating breadcrumb metadata
 */

export interface BreadcrumbSegment {
  label: string;
  href: string;
  type: 'country' | 'state' | 'city' | 'retailer' | 'offer' | 'home';
  id?: string;
}

/**
 * Parse URL pathname to determine breadcrumb context
 * 
 * @param pathname - Current URL pathname (e.g., '/retailers/dubai')
 * @returns Object with type and id for breadcrumb generation
 */
export function parseBreadcrumbContext(pathname: string): { type: string; id: string } | null {
  // Remove trailing slash
  const cleanPath = pathname.replace(/\/$/, '');
  
  // Match patterns
  const patterns = [
    { regex: /^\/offers\/([^/]+)$/, type: 'retailer' },           // /offers/retailer-id
    { regex: /^\/retailers\/([^/]+)$/, type: 'city' },            // /retailers/city-id
    { regex: /^\/cities\/state\/([^/]+)$/, type: 'state' },       // /cities/state/state-id
    { regex: /^\/cities\/([^/]+)$/, type: 'city' },               // /cities/country-id (shows cities)
    { regex: /^\/view\/([^/]+)$/, type: 'offer' },                // /view/offer-id
  ];

  for (const pattern of patterns) {
    const match = cleanPath.match(pattern.regex);
    if (match) {
      return { type: pattern.type, id: match[1] };
    }
  }

  return null;
}

/**
 * Generate SEO-friendly breadcrumb schema for structured data
 * 
 * @param breadcrumbs - Array of breadcrumb segments
 * @returns JSON-LD structured data object
 */
export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbSegment[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.label,
      'item': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com'}${crumb.href}`
    }))
  };
}

/**
 * Truncate long text with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 25): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Convert slug to display name (fallback when API data unavailable)
 * 
 * @param slug - URL slug (e.g., 'new-delhi')
 * @returns Display name (e.g., 'New Delhi')
 */
export function slugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Build breadcrumb URL based on type and ID
 * 
 * @param type - Entity type
 * @param id - Entity ID
 * @returns URL path
 */
export function buildBreadcrumbUrl(type: string, id: string): string {
  const urlMap: Record<string, string> = {
    country: `/cities/${id}`,
    state: `/cities/state/${id}`,
    city: `/retailers/${id}`,
    retailer: `/offers/${id}`,
    offer: `/view/${id}`
  };
  
  return urlMap[type] || '/';
}

/**
 * Get icon for breadcrumb type
 * 
 * @param type - Entity type
 * @returns Font Awesome icon class
 */
export function getBreadcrumbIcon(type: string): string {
  const iconMap: Record<string, string> = {
    home: 'fa-home',
    country: 'fa-flag',
    state: 'fa-map',
    city: 'fa-city',
    retailer: 'fa-store',
    offer: 'fa-tag'
  };
  
  return iconMap[type] || 'fa-circle';
}
