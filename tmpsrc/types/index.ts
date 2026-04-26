export interface Country {
  id: string;
  name: string;
  image: string;
}

export interface State {
  id: string;
  name: string;
  countryId: string;
  image: string;
}

export interface City {
  id: string;
  name: string;
  countryId: string;
  stateId?: string;
  image: string;
}

export interface Retailer {
  id: string;
  name: string;
  cityId: string;
  websiteUrl?: string;
  image: string;
  clicks: number;
}

export interface Offer {
  id: string;
  title: string;
  retailerId: string;
  pdfUrl?: string;
  image?: string;
  badge?: string;
  validFrom: Date;
  validUntil: Date;
  clicks: number;
  likes: number;
  dislikes: number;
  totalTimeSeconds: number;
  maxPagesViewed: number;
}

export interface SiteStat {
  id: string;
  visits: number;
}

export interface Feedback {
  name: string;
  email: string;
  message: string;
  date: Date;
}
