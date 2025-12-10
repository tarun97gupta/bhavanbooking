import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    // ==================== REFERENCE IDs ====================
    bookingReferenceId: {
        type: String,
        unique: true,
        // Auto-generated: BHV-XXXXXX
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },

    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: [true, 'Package ID is required'],
        index: true
    },

    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'full_venue',              // (i) Full Bhavan Booking
            'function_hall_dining',    // (ii) Function Hall + Dining
            'rooms_dining_mini_hall',  // (iii) All Rooms + Dining + Mini Hall
            'rooms_mini_hall',         // (iv) All Rooms + Mini Hall
            'function_hall_only',      // (v) Function Hall only
            'mini_hall',               // (vi) Mini Hall only
            'rooms_only'               // (vii) Individual rooms
        ],
        index: true,
        // Denormalized from Package for faster queries
    },

    // ==================== BOOKED RESOURCES ====================
    // Stores which resources are included in this booking
    // For availability checking and blocking
    resources: [{
        resource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource',
            required: true
        },
        facilityType: {
            type: String,
            enum: ['guest_room', 'function_hall', 'dining_hall', 'mini_hall'],
            required: true,
            // Denormalized for faster queries
        },
        name: {
            type: String,
            required: true,
            // Denormalized resource name (e.g., "Deluxe Room", "Function Hall")
        },
        category: {
            type: String,
            // For guest rooms: "Deluxe", "Standard"
            // For others: null
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
            // Number of units booked
        },
        capacity: {
            type: Number,
            // Total capacity of this resource allocation
            // e.g., 2 Deluxe rooms × 4 capacity = 8
        },
        _id: false
    }],

    // ==================== DATE INFORMATION ====================
    checkInDate: {
        type: Date,
        required: [true, 'Check-in date is required'],
        index: true
    },

    checkOutDate: {
        type: Date,
        required: [true, 'Check-out date is required'],
        index: true,
        validate: {
            validator: function (value) {
                return value > this.checkInDate;
            },
            message: 'Check-out date must be after check-in date'
        }
    },

    numberOfDays: {
        type: Number,
        required: true,
        min: 1
    },

    // ==================== GUEST INFORMATION ====================
    guestDetails: {
        fullName: {
            type: String,
            required: [true, 'Guest full name is required'],
            trim: true
        },
        phoneNumber: {
            type: String,
            required: [true, 'Guest phone number is required'],
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: [true, 'Guest email is required'],
        },
        alternatePhone: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        idProofType: {
            type: String,
            // e.g., "Aadhaar", "Passport", "Driving License"
        },
        idProofNumber: {
            type: String,
            trim: true
        }
    },

    // ==================== ADDITIONAL INFO ====================
    numberOfGuests: {
        type: Number,
        min: 1,
        // Optional - for reference only, not used in calculations
    },

    specialRequests: {
        type: String,
        trim: true,
        // Any special requests from guest
    },

    // ==================== PRICING BREAKDOWN ====================
    pricing: {
        // Package base price (per day)
        packageBasePrice: {
            type: Number,
            required: true,
            // From Package.pricing.basePrice
            // For rooms_only, this is 0
        },

        // For rooms_only: resource pricing breakdown
        resourcePricing: {
            type: Number,
            default: 0,
            // Sum of (resource.basePrice × quantity × days)
            // Only used for rooms_only category
        },

        // Subtotal before GST
        subtotal: {
            type: Number,
            required: true,
            // For fixed packages: packageBasePrice × numberOfDays
            // For rooms_only: resourcePricing
        },

        // GST calculation
        gst: {
            percentage: {
                type: Number,
                default: 18,
                min: 0,
                max: 100
            },
            amount: {
                type: Number,
                required: true,
                // (subtotal × gst.percentage) / 100
            }
        },

        // Final amount (subtotal + GST)
        finalAmount: {
            type: Number,
            required: true,
            // subtotal + gst.amount
        },

        // Amount paid by customer
        paidAmount: {
            type: Number,
            default: 0
        },

        // Remaining balance
        balanceAmount: {
            type: Number,
            default: 0,
            // finalAmount - paidAmount
        }
    },

    // ==================== PAYMENT INFORMATION (RAZORPAY) ====================
    payment: {
        // Razorpay order ID (created before payment)
        orderId: {
            type: String,
            required: true,
            index: true
        },

        // Razorpay payment ID (received after successful payment)
        paymentId: {
            type: String,
            default: null
        },

        // Payment signature (for verification)
        signature: {
            type: String,
            default: null
        },

        // Payment method used
        paymentMethod: {
            type: String,
            enum: ['card', 'upi', 'netbanking', 'wallet', 'other'],
            default: null
        },

        // Payment status
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
            default: 'pending',
            index: true
        },

        // When payment was completed
        paidAt: {
            type: Date,
            default: null
        }
    },

    // ==================== BOOKING STATUS ====================
    status: {
        type: String,
        enum: [
            'pending',      // Payment not completed yet
            'confirmed',    // Payment successful, booking confirmed
            'checked_in',   // Guest has checked in
            'checked_out',  // Guest has checked out
            'cancelled',    // Booking cancelled
            'no_show'       // Guest didn't show up
        ],
        default: 'pending',
        index: true
    },

    // ==================== CANCELLATION ====================
    cancellation: {
        cancelledBy: {
            type: String,
            enum: ['user', 'admin'],
        },
        cancelledAt: {
            type: Date
        },
        reason: {
            type: String,
            trim: true
        },
        refundAmount: {
            type: Number,
            default: 0
        },
        refundStatus: {
            type: String,
            enum: ['pending', 'approved', 'processed', 'rejected']
        },
        refundProcessedAt: {
            type: Date
        }
    },

    // ==================== ADMIN NOTES ====================
    adminNotes: {
        type: String,
        trim: true,
        // Internal notes for admin use only
    }

}, { timestamps: true });

// ==================== INDEXES ====================
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ bookingReferenceId: 1 });
bookingSchema.index({ 'resources.resource': 1, checkInDate: 1, checkOutDate: 1, status: 1 });
bookingSchema.index({ category: 1, status: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ status: 1, checkInDate: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

// ==================== PRE-SAVE HOOK ====================
bookingSchema.pre('save', async function (next) {
    // Generate booking reference ID if new booking
    if (this.isNew && !this.bookingReferenceId) {
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.bookingReferenceId = `BHV-${randomStr}`;
    }

    // Auto-calculate balance amount
    if (this.pricing) {
        this.pricing.balanceAmount = this.pricing.finalAmount - this.pricing.paidAmount;
    }

    next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;