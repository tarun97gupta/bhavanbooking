import express from 'express';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import Resource from '../models/Resource.js';
import protectRoute from '../middleware/auth.middleware.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';

dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
const router = express.Router();

//Initialize Razorpay client

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// ==================== PUBLIC ROUTES (USER) ====================

/**
 * @route   POST /api/bookings/check-availability
 * @desc    Check if package is available for given dates
 * @access  Private (authenticated users)
 * @body    {
 *            packageId: ObjectId,
 *            checkInDate: "DD-MM-YYYY",
 *            checkOutDate: "DD-MM-YYYY",
 *            roomQuantity: 2 (only for rooms_only category)
 *          }
 */

router.post('/check-availability', protectRoute, async (req, res) => {
    try {
        const { packageId, checkInDate, checkOutDate, roomQuantity } = req.body;

        // ==================== VALIDATION ====================

        if (!packageId || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide packageId, checkInDate, and checkOutDate'
            });
        }

        // Validate package ID
        if (!mongoose.Types.ObjectId.isValid(packageId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package ID'
            });
        }

        // Find package and populate resources
        const bookingPackage = await Package.findById(packageId)
            .populate('includes.resources.resource');

        if (!bookingPackage || !bookingPackage.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Package not found or not active'
            });
        }

        // Parse and validate dates
        const checkIn = dayjs.utc(checkInDate, 'DD-MM-YYYY').startOf('day');
        const checkOut = dayjs.utc(checkOutDate, 'DD-MM-YYYY').startOf('day');

        if (!checkIn.isValid() || !checkOut.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use DD-MM-YYYY'
            });
        }

        if (checkOut.isSameOrBefore(checkIn)) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date'
            });
        }

        const today = dayjs.utc().startOf('day');
        if (checkIn.isBefore(today)) {
            return res.status(400).json({
                success: false,
                message: 'Check-in date cannot be in the past'
            });
        }

        const numberOfDays = checkOut.diff(checkIn, 'day');

        // Validate booking rules
        if (numberOfDays < bookingPackage.bookingRules.minDays) {
            return res.status(400).json({
                success: false,
                message: `Minimum ${bookingPackage.bookingRules.minDays} day(s) required`
            });
        }

        if (numberOfDays > bookingPackage.bookingRules.maxDays) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${bookingPackage.bookingRules.maxDays} day(s) allowed`
            });
        }

        // ==================== AVAILABILITY CHECK ====================

        const checkInDate_obj = checkIn.toDate();
        const checkOutDate_obj = checkOut.toDate();

        // Determine which resources to check based on category
        let resourcesToBook = [];

        if (bookingPackage.category === 'rooms_only') {
            // For rooms_only, user specifies quantity
            if (!roomQuantity || roomQuantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide roomQuantity for room bookings'
                });
            }

            const roomResource = bookingPackage.includes.resources.find(
                r => r.resource.facilityType === 'guest_room'
            );

            if (!roomResource) {
                return res.status(500).json({
                    success: false,
                    message: 'Package configuration error'
                });
            }

            // Validate quantity
            if (roomQuantity > roomResource.resource.totalUnits) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${roomResource.resource.totalUnits} rooms available`
                });
            }

            resourcesToBook = [{
                resourceId: roomResource.resource._id,
                quantity: roomQuantity,
                totalUnits: roomResource.resource.totalUnits
            }];

        } else {
            // For fixed packages, use package configuration
            resourcesToBook = bookingPackage.includes.resources.map(item => ({
                resourceId: item.resource._id,
                quantity: item.quantity,
                totalUnits: item.resource.totalUnits
            }));
        }

        // Check availability for each resource
        let allAvailable = true;
        const unavailableResources = [];

        for (const resourceItem of resourcesToBook) {
            // Find overlapping bookings for this resource
            const overlappingBookings = await Booking.find({
                'resources.resource': resourceItem.resourceId,
                status: { $in: ['confirmed', 'checked_in'] },
                checkInDate: { $lt: checkOutDate_obj },
                checkOutDate: { $gt: checkInDate_obj }
            });

            // Calculate total booked units
            let bookedUnits = 0;
            overlappingBookings.forEach(booking => {
                booking.resources.forEach(res => {
                    if (res.resource.toString() === resourceItem.resourceId.toString()) {
                        bookedUnits += res.quantity;
                    }
                });
            });

            const availableUnits = resourceItem.totalUnits - bookedUnits;

            if (availableUnits < resourceItem.quantity) {
                allAvailable = false;
                const resource = await Resource.findById(resourceItem.resourceId);
                unavailableResources.push({
                    name: resource.name,
                    requested: resourceItem.quantity,
                    available: availableUnits
                });
            }
        }

        if (!allAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Selected package is not available for the chosen dates',
                unavailableResources
            });
        }

        // ==================== CALCULATE PRICING ====================

        let subtotal = 0;
        let resourcePricing = 0;

        if (bookingPackage.category === 'rooms_only') {
            const roomResource = bookingPackage.includes.resources[0].resource;
            resourcePricing = roomResource.basePrice * roomQuantity * numberOfDays;
            subtotal = resourcePricing;
        } else {
            subtotal = bookingPackage.pricing.basePrice * numberOfDays;
        }

        const gstAmount = Math.round((subtotal * bookingPackage.pricing.gstPercentage) / 100);
        const finalAmount = subtotal + gstAmount;

        return res.status(200).json({
            success: true,
            available: true,
            package: {
                id: bookingPackage._id,
                name: bookingPackage.name,
                category: bookingPackage.category
            },
            dates: {
                checkInDate: checkIn.format('DD-MM-YYYY'),
                checkOutDate: checkOut.format('DD-MM-YYYY'),
                numberOfDays
            },
            pricing: {
                packageBasePrice: bookingPackage.pricing.basePrice,
                resourcePricing: resourcePricing,
                subtotal,
                gst: {
                    percentage: bookingPackage.pricing.gstPercentage,
                    amount: gstAmount
                },
                finalAmount
            },
            message: 'Package is available for the selected dates'
        });

    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking availability',
            error: error.message
        });
    }
})

