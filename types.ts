export interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  highlight?: boolean;
  ingredients?: string;
  dietaryTags?: string[];
  dietaryNote?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: Dish[];
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  contact: string;
  accentColor: string;
  websiteUrl?: string;
}

export enum ThemeType {
  MODERN = 'MODERN',
  CLASSIC = 'CLASSIC',
  RUSTIC = 'RUSTIC',
  CUSTOM_AI = 'CUSTOM_AI',
}

export interface MenuTheme {
  type: ThemeType;
  backgroundImage?: string; // URL or Base64
  textColor: string;
  headingFont: string;
  bodyFont: string;
  backgroundColor: string; // Fallback
  generatedPrompt?: string;
}

export interface AppState {
  info: RestaurantInfo;
  sections: MenuSection[];
  theme: MenuTheme;
}