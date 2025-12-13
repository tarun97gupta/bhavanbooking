import { api } from './auth';


/**
 * Package Service
 * Handles all package-related API calls
 */

const packageService = {
     /**
     * Fetch all active packages
     * @param {string} category - Optional category filter
     * @returns {Promise<Array>} Array of packages
     */

     fetchPackages: async (category = null) => {
        try {
            console.log('📦 Fetching packages...', category ? `Category: ${category}` : 'All');
            
            const url = category ? `/packages?category=${category}` : '/packages';
            const response = await api.get(url);
            
            console.log('✅ Packages fetched:', response.data.count);
            
            return {
                success: true,
                packages: response.data.data,
                count: response.data.count
            };
        } catch (error) {
            console.error('Error fetching packages:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server. Please check your internet connection.');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to fetch packages';
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch single package by ID
     * @param {string} packageId - Package ID
     * @returns {Promise<Object>} Package details
     */
    fetchPackageById: async (packageId) => {
        try {
            console.log('📦 Fetching package details:', packageId);
            
            const response = await api.get(`/packages/${packageId}`);
            
            console.log('✅ Package details fetched:', response.data.data.name);
            
            return {
                success: true,
                package: response.data.data
            };
        } catch (error) {
            console.error('Error fetching package details:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            if (error.response?.status === 404) {
                throw new Error('Package not found');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to fetch package details';
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch popular packages
     * @returns {Promise<Array>} Array of popular packages
     */
    fetchPopularPackages: async () => {
        try {
            console.log('📦 Fetching popular packages...');
            
            const response = await api.get('/packages/popular/list');
            
            console.log('✅ Popular packages fetched:', response.data.count);
            
            return {
                success: true,
                packages: response.data.data,
                count: response.data.count
            };
        } catch (error) {
            console.error('Error fetching popular packages:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to fetch popular packages';
            throw new Error(errorMessage);
        }
    },
    calculatePrice: async (packageId, checkInDate, checkOutDate, roomQuantity = null) => {
        try {
            console.log('💰 Calculating price for package:', packageId);
            console.log('Dates:', checkInDate, '-', checkOutDate);
            if (roomQuantity) console.log('Room Quantity:', roomQuantity);
            
            const requestData = {
                checkInDate,
                checkOutDate
            };
            
            if (roomQuantity) {
                requestData.roomQuantity = roomQuantity;
            }
            
            const response = await api.post(`/packages/${packageId}/calculate-price`, requestData);
            
            console.log('✅ Price calculated:', response.data.pricing.finalAmount);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error calculating price:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to calculate price';
            throw new Error(errorMessage);
        }
    }
}

export default packageService;