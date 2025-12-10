import express from 'express';
import mongoose from 'mongoose';
import Package from '../models/Package.js';
import Resource from '../models/Resource.js';
import protectRoute from '../middleware/auth.middleware.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);
import Booking from '../models/Booking.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
/**
 * @route   GET /api/packages
 * @desc    Get all active packages
 * @access  Public (authenticated users)
 * @query   category (optional) - Filter by category (rooms_only, function_hall, full_venue, etc.)
 */

router.get('/', protectRoute, async (req, res) => {
    try {
        const { category } = req.query;

        const filter = { isActive: true };

        if (category) {
            filter.category = category;
        }

        const packages = await Package.find(filter)
            .populate('includes.resources.resource', 'name facilityType category basePrice capacity')
            .select('-__v')
            .sort({ displayOrder: 1, name: 1 });

        return res.status(200).json({
            success: true,
            data: packages,
            message: 'Packages fetched successfully',
            count: packages.length
        });

    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching packages',
            error: error.message
        });
    }
})

/**
 * @route   GET /api/packages/popular/list
 * @desc    Get popular/featured packages
 * @access  Public (authenticated users)
 */

router.get('/popular/list', protectRoute, async (req, res) => {
    try {
        // Get packages with highest bookingCount or marked as featured
        const packages = await Package.find({ isActive: true })
            .populate('includes.resources.resource', 'name facilityType category basePrice capacity images')
            .select('-__v')
            .sort({ bookingCount: -1, displayOrder: 1 })
            .limit(5);

        return res.status(200).json({
            success: true,
            data: packages,
            message: 'Popular packages fetched successfully',
            count: packages.length
        });

    } catch (error) {
        console.error('Error fetching popular packages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching popular packages',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/packages/category/:category
 * @desc    Get packages by category
 * @access  Public (authenticated users)
 * @params  category - one of: rooms_only, rooms_dining, function_hall_only, function_hall_dining, mini_hall, full_venue
 */

router.get('/category/:category', protectRoute, async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = [
            'full_venue',              // (i) Full Bhavan Booking
            'function_hall_dining',    // (ii) Function Hall + Dining
            'rooms_dining_mini_hall',  // (iii) All Rooms + Dining + Mini Hall
            'rooms_mini_hall',         // (iv) All Rooms + Mini Hall
            'function_hall_only',      // (v) Function Hall only
            'mini_hall',               // (vi) Mini Hall only
            'rooms_only'               // (vii) Individual rooms
        ];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        const packages = await Package.find({
            category: category,
            isActive: true
        })
            .populate('includes.resources.resource', 'name facilityType category basePrice capacity')
            .select('-__v')
            .sort({ displayOrder: 1, name: 1 });

        return res.status(200).json({
            success: true,
            data: packages,
            message: 'Packages fetched successfully',
            count: packages.length
        });

    } catch (error) {
        console.error('Error fetching packages by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching packages by category',
            error: error.message
        });
    }
})

// ==================== ADMIN ROUTES ====================
// Note: Add isAdmin middleware later when implemented

/**
 * @route   GET /api/packages/admin/all
 * @desc    Get all packages (including inactive) for admin panel
 * @access  Admin only (currently just protected, add isAdmin later)
 */

router.get('/admin/all', protectRoute, async (req, res) => {
    try {

        const packages = await Package.find({}).populate('includes.resources.resource', 'name facilityType category').select('-__v').sort({ category: 1, displayOrder: 1, createdAt: -1 });

        const groupedByCategory = packages.reduce((acc, pkg) => {
            const category = pkg.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(pkg);
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            totalPackages: packages.length,
            activeCount: packages.filter(p => p.isActive).length,
            inactiveCount: packages.filter(p => !p.isActive).length,
            data: packages,
            groupedByCategory
        });

    } catch (error) {
        console.error('Error fetching all packages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching packages',
            error: error.message
        });
    }
})


/**
 * @route   GET /api/packages/:id
 * @desc    Get single package by ID
 * @access  Public (authenticated users)
 */

router.get('/:id', protectRoute, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package ID'
            });
        }

        const pkg = await Package.findById(id)
            .populate('includes.resources.resource', 'name facilityType category basePrice capacity amenities images')
            .select('-__v');

        if (!pkg) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        // Only return active packages to non-admin users
        if (!pkg.isActive && req.user.role !== 'admin') {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: pkg,
            message: 'Package fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching package',
            error: error.message
        });
    }
})

/**
 * @route   PUT /api/packages/:id
 * @desc    Update package
 * @access  Admin only (currently just protected, add isAdmin later)
 * @body    { fields to update }
 * @note    Be careful updating resources - affects existing bookings
 */

