import { api } from './auth';

/**
 * Booking Service
 * Handles all booking-related API calls
 */

const bookingService = {
    /**
     * Check if a package is available for given dates
     * @param {string} packageId - Package ID
     * @param {string} checkInDate - Check-in date (DD-MM-YYYY)
     * @param {string} checkOutDate - Check-out date (DD-MM-YYYY)
     * @param {number} roomQuantity - Number of rooms (for rooms_only packages)
     * @returns {Promise<Object>} Availability details with pricing
     */
    checkAvailability: async (packageId, checkInDate, checkOutDate, roomQuantity = null) => {
        try {
            console.log('🔍 Checking availability...');
            console.log('Package:', packageId);
            console.log('Dates:', checkInDate, '-', checkOutDate);
            if (roomQuantity) console.log('Room Quantity:', roomQuantity);
            
            const requestData = {
                packageId,
                checkInDate,
                checkOutDate
            };
            
            if (roomQuantity) {
                requestData.roomQuantity = roomQuantity;
            }
            
            const response = await api.post('/bookings/check-availability', requestData);
            
            console.log('✅ Availability:', response.data.available ? 'Available' : 'Not Available');
            
            return {
                success: true,
                available: response.data.available,
                data: response.data
            };
        } catch (error) {
            console.error('Error checking availability:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to check availability';
            throw new Error(errorMessage);
        }
    },

    /**
     * Create booking order (Step 1 of payment)
     * @param {Object} bookingData - Complete booking information
     * @param {string} bookingData.packageId - Package ID
     * @param {string} bookingData.checkInDate - Check-in date (DD-MM-YYYY)
     * @param {string} bookingData.checkOutDate - Check-out date (DD-MM-YYYY)
     * @param {number} bookingData.roomQuantity - Number of rooms (optional, for rooms_only)
     * @param {number} bookingData.numberOfGuests - Number of guests (optional, for reference)
     * @param {Object} bookingData.guestDetails - Guest information
     * @param {string} bookingData.specialRequests - Special requests (optional)
     * @returns {Promise<Object>} Booking and Razorpay order details
     */
    createBookingOrder: async (bookingData) => {
        try {
            console.log('🛒 Creating booking order...');
            console.log('Package:', bookingData.packageId);
            console.log('Guest:', bookingData.guestDetails?.fullName);
            
            const response = await api.post('/bookings/create-order', bookingData);
            
            console.log('✅ Order created:', response.data.booking.bookingReferenceId);
            console.log('Razorpay Order ID:', response.data.razorpay.orderId);
            console.log('Amount:', response.data.razorpay.amount);
            
            return {
                success: true,
                booking: response.data.booking,
                razorpay: response.data.razorpay,
                package: response.data.package,
                dates: response.data.dates
            };
        } catch (error) {
            console.error('Error creating booking order:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to create booking order';
            throw new Error(errorMessage);
        }
    },
    /**
     * Verify payment after Razorpay payment success (Step 2 of payment)
     * @param {string} bookingId - Booking ID from createBookingOrder
     * @param {string} razorpay_order_id - Razorpay order ID
     * @param {string} razorpay_payment_id - Razorpay payment ID
     * @param {string} razorpay_signature - Razorpay signature
     * @returns {Promise<Object>} Confirmed booking details
     */
    verifyPayment: async (bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
        try {
            console.log('✅ Verifying payment...');
            console.log('Booking ID:', bookingId);
            console.log('Order ID:', razorpay_order_id);
            
            const response = await api.post('/bookings/verify-payment', {
                bookingId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });
            
            console.log('🎉 Payment verified! Booking confirmed!');
            console.log('Booking Ref:', response.data.booking.bookingReferenceId);
            
            return {
                success: true,
                booking: response.data.booking
            };
        } catch (error) {
            console.error('Error verifying payment:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            const errorMessage = error.response?.data?.message || 'Payment verification failed';
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch all bookings of logged-in user
     * @param {string} status - Optional status filter ('confirmed', 'pending', 'cancelled', etc.)
     * @returns {Promise<Array>} Array of bookings
     */
    fetchMyBookings: async (status = null) => {
        try {
            console.log('📋 Fetching my bookings...');
            if (status) console.log('Status filter:', status);
            
            const url = status ? `/bookings/my-bookings?status=${status}` : '/bookings/my-bookings';
            const response = await api.get(url);
            
            console.log('✅ Bookings fetched:', response.data.count);
            
            return {
                success: true,
                bookings: response.data.data,
                count: response.data.count
            };
        } catch (error) {
            console.error('Error fetching bookings:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to fetch bookings';
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch single booking by ID
     * @param {string} bookingId - Booking ID
     * @returns {Promise<Object>} Booking details
     */
    fetchBookingById: async (bookingId) => {
        try {
            console.log('📋 Fetching booking details:', bookingId);
            
            const response = await api.get(`/bookings/${bookingId}`);
            
            console.log('✅ Booking details fetched');
            
            return {
                success: true,
                booking: response.data.data
            };
        } catch (error) {
            console.error('Error fetching booking details:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            if (error.response?.status === 404) {
                throw new Error('Booking not found');
            }
            
            if (error.response?.status === 403) {
                throw new Error('Unauthorized access to this booking');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to fetch booking details';
            throw new Error(errorMessage);
        }
    },

    /**
     * Cancel a booking
     * @param {string} bookingId - Booking ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise<Object>} Updated booking details
     */
    cancelBooking: async (bookingId, reason) => {
        try {
            console.log('❌ Cancelling booking:', bookingId);
            console.log('Reason:', reason);
            
            const response = await api.post(`/bookings/${bookingId}/cancel`, {
                reason: reason || 'Cancelled by user'
            });
            
            console.log('✅ Booking cancelled successfully');
            
            return {
                success: true,
                booking: response.data.data
            };
        } catch (error) {
            console.error('Error cancelling booking:', error);
            
            if (error.message === 'Network Error' || !error.response) {
                throw new Error('Cannot connect to server.');
            }
            
            if (error.response?.status === 403) {
                throw new Error('Unauthorized to cancel this booking');
            }
            
            const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
            throw new Error(errorMessage);
        }
    }

}
export default bookingService;