import AsyncStorage from '@react-native-async-storage/async-storage';


// Storage keys - centralized to avoid typos
const STORAGE_KEYS = {
    HAS_SEEN_WELCOME: '@bhavan_has_seen_welcome',
    USER_TOKEN: '@bhavan_user_token',
};

/**
 * Check if user is opening app for the first time
 * @returns {Promise<boolean>} true if first time, false otherwise
 */
export const isFirstTimeUser = async ()=>{
    try {
        const hasSeenWelcome = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_WELCOME);
        
        return hasSeenWelcome === null

    } catch (error) {
        console.error('Error checking first time user:', error);
        return false;
    }
}

/**
 * Mark that user has seen the welcome screen
 * @returns {Promise<void>}
 */
export const markWelcomeAsSeen = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_WELCOME, 'true');
    } catch (error) {
      console.error('Error marking welcome as seen:', error);
    }
  };


  /**
 * Reset first time status (useful for testing)
 * @returns {Promise<void>}
 */
export const resetFirstTimeStatus = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HAS_SEEN_WELCOME);
      console.log('First time status reset - will show welcome screen again');
    } catch (error) {
      console.error('Error resetting first time status:', error);
    }
  };


  /**
 * Save user authentication token
 * @param {string} token - JWT token
 * @returns {Promise<void>}
 */
export const saveToken = async (token) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  };


  /**
 * Get stored authentication token
 * @returns {Promise<string|null>} token or null
 */
export const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  /**
 * Remove authentication token (logout)
 * @returns {Promise<void>}
 */
export const removeToken = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  };

  /**
 * Clear all app data (useful for testing)
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      console.log('All storage cleared');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };




