/**
 * App-wide Constants
 * Centralized location for all constant values used throughout the app
 */

import { CLOUDINARY } from './cloudinaryImages.js';

// Contact Information
export const CONTACT_INFO = {
  phone: '+919876543210',
  whatsapp: '+919876543210',
  email: 'mathurvaishyabhavanhyderabad@gmail.com',
  /** Used when mapsUrl is not set */
  address: 'Mathur Vaishya Bhavan, Aghapura, Hyderabad',
  /** Preferred — opens exact pin in Google Maps */
  mapsUrl: 'https://maps.app.goo.gl/d47747DoG828TECq8',
};

// Quick Scenarios Data
export const QUICK_SCENARIOS = [
  {
    id: 1,
    title: 'Full Bhavan',
    icon: 'business',
    color: '#0D34B7',
    category: 'full_venue',
  },
  {
    id: 2,
    title: 'Function Hall',
    icon: 'people',
    color: '#E74C3C',
    category: 'function_hall_dining',
  },
  {
    id: 3,
    title: 'Book Stays',
    icon: 'bed',
    color: '#27AE60',
    category: 'rooms_only',
  },
  {
    id: 4,
    title: 'Meeting Room',
    icon: 'briefcase',
    color: '#F39C12',
    category: 'mini_hall',
  },
];

// Category Color Mapping
export const CATEGORY_COLORS = {
  full_venue: '#0D34B7',
  function_hall_dining: '#E74C3C',
  rooms_dining_mini_hall: '#27AE60',
  rooms_mini_hall: '#27AE60',
  function_hall_only: '#E74C3C',
  mini_hall: '#F39C12',
  rooms_only: '#27AE60',
};

// Category Icon Mapping
export const CATEGORY_ICONS = {
  full_venue: 'business',
  function_hall_dining: 'people',
  rooms_dining_mini_hall: 'bed',
  rooms_mini_hall: 'bed',
  function_hall_only: 'people',
  mini_hall: 'briefcase',
  rooms_only: 'bed',
};

export const CAROUSEL_IMAGES = [
  { id: '1', uri: CLOUDINARY.buildingFull },
  { id: '2', uri: CLOUDINARY.mainEntrance },
  { id: '3', uri: CLOUDINARY.parking1 },
  { id: '4', uri: CLOUDINARY.hall1 },
  { id: '5', uri: CLOUDINARY.dining1 },
  { id: '6', uri: CLOUDINARY.miniHall1 },
  { id: '7', uri: CLOUDINARY.roomShot1 },
  { id: '8', uri: CLOUDINARY.thirdEntrance1 },
];

// About Mathur Vaishya Bhavan
export const ABOUT_CONTENT = {
  short: 'Welcome to Mathur Vaishya Bhavan, a serene and elegant venue located in the heart of Hyderabad. Our beautiful facility offers a perfect blend of traditional charm and modern amenities, making it an ideal choice for your special occasions...',

  full: {
    title: 'Welcome to Mathur Vaishya Bhavan',
    description: `Mathur Vaishya Bhavan is a premier event venue located in the vibrant locality of Aghapura, Hyderabad. With years of experience in hosting memorable events, we have become a trusted name for celebrations of all kinds.

Our facility features elegant banquet halls, comfortable guest rooms, and modern amenities that cater to your every need. Whether you're planning a grand wedding, an intimate family gathering, or a corporate event, we provide the perfect setting.`,
    
    highlights: [
      'Spacious banquet halls with customizable layouts',
      'Comfortable guest rooms for your convenience',
      'In-house catering services with diverse menu options',
      'Experienced event management team',
      'Central location with easy accessibility',
      'Modern audio-visual equipment',
      'Ample parking space',
    ],
    
    closing: `At Mathur Vaishya Bhavan, we understand that every event is unique and special. Our dedicated team works closely with you to ensure that your vision comes to life, creating memories that last a lifetime.

We pride ourselves on maintaining the highest standards of cleanliness, hospitality, and service excellence. Our attention to detail and commitment to customer satisfaction have made us the preferred choice for countless families and organizations.`,
  },
};

// Business Hours
export const BUSINESS_HOURS = {
  title: 'Open All Days',
  hours: '9:00 AM - 10:00 PM',
};

// App Configuration
export const APP_CONFIG = {
  carouselAutoScrollInterval: 3000, // 3 seconds
  splashScreenDuration: 2000, // 2 seconds
};
