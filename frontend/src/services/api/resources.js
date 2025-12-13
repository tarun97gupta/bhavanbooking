import { api } from './auth';

/**
 * Resource Service
 * Handles all resource-related API calls
 */
const resourceService = {
    /**
     * Fetch all active resources
     * @param {string} facilityType - Optional facility type filter
     * @param {string} category - Optional category filter (for guest rooms)
     * @returns {Promise<Array>} Array of resources
     */
    fetchResources: async (facilityType = null, category = null) => {
        try {
            console.log('🏨 Fetching resources...');
            
            let url = '/resources';
            const params = [];
            
            if (facilityType) params.push(`facilityType=${facilityType}`);
            if (category) params.push(`category=${category}`);
            
            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }
            
            const response = await api.get(url);
            
            console.log('✅ Resources fetched:', response.data.count);
            
            return {
                success: true,
                resources: response.data.data,
                count: response.data.count
            };
        } catch (error) {
            console.error('Error fetching resources:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to fetch resources';
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch guest rooms grouped by category
     * @returns {Promise<Object>} Guest rooms grouped by category
     */
    fetchGuestRooms: async () => {
        try {
            console.log('🛏️ Fetching guest rooms...');
            
            const response = await api.get('/resources/guest-rooms');
            
            console.log('✅ Guest rooms fetched');
            
            return {
                success: true,
                guestRooms: response.data.data,
                count: response.data.count
            };
        } catch (error) {
            console.error('Error fetching guest rooms:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to fetch guest rooms';
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch single resource by ID
     * @param {string} resourceId - Resource ID
     * @returns {Promise<Object>} Resource details
     */
    fetchResourceById: async (resourceId) => {
        try {
            console.log('🏨 Fetching resource details:', resourceId);
            
            const response = await api.get(`/resources/${resourceId}`);
            
            console.log('✅ Resource details fetched:', response.data.data.name);
            
            return {
                success: true,
                resource: response.data.data
            };
        } catch (error) {
            console.error('Error fetching resource details:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            if (error.response?.status === 404) {
                throw new Error('Resource not found');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to fetch resource details';
            throw new Error(errorMessage);
        }
    }
};

export default resourceService;