router.put('/:id', protectRoute, async (req, res) => {

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package ID'
            });
        }

        // Find package
        const pkg = await Package.findById(id);
        
        if (!pkg) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        // Fields that can be updated
        const allowedUpdates = [
            'name',
            'shortDescription',
            'description',
            'images',
            'pricing',
            'bookingRules',
            'termsAndConditions',
            'displayOrder',
            'isActive'
        ];
        
        // Fields that should be carefully updated (warn in future)
        const sensitiveFields = ['category', 'includes'];
        
        // Check if sensitive fields are being updated
        const requestedUpdates = Object.keys(req.body);
        const hasSensitiveUpdate = requestedUpdates.some(field => sensitiveFields.includes(field));
        
        if (hasSensitiveUpdate) {
            // Check if package has active bookings
            const activeBookings = await Booking.countDocuments({
                packageId: id,
                status: { $in: ['confirmed', 'checked_in'] }
            });
            
            if (activeBookings > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot update ${sensitiveFields.join(', ')} as package has ${activeBookings} active booking(s). This would affect existing bookings.`
                });
            }
        }

         // Validate resource IDs if includes.resources is being updated
         if (req.body.includes && req.body.includes.resources) {
            for (const item of req.body.includes.resources) {
                if (item.resource) {
                    const resource = await Resource.findById(item.resource);
                    if (!resource) {
                        return res.status(404).json({
                            success: false,
                            message: `Resource not found: ${item.resource}`
                        });
                    }
                }
            }
        }

        // Apply updates
        requestedUpdates.forEach(field => {
            if (allowedUpdates.includes(field) || sensitiveFields.includes(field)) {
                pkg[field] = req.body[field];
            }
        });
        
        // Save updated package
        await pkg.save();
        
        // Populate resources for response
        await pkg.populate('includes.resources.resource', 'name facilityType category basePrice capacity');
        
        return res.status(200).json({
            success: true,
            message: 'Package updated successfully',
            data: pkg
        });

    } catch (error) {
        console.error('Error updating package:', error);
        
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
            message: 'Error updating package',
            error: error.message
        });
    }
})

/**
 * @route   DELETE /api/packages/:id
 * @desc    Deactivate package (soft delete)
 * @access  Admin only (currently just protected, add isAdmin later)
 * @note    Won't delete if there are active bookings
 */

router.delete('/:id', protectRoute, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package ID'
            });
        }
        
        // Find package
        const pkg = await Package.findById(id);
        
        if (!pkg) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        // Check if package has active bookings
        const activeBookings = await Booking.find({
            packageId: id,
            status: { $in: ['confirmed', 'pending', 'checked_in'] },
            checkOutDate: { $gte: new Date() }
        });

        if (activeBookings.length > 0) {
            // Format booking details for admin
            const bookingDetails = activeBookings.map(booking => ({
                bookingId: booking._id,
                bookingReferenceId: booking.bookingReferenceId,
                customerName: booking.guestDetails.fullName,
                customerPhone: booking.guestDetails.phoneNumber,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                status: booking.status,
                totalPrice: booking.pricing?.finalAmount || 0
            }));
            
            return res.status(400).json({
                success: false,
                message: `Cannot deactivate package. Please cancel the active bookings first.`,
                activeBookingsCount: activeBookings.length,
                activeBookings: bookingDetails,
                instruction: 'Go to Bookings > Cancel each booking > Then retry deleting this package'
            });
        }

        // Soft delete - just set isActive to false
        pkg.isActive = false;
        await pkg.save();
        
        return res.status(200).json({
            success: true,
            message: 'Package deactivated successfully',
            data: pkg
        });


    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({
            success: false,
            message: 'Error deactivating package',
            error: error.message
        });
    }
})

/**
 * @route   POST /api/packages/:id/calculate-price
 * @desc    Calculate total price for a package based on dates (and room quantity for "rooms_only")
 * @access  Public (authenticated users)
 * @body    {
 *            checkInDate: "DD-MM-YYYY",
 *            checkOutDate: "DD-MM-YYYY",
 *            roomQuantity: 2 (only for "rooms_only" category),
 *            numberOfGuests: 10 (optional, for reference only - not used in calculations)
 *          }
 * @returns { breakdown, totalAmount }
 */
router.post('/:id/calculate-price', protectRoute, async (req, res) => {
    try {
        const { id } = req.params;
        const { checkInDate, checkOutDate, roomQuantity, numberOfGuests } = req.body;
        
        // ==================== VALIDATION ====================
        
        // Validate package ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package ID'
            });
        }
        
        // Find package and populate resources
        const bookingPackage = await Package.findById(id)
            .populate('includes.resources.resource', 'name facilityType category basePrice capacity totalUnits');
        
        if (!bookingPackage) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }
        
        if (!bookingPackage.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Package is not active'
            });
        }
        
        // Validate dates are provided
        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide checkInDate and checkOutDate in DD-MM-YYYY format'
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
        
        // Calculate number of days
        const numberOfDays = checkOut.diff(checkIn, 'day');
        
        // ==================== VALIDATE BOOKING RULES ====================
        
        // Check min/max days
        if (numberOfDays < bookingPackage.bookingRules.minDays) {
            return res.status(400).json({
                success: false,
                message: `${bookingPackage.name} requires minimum ${bookingPackage.bookingRules.minDays} day(s) booking. You requested ${numberOfDays} day(s).`
            });
        }
        
        if (numberOfDays > bookingPackage.bookingRules.maxDays) {
            return res.status(400).json({
                success: false,
                message: `${bookingPackage.name} allows maximum ${bookingPackage.bookingRules.maxDays} day(s) booking. You requested ${numberOfDays} day(s).`
            });
        }
        
        // Check advance booking limit
        const daysUntilCheckIn = checkIn.diff(today, 'day');
        if (daysUntilCheckIn > bookingPackage.bookingRules.advanceBookingDays) {
            return res.status(400).json({
                success: false,
                message: `${bookingPackage.name} can only be booked up to ${bookingPackage.bookingRules.advanceBookingDays} days in advance. You tried to book ${daysUntilCheckIn} days in advance.`
            });
        }
        
        // ==================== CALCULATE PRICING ====================
        
        let subtotal = 0;
        let pricingDetails = {};
        
        // Check if this is "Rooms Only" category (variable quantity)
        if (bookingPackage.category === 'rooms_only') {
            // For individual room bookings, quantity is required
            if (!roomQuantity || roomQuantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide roomQuantity (number of rooms to book)'
                });
            }
            
            // Find the room resource in the package
            const roomResource = bookingPackage.includes.resources.find(
                r => r.resource.facilityType === 'guest_room'
            );
            
            if (!roomResource) {
                return res.status(500).json({
                    success: false,
                    message: 'Package configuration error: No room resource found'
                });
            }
            
            // Validate quantity doesn't exceed available rooms
            if (roomQuantity > roomResource.resource.totalUnits) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${roomResource.resource.totalUnits} rooms available. You requested ${roomQuantity} rooms.`
                });
            }
            
            // Validate against min/max quantity (if set)
            if (roomResource.minQuantity && roomQuantity < roomResource.minQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum ${roomResource.minQuantity} room(s) required`
                });
            }
            
            if (roomResource.maxQuantity && roomQuantity > roomResource.maxQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Maximum ${roomResource.maxQuantity} room(s) allowed`
                });
            }
            
            // Calculate: roomPrice × quantity × days
            const pricePerRoom = roomResource.resource.basePrice;
            subtotal = pricePerRoom * roomQuantity * numberOfDays;
            
            pricingDetails = {
                packageType: 'variable',
                pricePerRoom: pricePerRoom,
                numberOfRooms: roomQuantity,
                numberOfDays: numberOfDays,
                roomsSubtotal: subtotal
            };
            
        } else {
            // For all other packages: Fixed price per day
            // Calculate: basePrice × days
            subtotal = bookingPackage.pricing.basePrice * numberOfDays;
            
            pricingDetails = {
                packageType: 'fixed',
                pricePerDay: bookingPackage.pricing.basePrice,
                numberOfDays: numberOfDays,
                baseSubtotal: subtotal
            };
        }
        
        // Calculate GST
        const gstPercentage = bookingPackage.pricing.gstPercentage || 18;
        const gstAmount = Math.round((subtotal * gstPercentage) / 100);
        
        // Calculate final amount
        const finalAmount = subtotal + gstAmount;
        
        // ==================== BUILD RESOURCE LIST ====================
        
        const includedResources = bookingPackage.includes.resources.map(item => ({
            resourceId: item.resource._id,
            resourceName: item.resource.name,
            facilityType: item.resource.facilityType,
            category: item.resource.category,
            quantity: bookingPackage.category === 'rooms_only' ? roomQuantity : item.quantity,
            capacity: item.resource.capacity
        }));
        
        // Calculate total capacity (for informational purposes)
        let totalCapacity = 0;
        if (bookingPackage.category === 'rooms_only') {
            const roomResource = bookingPackage.includes.resources.find(r => r.resource.facilityType === 'guest_room');
            totalCapacity = roomResource ? roomResource.resource.capacity * roomQuantity : 0;
        } else {
            totalCapacity = bookingPackage.includes.resources.reduce((sum, item) => {
                return sum + (item.resource.capacity * item.quantity);
            }, 0);
        }
        
        // ==================== RETURN PRICING BREAKDOWN ====================
        
        return res.status(200).json({
            success: true,
            package: {
                id: bookingPackage._id,
                name: bookingPackage.name,
                category: bookingPackage.category,
                description: bookingPackage.shortDescription || bookingPackage.description
            },
            dates: {
                checkInDate: checkIn.format('DD-MM-YYYY'),
                checkOutDate: checkOut.format('DD-MM-YYYY'),
                numberOfDays
            },
            pricing: {
                ...pricingDetails,
                subtotal,
                gst: {
                    percentage: gstPercentage,
                    amount: gstAmount
                },
                finalAmount
            },
            includedResources,
            totalCapacity,  // For reference only
            numberOfGuests: numberOfGuests || null,  // Store for reference but not used in calculations
            includes: {
                dining: bookingPackage.includes.dining || false,
                breakfast: bookingPackage.includes.breakfast || false,
                lunch: bookingPackage.includes.lunch || false,
                dinner: bookingPackage.includes.dinner || false
            },
            bookingRules: {
                minDays: bookingPackage.bookingRules.minDays,
                maxDays: bookingPackage.bookingRules.maxDays,
                cancellationPolicy: bookingPackage.bookingRules.cancellationPolicy
            },
            message: 'Price calculated successfully'
        });
        
    } catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating price',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/packages
 * @desc    Create new package
 * @access  Admin only (currently just protected, add isAdmin later)
 * @body    { name, category, description, includes, pricing, bookingRules, ... }
 */


