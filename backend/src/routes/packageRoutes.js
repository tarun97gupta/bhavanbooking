import express from 'express';
import mongoose from 'mongoose';
import Package from '../models/Package.js';
import Resource from '../models/Resource.js';
import { protectRoute } from '../middleware/auth.middleware.js';

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
 * @route   GET /api/packages/category/:category
 * @desc    Get packages by category
 * @access  Public (authenticated users)
 * @params  category - one of: rooms_only, rooms_dining, function_hall_only, function_hall_dining, mini_hall, full_venue
 */

router.get('/category/:category', protectRoute, async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['rooms_only', 'rooms_dining', 'function_hall_only', 'function_hall_dining', 'mini_hall', 'full_venue'];

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

export default router;