/**
 * @route   POST /api/bookings/create-order
 * @desc    Create Razorpay order and pending booking
 * @access  Private (authenticated users)
 * @body    {
 *            packageId: ObjectId,
 *            checkInDate: "DD-MM-YYYY",
 *            checkOutDate: "DD-MM-YYYY",
 *            roomQuantity: 2 (for rooms_only),
 *            numberOfGuests: 10 (optional),
 *            guestDetails: { fullName, phoneNumber, email, ... },
 *            specialRequests: "..."
 *          }
 */

router.post('/create-order', protectRoute, async (req, res) => {
    try {
        const {
            packageId,
            checkInDate,
            checkOutDate,
            roomQuantity,
            numberOfGuests,
            guestDetails,
            specialRequests
        } = req.body;

        // ==================== VALIDATION ====================

        if (!packageId || !checkInDate || !checkOutDate || !guestDetails) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (!guestDetails.fullName || !guestDetails.phoneNumber || !guestDetails.email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide guest fullName, phoneNumber, and email'
            });
        }

        // Find package
        const bookingPackage = await Package.findById(packageId)
            .populate('includes.resources.resource');

        if (!bookingPackage || !bookingPackage.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Package not found or not active'
            });
        }

        // Parse dates
        const checkIn = dayjs.utc(checkInDate, 'DD-MM-YYYY').startOf('day');
        const checkOut = dayjs.utc(checkOutDate, 'DD-MM-YYYY').startOf('day');

        if (!checkIn.isValid() || !checkOut.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use DD-MM-YYYY'
            });
        }

        const numberOfDays = checkOut.diff(checkIn, 'day');

        // ==================== RE-CHECK AVAILABILITY ====================
        // (Same logic as check-availability route)

        const checkInDate_obj = checkIn.toDate();
        const checkOutDate_obj = checkOut.toDate();

        let resourcesToBook = [];

        if (bookingPackage.category === 'rooms_only') {
            if (!roomQuantity || roomQuantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide roomQuantity'
                });
            }

            const roomResource = bookingPackage.includes.resources[0];
            resourcesToBook = [{
                resource: roomResource.resource._id,
                facilityType: roomResource.resource.facilityType,
                name: roomResource.resource.name,
                category: roomResource.resource.category,
                quantity: roomQuantity,
                capacity: roomResource.resource.capacity * roomQuantity
            }];
        } else {
            resourcesToBook = bookingPackage.includes.resources.map(item => ({
                resource: item.resource._id,
                facilityType: item.resource.facilityType,
                name: item.resource.name,
                category: item.resource.category,
                quantity: item.quantity,
                capacity: item.resource.capacity * item.quantity
            }));
        }

        // Check availability
        for (const resourceItem of resourcesToBook) {
            const overlappingBookings = await Booking.find({
                'resources.resource': resourceItem.resource,
                status: { $in: ['confirmed', 'checked_in', 'pending'] },
                checkInDate: { $lt: checkOutDate_obj },
                checkOutDate: { $gt: checkInDate_obj }
            });

            let bookedUnits = 0;
            overlappingBookings.forEach(booking => {
                booking.resources.forEach(res => {
                    if (res.resource.toString() === resourceItem.resource.toString()) {
                        bookedUnits += res.quantity;
                    }
                });
            });

            const resource = await Resource.findById(resourceItem.resource);
            const availableUnits = resource.totalUnits - bookedUnits;

            if (availableUnits < resourceItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${resource.name} is no longer available for the selected dates`
                });
            }
        }

        // ==================== CALCULATE PRICING ====================

        let packageBasePrice = bookingPackage.pricing.basePrice;
        let resourcePricingAmount = 0;
        let subtotal = 0;

        if (bookingPackage.category === 'rooms_only') {
            const roomResource = bookingPackage.includes.resources[0].resource;
            resourcePricingAmount = roomResource.basePrice * roomQuantity * numberOfDays;
            subtotal = resourcePricingAmount;
            packageBasePrice = 0;
        } else {
            subtotal = packageBasePrice * numberOfDays;
        }

        const gstPercentage = bookingPackage.pricing.gstPercentage || 18;
        const gstAmount = Math.round((subtotal * gstPercentage) / 100);
        const finalAmount = subtotal + gstAmount;

        // ==================== CREATE RAZORPAY ORDER ====================
    
        const razorpayOrder = await razorpay.orders.create({
            amount: finalAmount * 100, // Razorpay expects paise
            currency: 'INR',
            receipt: `booking_${Date.now()}`,
            notes: {
                packageId: packageId,
                packageName: bookingPackage.name,
                checkInDate: checkIn.format('DD-MM-YYYY'),
                checkOutDate: checkOut.format('DD-MM-YYYY')
            }
        });

        // ==================== CREATE PENDING BOOKING ====================

        const booking = await Booking.create({
            userId: req.user._id,
            packageId: packageId,
            category: bookingPackage.category,
            resources: resourcesToBook,
            checkInDate: checkInDate_obj,
            checkOutDate: checkOutDate_obj,
            numberOfDays,
            numberOfGuests: numberOfGuests || null,
            guestDetails: {
                fullName: guestDetails.fullName,
                phoneNumber: guestDetails.phoneNumber,
                email: guestDetails.email,
                alternatePhone: guestDetails.alternatePhone || null,
                address: guestDetails.address || null,
                idProofType: guestDetails.idProofType || null,
                idProofNumber: guestDetails.idProofNumber || null
            },
            specialRequests: specialRequests || null,
            pricing: {
                packageBasePrice,
                resourcePricing: resourcePricingAmount,
                subtotal,
                gst: {
                    percentage: gstPercentage,
                    amount: gstAmount
                },
                finalAmount,
                paidAmount: 0,
                balanceAmount: finalAmount
            },
            payment: {
                orderId: razorpayOrder.id,
                status: 'pending'
            },
            status: 'pending'
        });

        // ==================== RETURN ORDER DETAILS ====================

        return res.status(201).json({
            success: true,
            message: 'Order created successfully. Please complete payment.',
            booking: {
                bookingId: booking._id,
                bookingReferenceId: booking.bookingReferenceId,
                status: booking.status
            },
            razorpay: {
                orderId: razorpayOrder.id,
                amount: finalAmount,
                currency: 'INR',
                key: process.env.RAZORPAY_API_KEY
            },
            package: {
                name: bookingPackage.name,
                category: bookingPackage.category
            },
            dates: {
                checkInDate: checkIn.format('DD-MM-YYYY'),
                checkOutDate: checkOut.format('DD-MM-YYYY'),
                numberOfDays
            }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
})

/**
 * @route   POST /api/bookings/verify-payment
 * @desc    Verify Razorpay payment and confirm booking
 * @access  Private (authenticated users)
 * @body    {
 *            bookingId: ObjectId,
 *            razorpay_order_id: String,
 *            razorpay_payment_id: String,
 *            razorpay_signature: String
 *          }
 */

router.post('/verify-payment', protectRoute, async (req, res) => {
    try {
        const {
            bookingId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Validation
        if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all payment details'
            });
        }

        // Find booking
        const booking = await Booking.findById(bookingId).populate('packageId');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Verify user owns this booking
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        // Check if payment already verified
        if (booking.payment.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment already verified'
            });
        }

        // ==================== VERIFY SIGNATURE ====================

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            // Invalid signature - mark as failed
            booking.payment.status = 'failed';
            booking.status = 'cancelled';
            await booking.save();

            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature. Payment verification failed.'
            });
        }

        // ==================== UPDATE BOOKING ====================

        booking.payment.paymentId = razorpay_payment_id;
        booking.payment.signature = razorpay_signature;
        booking.payment.status = 'paid';
        booking.payment.paidAt = new Date();
        booking.pricing.paidAmount = booking.pricing.finalAmount;
        booking.pricing.balanceAmount = 0;
        booking.status = 'confirmed';

        await booking.save();

        // Update package booking count
        if (booking.packageId) {
            await Package.findByIdAndUpdate(
                booking.packageId._id,
                { $inc: { bookingCount: 1 } }
            );
        }

        // ==================== RETURN SUCCESS ====================

        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully. Booking confirmed!',
            booking: {
                bookingId: booking._id,
                bookingReferenceId: booking.bookingReferenceId,
                status: booking.status,
                checkInDate: dayjs(booking.checkInDate).format('DD-MM-YYYY'),
                checkOutDate: dayjs(booking.checkOutDate).format('DD-MM-YYYY'),
                totalAmount: booking.pricing.finalAmount
            }
        });


    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }

})

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get all bookings of logged-in user
 * @access  Private (authenticated users)
 * @query   status (optional) - Filter by status
 */


router.get('/my-bookings', protectRoute, async (req, res) => {

    try {
        const { status } = req.query;

        const filter = { userId: req.user._id };

        if (status) {
            filter.status = status;
        }

        const bookings = await Booking.find(filter)
            .populate('packageId', 'name category images')
            .populate('resources.resource', 'name facilityType')
            .sort({ createdAt: -1 })
            .select('-payment.signature -__v');

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
            message: 'Bookings fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
})

/**
 * @route   GET /api/bookings/:bookingId
 * @desc    Get single booking details
 * @access  Private (authenticated users - own bookings or admin)
 */
router.get('/:bookingId', protectRoute, async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }
        
        const booking = await Booking.findById(bookingId)
            .populate('packageId')
            .populate('resources.resource')
            .select('-payment.signature -__v');
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Check authorization (user owns booking or is admin)
        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: booking,
            message: 'Booking fetched successfully'
        });
        
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/bookings/:bookingId/cancel
 * @desc    User cancels their booking
 * @access  Private (authenticated users)
 * @body    { reason: String }
 */

router.post('/:bookingId/cancel', protectRoute, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        // Verify ownership
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        
        // Check if already cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking already cancelled'
            });
        }
        
        // Check if already checked in or checked out
        if (['checked_in', 'checked_out'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel booking after check-in'
            });
        }

        // Update booking
        booking.status = 'cancelled';
        booking.cancellation = {
            cancelledBy: 'user',
            cancelledAt: new Date(),
            reason: reason || 'Cancelled by user',
            refundAmount: 0, // Admin will process refund
            refundStatus: 'pending'
        };

        await booking.save();
        
        return res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully. Refund will be processed by admin.',
            data: booking
        });


    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        });
    }
})

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/bookings/admin/all
 * @desc    Get all bookings (admin)
 * @access  Admin only
 * @query   status, category, startDate, endDate
 */

router.get('/admin/all', protectRoute, async (req, res) => {
    try {
         // TODO: Add isAdmin middleware when implemented
        
         const { status, category, startDate, endDate } = req.query;
        
         const filter = {};
         
         if (status) filter.status = status;
         if (category) filter.category = category;
         if (startDate || endDate) {
             filter.checkInDate = {};
             if (startDate) filter.checkInDate.$gte = new Date(startDate);
             if (endDate) filter.checkInDate.$lte = new Date(endDate);
         }

         const bookings = await Booking.find(filter)
            .populate('userId', 'fullName phoneNumber email')
            .populate('packageId', 'name category')
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
            message: 'All bookings fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
})

/**
 * @route   GET /api/bookings/admin/upcoming
 * @desc    Get upcoming check-ins (next 7 days)
 * @access  Admin only
 */
router.get('/admin/upcoming', protectRoute, async (req, res) => {
    try {
        const today = dayjs.utc().startOf('day').toDate();
        const nextWeek = dayjs.utc().add(7, 'day').endOf('day').toDate();
        
        const upcomingBookings = await Booking.find({
            checkInDate: { $gte: today, $lte: nextWeek },
            status: 'confirmed'
        })
            .populate('userId', 'fullName phoneNumber')
            .populate('packageId', 'name')
            .sort({ checkInDate: 1 });
        
        return res.status(200).json({
            success: true,
            count: upcomingBookings.length,
            data: upcomingBookings,
            message: 'Upcoming bookings fetched successfully'
        });
        
    } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming bookings',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/bookings/admin/stats
 * @desc    Get booking statistics
 * @access  Admin only
 */
router.get('/admin/stats', protectRoute, async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
        
        const totalRevenue = await Booking.aggregate([
            { $match: { status: { $in: ['confirmed', 'checked_in', 'checked_out'] } } },
            { $group: { _id: null, total: { $sum: '$pricing.finalAmount' } } }
        ]);
        
        const categoryWiseBookings = await Booking.aggregate([
            { $match: { status: { $in: ['confirmed', 'checked_in', 'checked_out'] } } },
            { $group: { _id: '$category', count: { $sum: 1 }, revenue: { $sum: '$pricing.finalAmount' } } }
        ]);
        
        return res.status(200).json({
            success: true,
            data: {
                totalBookings,
                confirmedBookings,
                pendingBookings,
                cancelledBookings,
                totalRevenue: totalRevenue[0]?.total || 0,
                categoryWiseBookings
            },
            message: 'Statistics fetched successfully'
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/bookings/admin/:bookingId/cancel
 * @desc    Admin cancels a booking with refund details
 * @access  Admin only
 * @body    { reason, refundAmount, refundStatus }
 */
router.post('/admin/:bookingId/cancel', protectRoute, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason, refundAmount, refundStatus } = req.body;
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking already cancelled'
            });
        }
        
        booking.status = 'cancelled';
        booking.cancellation = {
            cancelledBy: 'admin',
            cancelledAt: new Date(),
            reason: reason || 'Cancelled by admin',
            refundAmount: refundAmount || 0,
            refundStatus: refundStatus || 'pending'
        };
        
        await booking.save();
        
        return res.status(200).json({
            success: true,
            message: 'Booking cancelled by admin',
            data: booking
        });
        
    } catch (error) {
        console.error('Error cancelling booking (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        });
    }
});

/**
 * @route   PATCH /api/bookings/admin/:bookingId/check-in
 * @desc    Mark booking as checked in
 * @access  Admin only
 */
router.patch('/admin/:bookingId/check-in', protectRoute, async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        if (booking.status !== 'confirmed') {
            return res.status(400).json({
                success: false,
                message: 'Only confirmed bookings can be checked in'
            });
        }
        
        booking.status = 'checked_in';
        await booking.save();
        
        return res.status(200).json({
            success: true,
            message: 'Guest checked in successfully',
            data: booking
        });
        
    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({
            success: false,
            message: 'Error during check-in',
            error: error.message
        });
    }
});

/**
 * @route   PATCH /api/bookings/admin/:bookingId/check-out
 * @desc    Mark booking as checked out
 * @access  Admin only
 */
router.patch('/admin/:bookingId/check-out', protectRoute, async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        if (booking.status !== 'checked_in') {
            return res.status(400).json({
                success: false,
                message: 'Only checked-in bookings can be checked out'
            });
        }
        
        booking.status = 'checked_out';
        await booking.save();
        
        return res.status(200).json({
            success: true,
            message: 'Guest checked out successfully',
            data: booking
        });
        
    } catch (error) {
        console.error('Error checking out:', error);
        res.status(500).json({
            success: false,
            message: 'Error during check-out',
            error: error.message
        });
    }
});

export default router;