router.post('/', protectRoute, async (req, res) => {
    try {
        const {
            name,
            shortDescription,
            description,
            category,
            includes,
            pricing,
            bookingRules,
            termsAndConditions,
            displayOrder,
            images
        } = req.body;
        // ==================== VALIDATION ====================

        // Required fields
        if (!name || !category || !description || !pricing) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, category, description, pricing'
            });
        }

        // Validate category
        const validCategories = [
            'full_venue',              // (i) Full Bhavan Booking
            'function_hall_dining',    // (ii) Function Hall + Dining
            'rooms_dining_mini_hall',  // (iii) All Rooms + Dining + Mini Hall
            'rooms_mini_hall',         // (iv) All Rooms + Mini Hall
            'function_hall_only',      // (v) Function Hall only
            'mini_hall',               // (vi) Mini Hall only
            'rooms_only'               // (vii) Individual rooms
        ];

        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        // Validate includes.resources
        if (!includes || !includes.resources || !Array.isArray(includes.resources) || includes.resources.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Package must include at least one resource'
            });
        }

        // Validate that all resource IDs exist and are active
        for (const item of includes.resources) {
            if (!item.resource || !item.quantity || item.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Each resource must have a valid resource ID and quantity >= 1'
                });
            }

            const resource = await Resource.findById(item.resource);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: `Resource not found: ${item.resource}`
                });
            }

            if (!resource.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add inactive resource: ${resource.name}`
                });
            }
        }

        // Validate pricing
        if (pricing.basePrice === undefined || pricing.basePrice === null || pricing.basePrice < 0) {
            return res.status(400).json({
                success: false,
                message: 'Base price must be 0 or greater'
            });
        }

        // Check for duplicate package name
        const existingPackage = await Package.findOne({ name });
        if (existingPackage) {
            return res.status(400).json({
                success: false,
                message: 'Package with this name already exists'
            });
        }

        // ==================== CREATE PACKAGE ====================

        const pkg = await Package.create({
            name,
            shortDescription: shortDescription || description.substring(0, 100),
            description,
            category,
            includes: {
                resources: includes.resources.map(r => ({
                    resource: r.resource,
                    quantity: r.quantity,
                    isRequired: r.isRequired !== undefined ? r.isRequired : true,
                    isFlexible: r.isFlexible || false,
                    minQuantity: r.minQuantity || r.quantity,
                    maxQuantity: r.maxQuantity || r.quantity
                })),
                dining: includes.dining || false,
                breakfast: includes.breakfast || false,
                lunch: includes.lunch || false,
                dinner: includes.dinner || false
            },
            pricing: {
                basePrice: pricing.basePrice,
                gstPercentage: pricing.gstPercentage || 18
            },
            bookingRules: {
                minDays: bookingRules?.minDays || 1,
                maxDays: bookingRules?.maxDays || 7,
                advanceBookingDays: bookingRules?.advanceBookingDays || 30,
                cancellationPolicy: bookingRules?.cancellationPolicy || 'No refund within 7 days of check-in'
            },
            termsAndConditions: termsAndConditions || [],
            images: images || [],
            displayOrder: displayOrder || 0,
            bookingCount: 0,
            isActive: true
        });

        // Populate resources for response
        await pkg.populate('includes.resources.resource', 'name facilityType category basePrice capacity');

        return res.status(201).json({
            success: true,
            message: 'Package created successfully',
            data: pkg
        });

    } catch (error) {
        console.error('Error creating package:', error);

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
            message: 'Error creating package',
            error: error.message
        });
    }
})



export default router;