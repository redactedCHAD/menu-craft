import { AppState, ThemeType } from './types';

export const DIETARY_TAGS = [
  { id: 'GF', label: 'Gluten-Free', color: 'bg-green-100 text-green-800' },
  { id: 'V', label: 'Vegetarian', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'VG', label: 'Vegan', color: 'bg-lime-100 text-lime-800' },
  { id: 'DF', label: 'Dairy-Free', color: 'bg-sky-100 text-sky-800' },
  { id: 'NF', label: 'Nut-Free', color: 'bg-amber-100 text-amber-800' },
  { id: 'SP', label: 'Spicy', color: 'bg-red-100 text-red-800' },
];

export const DEFAULT_SECTIONS = [
  {
    id: 's1',
    title: 'Starters',
    items: [
      { 
        id: 'd1', 
        name: 'Bruschetta', 
        description: 'Grilled bread rubbed with garlic and topped with olive oil and salt.', 
        price: '$12', 
        highlight: false,
        ingredients: 'Bread, Garlic, Olive Oil, Salt, Tomatoes, Basil',
        dietaryTags: ['V', 'VG'],
        dietaryNote: ''
      },
      { 
        id: 'd2', 
        name: 'Calamari', 
        description: 'Fried squid served with lemon and marinara sauce.', 
        price: '$16', 
        highlight: true,
        ingredients: 'Squid, Flour, Lemon, Marinara',
        dietaryTags: ['DF'],
        dietaryNote: 'Contains shellfish'
      },
    ]
  },
  {
    id: 's2',
    title: 'Mains',
    items: [
      { 
        id: 'd3', 
        name: 'Truffle Pasta', 
        description: 'Fresh tagliatelle with black truffle cream sauce.', 
        price: '$28', 
        highlight: true,
        ingredients: 'Pasta, Cream, Black Truffle, Parmesan',
        dietaryTags: ['V'],
        dietaryNote: ''
      },
      { 
        id: 'd4', 
        name: 'Grilled Salmon', 
        description: 'Atlantic salmon served with asparagus and quinoa.', 
        price: '$32', 
        highlight: false,
        ingredients: 'Salmon, Asparagus, Quinoa, Lemon Butter',
        dietaryTags: ['GF'],
        dietaryNote: ''
      },
    ]
  }
];

export const INITIAL_STATE: AppState = {
  info: {
    name: 'La Dolce Vita',
    tagline: 'Authentic Italian Cuisine',
    contact: '123 Flavor St, Foodville • (555) 123-4567',
    accentColor: '#d97706',
    websiteUrl: 'https://example.com/menu',
  },
  sections: DEFAULT_SECTIONS,
  theme: {
    type: ThemeType.CLASSIC,
    textColor: '#1e293b',
    headingFont: 'font-serif',
    bodyFont: 'font-sans',
    backgroundColor: '#ffffff',
  }
};

export const MODEL_IMAGE = 'gemini-3-pro-image-preview'; // Nano Banana Pro
export const MODEL_TEXT = 'gemini-2.5-flash';