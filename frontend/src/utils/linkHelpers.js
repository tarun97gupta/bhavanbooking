/**
 * Link Helper Utilities
 * Helper functions for opening external links
 */

import { Linking } from 'react-native';
import { CONTACT_INFO } from '../constants/app';

/**
 * Open phone dialer with the bhavan's phone number
 */
export const openPhoneCall = () => {
  Linking.openURL(`tel:${CONTACT_INFO.phone}`);
};

/**
 * Open WhatsApp with the bhavan's number and optional message
 * @param {string} message - Optional pre-filled message
 */
export const openWhatsApp = (message = '') => {
  const phoneNumber = CONTACT_INFO.whatsapp.replace('+', '');
  const url = message 
    ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${phoneNumber}`;
  Linking.openURL(url);
};

/**
 * Open email client with the bhavan's email
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 */
export const openEmail = (subject = '', body = '') => {
  const email = CONTACT_INFO.email;
  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  Linking.openURL(url);
};

/**
 * Open Google Maps (pinned location if mapsUrl is set, else search by address)
 */
export const openMaps = () => {
  const url =
    CONTACT_INFO.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`;
  Linking.openURL(url);
};
