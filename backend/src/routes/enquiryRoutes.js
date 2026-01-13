import express from 'express';
import Enquiry from '../models/Enquiry.js';
import Package from '../models/Package.js';

const router = express.Router();

/**
 * @route   POST /api/enquiries
 * @desc    Submit a new enquiry
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const {
            packageId,
            packageName,
            fullName,
            phoneNumber,
            email,
            visitingFrom,
            checkInDate,
            checkOutDate,
            numberOfNights
        } = req.body;

        // Validation
        if (!packageId || !packageName || !fullName || !phoneNumber || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: packageId, packageName, fullName, phoneNumber, checkInDate, checkOutDate'
            });
        }

        // Verify package exists
        const packageExists = await Package.findById(packageId);
        if (!packageExists) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        // Create enquiry
        const enquiry = await Enquiry.create({
            packageId,
            packageName,
            fullName,
            phoneNumber,
            email: email || null,
            visitingFrom: visitingFrom || null,
            checkInDate,
            checkOutDate,
            numberOfNights: numberOfNights || 1,
            status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Enquiry submitted successfully',
            data: enquiry
        });

    } catch (error) {
        console.error('Error submitting enquiry:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting enquiry',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/enquiries
 * @desc    Get all enquiries (with optional filters)
 * @access  Public (should be protected in production)
 * @query   status - Filter by status (pending, contacted, converted, rejected)
 * @query   packageId - Filter by package
 * @query   limit - Number of results (default: 50)
 * @query   page - Page number (default: 1)
 */
router.get('/', async (req, res) => {
    try {
        const { status, packageId, limit = 50, page = 1 } = req.query;

        // Build filter
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (packageId) {
            filter.packageId = packageId;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Fetch enquiries
        const enquiries = await Enquiry.find(filter)
            .populate('packageId', 'name category pricing')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        // Count total
        const total = await Enquiry.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: enquiries,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            message: 'Enquiries fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching enquiries:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching enquiries',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/enquiries/:id
 * @desc    Get single enquiry by ID
 * @access  Public (should be protected in production)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const enquiry = await Enquiry.findById(id)
            .populate('packageId', 'name category description pricing images');

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: enquiry,
            message: 'Enquiry fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching enquiry:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching enquiry',
            error: error.message
        });
    }
});

/**
 * @route   PATCH /api/enquiries/:id/status
 * @desc    Update enquiry status
 * @access  Admin only (currently public)
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        // Validate status
        const validStatuses = ['pending', 'contacted', 'converted', 'rejected'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const enquiry = await Enquiry.findByIdAndUpdate(
            id,
            { 
                status,
                ...(notes && { notes })
            },
            { new: true, runValidators: true }
        );

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: enquiry,
            message: 'Enquiry status updated successfully'
        });

    } catch (error) {
        console.error('Error updating enquiry status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating enquiry status',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/enquiries/:id
 * @desc    Delete an enquiry
 * @access  Admin only (currently public)
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const enquiry = await Enquiry.findByIdAndDelete(id);

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Enquiry deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting enquiry:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting enquiry',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/enquiries/stats/summary
 * @desc    Get enquiry statistics
 * @access  Admin only (currently public)
 */
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await Enquiry.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Enquiry.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await Enquiry.countDocuments({
            createdAt: { $gte: today }
        });

        return res.status(200).json({
            success: true,
            data: {
                total,
                today: todayCount,
                byStatus: stats.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {})
            },
            message: 'Statistics fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

export default router;

