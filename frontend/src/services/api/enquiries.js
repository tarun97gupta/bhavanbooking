import axios from 'axios';

// API Configuration  
// ⚠️ IMPORTANT: Update this IP to match your backend server's IP address
const API_URL = 'http://192.168.29.78:3000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Response interceptor for logging
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.response?.data?.message || error.message);
        throw error;
    }
);

/**
 * Enquiry Service
 * Handles all enquiry-related API calls
 */

const enquiryService = {
    /**
     * Submit a new enquiry
     * @param {Object} enquiryData - Enquiry details
     * @returns {Promise<Object>} Created enquiry
     */
    submitEnquiry: async (enquiryData) => {
        try {
            console.log('📝 Submitting enquiry...', enquiryData);
            
            const response = await api.post('/enquiries', enquiryData);
            
            console.log('✅ Enquiry submitted successfully');
            
            return {
                success: true,
                enquiry: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('❌ Error submitting enquiry:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.message || 
                'Failed to submit enquiry. Please try again.'
            );
        }
    },

    /**
     * Get all enquiries (with optional filters)
     * @param {Object} filters - Filter options (status, packageId, page, limit)
     * @returns {Promise<Object>} Enquiries with pagination
     */
    fetchEnquiries: async (filters = {}) => {
        try {
            console.log('📋 Fetching enquiries...', filters);
            
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.packageId) params.append('packageId', filters.packageId);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);
            
            const response = await api.get(`/enquiries?${params.toString()}`);
            
            console.log('✅ Enquiries fetched:', response.data.pagination.total);
            
            return {
                success: true,
                enquiries: response.data.data,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('❌ Error fetching enquiries:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.message || 
                'Failed to fetch enquiries. Please try again.'
            );
        }
    },

    /**
     * Get single enquiry by ID
     * @param {String} enquiryId - Enquiry ID
     * @returns {Promise<Object>} Enquiry details
     */
    fetchEnquiryById: async (enquiryId) => {
        try {
            console.log('📋 Fetching enquiry:', enquiryId);
            
            const response = await api.get(`/enquiries/${enquiryId}`);
            
            console.log('✅ Enquiry fetched');
            
            return {
                success: true,
                enquiry: response.data.data
            };
        } catch (error) {
            console.error('❌ Error fetching enquiry:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.message || 
                'Failed to fetch enquiry details. Please try again.'
            );
        }
    },

    /**
     * Get enquiry statistics
     * @returns {Promise<Object>} Statistics
     */
    fetchEnquiryStats: async () => {
        try {
            console.log('📊 Fetching enquiry statistics...');
            
            const response = await api.get('/enquiries/stats/summary');
            
            console.log('✅ Statistics fetched');
            
            return {
                success: true,
                stats: response.data.data
            };
        } catch (error) {
            console.error('❌ Error fetching statistics:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.message || 
                'Failed to fetch statistics. Please try again.'
            );
        }
    }
};

export default enquiryService;

