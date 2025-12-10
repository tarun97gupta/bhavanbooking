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

dayjs.extend(utc);

const router = express.Router();

//Initialize Razorpay client

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
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