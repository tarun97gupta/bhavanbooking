import Constants from 'expo-constants';
import axios from 'axios';
import { getToken } from '../../utils/storage';

const API_URL =  'http://192.168.29.78:3000/api';

console.log('API_URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// ==================== TOKEN INTERCEPTOR ====================
// Automatically adds JWT token to all requests
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await getToken();
            
            if (token && !config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('🔑 Token added to request');
            }
        } catch (error) {
            console.error('Error getting token for request:', error);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==================== REQUEST LOGGING INTERCEPTOR ====================
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

// ==================== RESPONSE LOGGING INTERCEPTOR ====================
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

// ==================== AUTH SERVICE ====================
const authService = {
    /**
     * Login user with phone number and password
     * @param {string} phoneNumber - User's phone number
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

            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout. Please try again.');
            }

            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server. Please check your internet connection.');
            }

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

    /**
     * Update user profile
     * @param {object} profileData - Profile data to update
     * @returns {Promise<{user: object}>}
     */
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/auth/update-profile', profileData);

            return {
                success: true,
                user: response.data.user,
                message: response.data.message,
            };
        } catch (error) {
            console.error('Update profile error:', error);

            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }

            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            throw new Error(errorMessage);
        }
    },
};

// Export both the service and the api instance
export { api };
export default authService;