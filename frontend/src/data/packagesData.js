/**
 * Packages (static). Gallery URLs per package; resources: resourcesData.js
 */

import { CLOUDINARY } from '../constants/cloudinaryImages.js';
import { RESOURCES_BY_ID } from './resourcesData.js';

const R = {
  functionHall: '69382afe53246ca7134018e2',
  diningHall: '69382b2953246ca7134018e6',
  miniHall: '69382b4f53246ca7134018ea',
  deluxeRoom: '69382b6853246ca7134018ee',
  standardRoom: '69382b7853246ca7134018f2',
};

/** Raw rows: resourceRef points into RESOURCES_BY_ID */
const PACKAGES_RAW = [
  {
    _id: '69397e9293e027b970bcfbb1',
    name: 'Full Bhavan Booking',
    slug: 'full-bhavan-booking',
    category: 'full_venue',
    description:
      'Book the entire venue including all rooms, function hall, dining hall, and mini hall. Ideal for weddings, large gatherings, and multi-day events. Includes accommodation for up to 24 guests across 6 rooms, function hall for 500 people, dining for 200, and mini hall for meetings.',
    shortDescription: 'Complete venue with all facilities - perfect for large events',
    images: [
      CLOUDINARY.buildingFull,
      CLOUDINARY.parking1,
      CLOUDINARY.parking2,
      CLOUDINARY.groundStairs,
      CLOUDINARY.mainEntrance,
      CLOUDINARY.hall1,
      CLOUDINARY.dining1,
      CLOUDINARY.kitchen,
      CLOUDINARY.miniHall1,
      CLOUDINARY.roomShot1,
      CLOUDINARY.thirdEntrance1,
    ],
    includes: {
      resources: [
        { resourceRef: R.deluxeRoom, quantity: 2, isRequired: true, isFlexible: false, minQuantity: 2, maxQuantity: 2 },
        { resourceRef: R.standardRoom, quantity: 4, isRequired: true, isFlexible: false, minQuantity: 4, maxQuantity: 4 },
        { resourceRef: R.functionHall, quantity: 1, isRequired: true, isFlexible: false, minQuantity: 1, maxQuantity: 1 },
        { resourceRef: R.diningHall, quantity: 1, isRequired: true, isFlexible: false, minQuantity: 1, maxQuantity: 1 },
        { resourceRef: R.miniHall, quantity: 1, isRequired: true, isFlexible: false, minQuantity: 1, maxQuantity: 1 },
      ],
      dining: true,
      breakfast: true,
      lunch: true,
      dinner: true,
    },
    pricing: { basePrice: 50000, gstPercentage: 18 },
    bookingRules: {
      minDays: 1,
      maxDays: 3,
      advanceBookingDays: 90,
      cancellationPolicy: '50% refund if cancelled 15+ days before check-in. No refund within 15 days.',
    },
    termsAndConditions: [
      'Entire venue will be exclusively yours',
      'No other bookings allowed during your reservation',
      'Setup time: 6 hours before event',
      'Cleanup required after event',
    ],
    displayOrder: 1,
    bookingCount: 5,
    isActive: true,
  },
  {
    _id: '69397eed93e027b970bcfbbd',
    name: 'Function Hall + Dining Package',
    slug: 'function-hall-dining-package',
    category: 'function_hall_dining',
    description:
      'Book the function hall for up to 500 guests with full dining facilities. Ideal for wedding receptions, birthday parties, and corporate events with catering needs.',
    shortDescription: 'Perfect for day events with catering',
    images: [
      CLOUDINARY.hall1,
      CLOUDINARY.hall2,
      CLOUDINARY.hall3,
      CLOUDINARY.mainEntrance,
      CLOUDINARY.dining1,
      CLOUDINARY.dining2,
      CLOUDINARY.kitchen,
      CLOUDINARY.poojaRoom,
    ],
    includes: {
      resources: [
        { resourceRef: R.functionHall, quantity: 1, isRequired: true, isFlexible: false, minQuantity: 1, maxQuantity: 1 },
        { resourceRef: R.diningHall, quantity: 1, isRequired: true, isFlexible: false, minQuantity: 1, maxQuantity: 1 },
      ],
      dining: true,
      breakfast: false,
      lunch: true,
      dinner: true,
    },
    pricing: { basePrice: 25000, gstPercentage: 18 },
    bookingRules: {
      minDays: 1,
      maxDays: 2,
      advanceBookingDays: 60,
      cancellationPolicy:
        '75% refund if cancelled 10+ days before. 50% refund if 5-10 days. No refund within 5 days.',
    },
    termsAndConditions: [
      'Function hall capacity: 500 people',
      'Dining hall capacity: 200 people',
      'Catering coordination required in advance',
    ],
    displayOrder: 2,
    bookingCount: 1,
    isActive: true,
  },
  {
    _id: '69397f4693e027b970bcfbc8',
    name: 'Complete Stay Package',
    slug: 'complete-stay-package',
    category: 'rooms_dining_mini_hall',
    description:
      'Book all 6 guest rooms (2 Deluxe + 4 Standard) with full dining access and mini hall for meetings. Perfect for family gatherings, group tours, or corporate retreats requiring accommodation, meals, and meeting space.',
    shortDescription: 'All rooms with dining and meeting facility',
    images: [
      CLOUDINARY.roomShot1,
      CLOUDINARY.roomShot2,
      CLOUDINARY.roomA,
      CLOUDINARY.roomB,
      CLOUDINARY.roomC,
      CLOUDINARY.miniHall1,
      CLOUDINARY.miniHall2,
      CLOUDINARY.thirdEntrance1,
      CLOUDINARY.thirdEntrance2,
    ],
    includes: {
      resources: [
        { resourceRef: R.deluxeRoom, quantity: 2, isRequired: true, isFlexible: false, minQuantity: 2, maxQuantity: 2 },
        { resourceRef: R.standardRoom, quantity: 4, isRequired: true, isFlexible: false, minQuantity: 4, maxQuantity: 4 },
        { resourceRef: R.diningHall, quantity: 1, isRequired: true, isFlexible: false, minQuantity: 1, maxQuantity: 1 },
        { resourceRef: R.miniHall, quantity: 1, isRequired: true, isFlexible: false, minQuantity: 1, maxQuantity: 1 },
      ],
      dining: true,
      breakfast: true,
      lunch: true,
      dinner: true,
    },
    pricing: { basePrice: 20000, gstPercentage: 18 },
    bookingRules: {
      minDays: 1,
      maxDays: 7,
      advanceBookingDays: 90,
      cancellationPolicy: 'No refund within 7 days of check-in',
    },
    termsAndConditions: [
      'Accommodates up to 24 guests',
      'All meals included',
      'Mini hall available for meetings/events',
    ],
    displayOrder: 3,
    bookingCount: 1,
    isActive: true,
  },
  {
    _id: '6939804302b58d0fff8e4fb2',
    name: 'Rooms + Meeting Package',
    slug: 'rooms-meeting-package',
    category: 'rooms_mini_hall',
    description:
      'Book all 6 guest rooms with mini hall access. Ideal for corporate groups, training sessions, or family gatherings who prefer to arrange their own meals.',
    shortDescription: 'All rooms with meeting facility (no dining)',
    images: [
      CLOUDINARY.roomC,
      CLOUDINARY.roomA,
      CLOUDINARY.roomB,
      CLOUDINARY.roomShot2,
      CLOUDINARY.miniHall1,
      CLOUDINARY.miniHall2,
      CLOUDINARY.thirdEntrance1,
      CLOUDINARY.thirdEntrance2,
    ],
    includes: {
      resources: [
        { resourceRef: R.deluxeRoom, quantity: 2, isRequired: true, isFlexible: false, minQuantity: 2, maxQuantity: 2 },
        { resourceRef: R.standardRoom, quantity: 4, isRequired: true, isFlexible: false, minQuantity: 4, maxQuantity: 4 },
        { resourceRef: R.miniHall, quantity: 1, isRequired: true, isFlexible: false, minQuantity: 1, maxQuantity: 1 },
      ],
      dining: false,
      breakfast: false,
      lunch: false,
      dinner: false,
    },
    pricing: { basePrice: 15000, gstPercentage: 18 },
    bookingRules: {
      minDays: 1,
      maxDays: 7,
      advanceBookingDays: 90,
      cancellationPolicy: 'No refund within 7 days of check-in',
    },
    termsAndConditions: [
      'Accommodates up to 24 guests',
      'Mini hall for meetings/gatherings',
      'Outside food allowed',
    ],
    displayOrder: 4,
    bookingCount: 0,
    isActive: true,
  },
  {
    _id: '6939806602b58d0fff8e4fbb',
    name: 'Function Hall Only',
    slug: 'function-hall-only',
    category: 'function_hall_only',
    description:
      'Book just the function hall for your event. Capacity up to 500 people. Perfect for events where you want to arrange your own catering or don\'t need dining facilities.',
    shortDescription: 'Spacious hall for events (no dining)',
    images: [
      CLOUDINARY.mainEntrance,
      CLOUDINARY.hall1,
      CLOUDINARY.hall2,
      CLOUDINARY.hall3,
      CLOUDINARY.poojaRoom,
      CLOUDINARY.firstEntranceLift,
    ],
    includes: {
      resources: [
        { resourceRef: R.functionHall, quantity: 1, isRequired: true, isFlexible: false, minQuantity: 1, maxQuantity: 1 },
      ],
      dining: false,
      breakfast: false,
      lunch: false,
      dinner: false,
    },
    pricing: { basePrice: 15000, gstPercentage: 18 },
    bookingRules: {
      minDays: 1,
      maxDays: 2,
      advanceBookingDays: 60,
      cancellationPolicy: '50% refund if cancelled 7+ days before. No refund within 7 days.',
    },
    termsAndConditions: [
      'Capacity: 500 people',
      'Outside catering allowed',
      'Setup time: 4 hours before event',
    ],
    displayOrder: 5,
    bookingCount: 2,
    isActive: true,
  },
  {
    _id: '6939808602b58d0fff8e4fc2',
    name: 'Mini Hall Booking',
    slug: 'mini-hall-booking',
    category: 'mini_hall',
    description:
      'Book the mini hall for meetings, committee gatherings, small events, or family functions. Capacity up to 50 people with AC, projector, and WiFi.',
    shortDescription: 'Meeting room for small gatherings',
    images: [
      CLOUDINARY.miniHall1,
      CLOUDINARY.miniHall2,
      CLOUDINARY.thirdEntrance1,
      CLOUDINARY.thirdEntrance2,
    ],
    includes: {
      resources: [
        { resourceRef: R.miniHall, quantity: 1, isRequired: true, isFlexible: false, minQuantity: 1, maxQuantity: 1 },
      ],
      dining: false,
      breakfast: false,
      lunch: false,
      dinner: false,
    },
    pricing: { basePrice: 5000, gstPercentage: 18 },
    bookingRules: {
      minDays: 1,
      maxDays: 7,
      advanceBookingDays: 30,
      cancellationPolicy: 'Full refund if cancelled 3+ days before. No refund within 3 days.',
    },
    termsAndConditions: [
      'Capacity: 50 people',
      'AC, WiFi, Projector included',
      'Light refreshments allowed',
    ],
    displayOrder: 6,
    bookingCount: 1,
    isActive: true,
  },
  {
    _id: '693980b202b58d0fff8e4fc9',
    name: 'Deluxe Room Booking',
    slug: 'deluxe-room-booking',
    category: 'rooms_only',
    description:
      'Book individual Deluxe rooms. Premium accommodation with king-size beds, attached bathrooms, AC, TV, and WiFi. Capacity 4 guests per room. Choose 1-2 rooms based on availability.',
    shortDescription: 'Premium rooms with modern amenities',
    images: [
      CLOUDINARY.roomShot1,
      CLOUDINARY.roomShot2,
      CLOUDINARY.roomA,
      CLOUDINARY.roomB,
    ],
    includes: {
      resources: [
        {
          resourceRef: R.deluxeRoom,
          quantity: 1,
          isRequired: true,
          isFlexible: true,
          minQuantity: 1,
          maxQuantity: 2,
        },
      ],
      dining: false,
      breakfast: false,
      lunch: false,
      dinner: false,
    },
    pricing: { basePrice: 0, gstPercentage: 18 },
    bookingRules: {
      minDays: 1,
      maxDays: 7,
      advanceBookingDays: 90,
      cancellationPolicy: 'No refund within 2 days of check-in',
    },
    termsAndConditions: [
      'Check-in: 2 PM',
      'Check-out: 11 AM',
      'ID proof required',
      'Advance payment required',
    ],
    displayOrder: 7,
    bookingCount: 2,
    isActive: true,
  },
  {
    _id: '6939822b02b58d0fff8e4fe3',
    name: 'Standard Room Booking',
    slug: 'standard-room-booking',
    category: 'rooms_only',
    description:
      'Book individual Standard rooms. Comfortable accommodation with queen-size beds, attached bathrooms, AC, TV, and WiFi. Capacity 4 guests per room. Choose 1-4 rooms based on availability.',
    shortDescription: 'Comfortable rooms with basic amenities',
    images: [
      CLOUDINARY.roomC,
      CLOUDINARY.roomA,
      CLOUDINARY.roomB,
      CLOUDINARY.roomShot2,
    ],
    includes: {
      resources: [
        {
          resourceRef: R.standardRoom,
          quantity: 1,
          isRequired: true,
          isFlexible: true,
          minQuantity: 1,
          maxQuantity: 4,
        },
      ],
      dining: false,
      breakfast: false,
      lunch: false,
      dinner: false,
    },
    pricing: { basePrice: 0, gstPercentage: 18 },
    bookingRules: {
      minDays: 1,
      maxDays: 7,
      advanceBookingDays: 90,
      cancellationPolicy: 'No refund within 2 days of check-in',
    },
    termsAndConditions: [
      'Check-in: 2 PM',
      'Check-out: 11 AM',
      'ID proof required',
    ],
    displayOrder: 8,
    bookingCount: 2,
    isActive: true,
  },
];

function populatePackage(pkg) {
  const includes = { ...pkg.includes };
  includes.resources = pkg.includes.resources.map((row) => {
    const ref = row.resourceRef;
    const base = RESOURCES_BY_ID[ref];
    const resource = base
      ? { ...base, _id: ref }
      : {
          _id: ref,
          name: 'Unknown resource',
          facilityType: 'unknown',
          capacity: 0,
          basePrice: 0,
        };
    return {
      quantity: row.quantity,
      isRequired: row.isRequired,
      isFlexible: row.isFlexible,
      minQuantity: row.minQuantity,
      maxQuantity: row.maxQuantity,
      resource,
    };
  });
  return { ...pkg, includes };
}

export const PACKAGES = PACKAGES_RAW.map(populatePackage);
