/**
 * App-wide Constants
 * Centralized location for all constant values used throughout the app
 */

// Contact Information
export const CONTACT_INFO = {
  phone: '+919876543210',
  whatsapp: '+919876543210',
  email: 'info@darussalambhavan.com',
  address: '14-1-378, Darus Salam, Aghapura, Hyderabad',
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

// Carousel Images (Placeholders - replace with actual images)
export const CAROUSEL_IMAGES = [
  { id: '1', uri: 'https://placehold.co/800x400/0D34B7/FFFFFF?text=Bhavan+View+1' },
  { id: '2', uri: 'https://placehold.co/800x400/1E4ED8/FFFFFF?text=Bhavan+View+2' },
  { id: '3', uri: 'https://placehold.co/800x400/2952CC/FFFFFF?text=Bhavan+View+3' },
  { id: '4', uri: 'https://placehold.co/800x400/3B5EC4/FFFFFF?text=Bhavan+View+4' },
  { id: '5', uri: 'https://placehold.co/800x400/4D6AB8/FFFFFF?text=Bhavan+View+5' },
];

// About Bhavan Content
export const ABOUT_CONTENT = {
  short: 'Welcome to Darus Salam Bhavan, a serene and elegant venue located in the heart of Hyderabad. Our beautiful facility offers a perfect blend of traditional charm and modern amenities, making it an ideal choice for your special occasions...',
  
  full: {
    title: 'Welcome to Darus Salam Bhavan',
    description: `Darus Salam Bhavan is a premier event venue located in the vibrant locality of Aghapura, Hyderabad. With years of experience in hosting memorable events, we have become a trusted name for celebrations of all kinds.

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
    
    closing: `At Darus Salam Bhavan, we understand that every event is unique and special. Our dedicated team works closely with you to ensure that your vision comes to life, creating memories that last a lifetime.

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
