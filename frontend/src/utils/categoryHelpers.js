/**
 * Category Helper Utilities
 * Helper functions for category-related operations
 */

import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/app';
import colors from '../styles/colors';

/**
 * Get color for a given category
 * @param {string} category - Package category
 * @returns {string} Color hex code
 */
export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || colors.primary;
};

/**
 * Get icon name for a given category
 * @param {string} category - Package category
 * @returns {string} Icon name
 */
export const getCategoryIcon = (category) => {
  return CATEGORY_ICONS[category] || 'cube';
};
