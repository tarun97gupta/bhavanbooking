import express from 'express';
import Resource from '../models/Resource.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import protectRoute  from '../middleware/auth.middleware.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';


dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// These routes are accessible to all authenticated users

/**
 * @route   GET /api/resources
 * @desc    Get all active resources
 * @access  Public (authenticated users)
 * @query   facilityType (optional) - Filter by facility type
 * @query   category (optional) - Filter by category (for guest rooms)
 */
router.get('/', protectRoute, async (req, res) => {
    try {
        const { facilityType, category } = req.query;

        const filter = { isActive: true };

        if (facilityType) {
            filter.facilityType = facilityType;
        }
        if (category) {
            filter.category = category;
        }

        const resources = await Resource.find(filter).select('-__v').sort({
            facilityType: 1,
            name: 1,
            category: 1
        })
        return res.status(200).json({
            success: true,
            data: resources,
            message: 'Resources fetched successfully',
            count: resources.length
        })

    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resources',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/resources/facility/:facilityType
 * @desc    Get all resources of a specific facility type
 * @access  Public (authenticated users)
 * @params  facilityType - one of: guest_room, function_hall, dining_hall, mini_hall
 */
router.get('/facility/:facilityType', protectRoute, async (req, res) => {
    try {
        const { facilityType } = req.params;

        const validTypes = ['guest_room', 'function_hall', 'dining_hall', 'mini_hall'];
        if (!validTypes.includes(facilityType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid facility type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        const resources = await Resource.find({
            facilityType: facilityType,
            isActive: true
        }).select('-__v').sort({
            category: 1,
            basePrice: -1.
        })

        return res.status(200).json({
            success: true,
            data: resources,
            message: 'Resources fetched successfully',
            count: resources.length
        });
    } catch (error) {
        console.error('Error fetching resources by facility type:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resources',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/resources/guest-rooms
 * @desc    Get all guest rooms grouped by category
 * @access  Public (authenticated users)
 */
router.get('/guest-rooms', protectRoute, async (req, res) => {
    try {
        const guestRooms = await Resource.find({
            facilityType: 'guest_room',
            isActive: true
        }).select('-__v').sort({
            category: 1,
            basePrice: -1.
        })

        const groupedByCategory = guestRooms.reduce((acc, room) => {
            acc[room.category] = acc[room.category] || [];
            acc[room.category].push(room);
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            data: groupedByCategory,
            message: 'Guest rooms fetched successfully',
            count: guestRooms.length
        });
    } catch (error) {
        console.error('Error fetching guest rooms:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching guest rooms',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/resources/:id
 * @desc    Get single resource by ID
 * @access  Public (authenticated users)
 */
router.get('/:id', protectRoute, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }

        const resource = await Resource.findById(id).select('-__v');

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Only return active resources to non-admin users
        if (!resource.isActive && req.user.role !== 'admin') {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: resource,
            message: 'Resource fetched successfully'
        });


    } catch (error) {
        console.error('Error fetching resource:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resource',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/resources/check-availability
 * @desc    Check availability of specific resource for date range
 * @access  Public (authenticated users)
 * @body    { resourceId, checkInDate, checkOutDate, quantity }
 */
router.post('/check-availability', protectRoute, async (req, res) => {
    try {
        const { resources, checkInDate, checkOutDate } = req.body;

        // ==================== VALIDATION ====================

        // Validate resources array
        if (!resources || !Array.isArray(resources) || resources.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide resources array with at least one resource'
            });
        }

        // Validate dates are provided
        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide checkInDate and checkOutDate'
            });
        }

        // Parse dates using dayjs with UTC
        const checkIn = dayjs.utc(checkInDate, 'DD-MM-YYYY').startOf('day');
        const checkOut = dayjs.utc(checkOutDate, 'DD-MM-YYYY').startOf('day');

        // Validate date format
        if (!checkIn.isValid() || !checkOut.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use DD-MM-YYYY (e.g., 15-12-2025)'
            });
        }

        // Validate check-out is after check-in
        if (checkOut.isSameOrBefore(checkIn)) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date'
            });
        }

        // Check if check-in date is in the past
        const today = dayjs.utc().startOf('day');
        if (checkIn.isBefore(today)) {
            return res.status(400).json({
                success: false,
                message: 'Check-in date cannot be in the past'
            });
        }

        // ==================== CHECK AVAILABILITY FOR EACH RESOURCE ====================

        const availabilityResults = [];
        let allAvailable = true;

        for (const item of resources) {
            const { resourceId, quantity } = item;

            // Validate resource item
            if (!resourceId || !quantity || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Each resource must have resourceId and quantity >= 1'
                });
            }

            // Find resource in database
            const resource = await Resource.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: `Resource not found: ${resourceId}`
                });
            }

            // Check if resource is active
            if (!resource.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Resource is not active: ${resource.name}`
                });
            }

            // ==================== VALIDATE BOOKING RULES ====================

            // Calculate number of days
            const requestedDays = checkOut.diff(checkIn, 'day');

            // Check minimum booking days
            if (requestedDays < resource.minBookingDays) {
                return res.status(400).json({
                    success: false,
                    message: `${resource.name} requires minimum ${resource.minBookingDays} day(s) booking. You requested ${requestedDays} day(s).`
                });
            }

            // Check maximum booking days
            if (requestedDays > resource.maxBookingDays) {
                return res.status(400).json({
                    success: false,
                    message: `${resource.name} allows maximum ${resource.maxBookingDays} day(s) booking. You requested ${requestedDays} day(s).`
                });
            }

            // Check advance booking limit
            const daysUntilCheckIn = checkIn.diff(today, 'day');
            if (daysUntilCheckIn > resource.advanceBookingDays) {
                return res.status(400).json({
                    success: false,
                    message: `${resource.name} can only be booked up to ${resource.advanceBookingDays} days in advance. You tried to book ${daysUntilCheckIn} days in advance.`
                });
            }

            // ==================== FIND OVERLAPPING BOOKINGS ====================

            // Two bookings overlap if:
            // checkOutA > checkInB AND checkInA < checkOutB
            // Example:
            // Booking A: 15-17 Jan
            // Booking B: 16-18 Jan
            // These overlap because: 17 > 16 AND 15 < 18

            // Convert dayjs objects to Date objects for MongoDB query
            const checkInDate = checkIn.toDate();
            const checkOutDate = checkOut.toDate();

            const overlappingBookings = await Booking.find({
                'resources.resource': resourceId,
                status: { $in: ['confirmed', 'checked_in'] }, // Only count active bookings
                checkInDate: { $lt: checkOutDate },  // Booking starts before our check-out
                checkOutDate: { $gt: checkInDate }   // Booking ends after our check-in
            });

            // ==================== CALCULATE BOOKED UNITS ====================

            let bookedUnits = 0;

            // Loop through each overlapping booking
            overlappingBookings.forEach(booking => {
                // Loop through resources in each booking
                booking.resources.forEach(bookingResource => {
                    // If this booking includes our resource, add the quantity
                    if (bookingResource.resource.toString() === resourceId) {
                        bookedUnits += bookingResource.quantity;
                    }
                });
            });

            // ==================== CALCULATE AVAILABLE UNITS ====================

            const availableUnits = resource.totalUnits - bookedUnits;
            const isAvailable = availableUnits >= quantity;

            // If not available, set overall flag to false
            if (!isAvailable) {
                allAvailable = false;
            }

            // ==================== ADD TO RESULTS ====================

            availabilityResults.push({
                resourceId: resource._id,
                name: resource.name,
                facilityType: resource.facilityType,
                category: resource.category,
                requestedQuantity: quantity,
                totalUnits: resource.totalUnits,
                bookedUnits: bookedUnits,
                availableUnits: availableUnits,
                isAvailable: isAvailable,
                pricePerUnit: resource.basePrice,
                capacity: resource.capacity,
                amenities: resource.amenities,
                policies: resource.policies
            });
        }

        return res.status(200).json({
            success: true,
            available: allAvailable,
            checkInDate: checkIn.format('DD-MM-YYYY'),
            checkOutDate: checkOut.format('DD-MM-YYYY'),
            numberOfDays: checkOut.diff(checkIn, 'day'),
            results: availabilityResults
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking availability',
            error: error.message
        });
    }
});

// ==================== ADMIN ROUTES ====================
// These routes require admin privileges

/**
 * @route   POST /api/resources
 * @desc    Create new resource
 * @access  Admin only
 * @body    { name, description, facilityType, basePrice, capacity, totalUnits, ... }
 */
router.post('/', protectRoute, async (req, res) => {
    try {
        const {
            name,
            description,
            shortDescription,
            images,
            facilityType,
            category,
            basePrice,
            capacity,
            totalUnits,
            isExclusive,
            canBookAlone,
            minBookingDays,
            maxBookingDays,
            advanceBookingDays,
            amenities,
            policies
        } = req.body;

        // Validation
        if (!name || !description || !facilityType || !basePrice || !capacity || !totalUnits) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, description, facilityType, basePrice, capacity, totalUnits'
            });
        }

        // Validate facility type
        const validTypes = ['guest_room', 'function_hall', 'dining_hall', 'mini_hall'];
        if (!validTypes.includes(facilityType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid facility type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        // If facilityType is guest_room, category is required
        if (facilityType === 'guest_room' && !category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required for guest rooms'
            });
        }
        // Validate category if provided
        if (category) {
            const validCategories = ['Deluxe', 'Standard'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
                });
            }
        }

        // Check for duplicate resource name
        const existingResource = await Resource.findOne({ name });
        if (existingResource) {
            return res.status(400).json({
                success: false,
                message: 'Resource with this name already exists'
            });
        }

        const resource = await Resource.create({
            name,
            description,
            shortDescription: shortDescription || description.substring(0, 100),
            images: images || [],
            facilityType,
            category: facilityType === 'guest_room' ? category : undefined,
            basePrice,
            capacity,
            totalUnits,
            isExclusive: isExclusive || false,
            canBookAlone: canBookAlone !== undefined ? canBookAlone : true,
            minBookingDays: minBookingDays || 1,
            maxBookingDays: maxBookingDays || 7,
            advanceBookingDays: advanceBookingDays || 7,
            amenities: amenities || [],
            policies: policies || [],
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Resource created successfully',
            data: resource
        });

    } catch (error) {
        console.error('Error creating resource:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating resource',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/resources/:id
 * @desc    Update resource
 * @access  Admin only
 * @body    { fields to update }
 */
router.put('/:id', protectRoute, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }
        const resource = await Resource.findById(id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Fields that can be updated
        const allowedUpdates = [
            'name',
            'description',
            'shortDescription',
            'images',
            'basePrice',
            'capacity',
            'totalUnits',
            'isExclusive',
            'canBookAlone',
            'minBookingDays',
            'maxBookingDays',
            'advanceBookingDays',
            'amenities',
            'policies',
            'isActive'
        ];

        // Fields that CANNOT be updated (would affect existing bookings)
        const restrictedFields = ['facilityType', 'category'];

        const requestedUpdates = Object.keys(req.body);
        const hasRestrictedFields = requestedUpdates.some(update => restrictedFields.includes(update));
        if (hasRestrictedFields) {
            return res.status(400).json({
                success: false,
                message: `Cannot update ${restrictedFields.join(', ')} as it would affect existing bookings`
            });
        }
        requestedUpdates.forEach(field => {
            if (allowedUpdates.includes(field)) {
                resource[field] = req.body[field];
            }
        });

        // Save updated resource
        await resource.save();

        return res.status(200).json({
            success: true,
            message: 'Resource updated successfully',
            data: resource
        });

    } catch (error) {

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating resource',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/resources/:id
 * @desc    Deactivate resource (soft delete)
 * @access  Admin only
 */
router.delete('/:id', protectRoute, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }
        const resource = await Resource.findById(id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        const activeBookings = await Booking.find({
            'resources.resource': id,
            status: { $in: ['confirmed', 'checked_in'] },
            checkOutDate: { $gte: dayjs.utc().startOf('day').toDate() }
        })

        if (activeBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot deactivate resource. Please cancel the active bookings first.`,
                activeBookingsCount: activeBookings.length,
                activeBookings,
                instruction: 'Go to Bookings > Cancel each booking > Then retry deleting this resource'
            });
        }

        resource.isActive = false;
        await resource.save();

        return res.status(200).json({
            success: true,
            message: 'Resource deactivated successfully',
            data: resource
        });

    } catch (error) {
        console.error('Error deactivating resource:', error);
        res.status(500).json({
            success: false,
            message: 'Error deactivating resource',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/resources/admin/all
 * @desc    Get all resources (including inactive) for admin panel
 * @access  Admin only
 */
router.get('/admin/all', protectRoute, async (req, res) => {
    try {
        const resources = await Resource.find({}).select('-__v').sort({
            facilityType: 1,
            category: 1,
            createdAt: -1,
        })

        const groupedByFacilityType = resources.reduce((acc, resource) => {
            const type = resource.facilityType;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(resource);
            return acc;
        }, {})
        return res.status(200).json({
            success: true,
            totalResources: resources.length,
            activeCount: resources.filter(r => r.isActive).length,
            inactiveCount: resources.filter(r => !r.isActive).length,
            groupedByFacilityType,
            data: resources,
        })

    } catch (error) {
        console.error('Error fetching all resources:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resources',
            error: error.message
        });
    }
});

export default router;