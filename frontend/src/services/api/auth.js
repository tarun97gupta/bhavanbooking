import Constants from 'expo-constants';
import axios from 'axios';
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

console.log('API_URL:', API_URL);


// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});


// Add request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Data:', config.data);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);


// Add response interceptor for logging
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(`❌ API Error: ${error.response?.status || 'Network Error'}`);
        console.error('Error details:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);


const authService = {
    /**
   * Login user with phone number and password
   * @param {string} phoneNumber - User's phone number (10 digits)
   * @param {string} password - User's password
   * @returns {Promise<{token: string, user: object}>}
   */

    login: async (phoneNumber, password) => {
        try {
            const response = await api.post('/auth/login', {
                phoneNumber: phoneNumber,
                password: password,
            });

            return {
                success: true,
                token: response.data.token,
                user: response.data.user,
            };
        } catch (error) {
            console.error('Login error:', error);

            // Handle different error types
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout. Please try again.');
            }

            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server. Please check your internet connection.');
            }

            // Backend returned an error
            const errorMessage = error.response?.data?.message || 'Login failed';
            throw new Error(errorMessage);
        }
    },

    /**
   * Verify JWT token with backend
   * @param {string} token - JWT token
   * @returns {Promise<{user: object}>}
   */

    verifyToken: async (token) => {
        try {
            const response = await api.get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return {
                success: true,
                user: response.data.user,
            };
        } catch (error) {
            console.error('Token verification error:', error);

            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }

            const errorMessage = error.response?.data?.message || 'Token verification failed';
            throw new Error(errorMessage);
        }
    },

    /**
 * Register new user
 * @param {object} userData - User registration data
 * @returns {Promise<{token: string, user: object}>}
 */

    register: async (userData) => {
        try {
          const response = await api.post('/auth/register', userData);
    
          return {
            success: true,
            token: response.data.token,
            user: response.data.user,
          };
        } catch (error) {
          console.error('Registration error:', error);
    
          if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. Please try again.');
          }
    
          if (error.message === 'Network Error' || !error.response) {
            throw new Error('Cannot connect to server. Please check your internet connection.');
          }
    
          const errorMessage = error.response?.data?.message || 'Registration failed';
          throw new Error(errorMessage);
        }
      },




}

export default authService;