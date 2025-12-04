import express from 'express';
import Resource from '../models/Resource.js';
import Booking from '../models/Booking.js';
import { protectRoute, isAdmin } from '../middleware/auth.middleware.js';

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
 * @params  facilityType - one of: guest_room, function_hall, dining_hall, mini_hall, full_venue
 */
router.get('/facility/:facilityType', protectRoute, async (req, res) => {
    try {
        const { facilityType } = req.params;

        const validTypes = ['guest_room', 'function_hall', 'dining_hall', 'mini_hall', 'full_venue'];
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
    // We'll implement this in Step 4
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
    // We'll implement this in Step 3
});

/**
 * @route   PUT /api/resources/:id
 * @desc    Update resource
 * @access  Admin only
 * @body    { fields to update }
 */
router.put('/:id', protectRoute, async (req, res) => {
    // We'll implement this in Step 3
});

/**
 * @route   DELETE /api/resources/:id
 * @desc    Deactivate resource (soft delete)
 * @access  Admin only
 */
router.delete('/:id', protectRoute, async (req, res) => {
    // We'll implement this in Step 3
});

/**
 * @route   GET /api/resources/admin/all
 * @desc    Get all resources (including inactive) for admin panel
 * @access  Admin only
 */
router.get('/admin/all', protectRoute, async (req, res) => {
    // We'll implement this in Step 3
});

export default router;