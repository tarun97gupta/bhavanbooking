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
            'full_bhavan',
            'function_dining',
            'function_only',
            'rooms_dining',
            'rooms_only',
            'mini_hall'
        ],
        index: true,
        // Denormalized from Package for faster queries
    },
    // ==================== BOOKED RESOURCES ====================
    // IMPORTANT: How resources array works for different packages:
    //
    // 1. rooms_only: 
    //    User selects specific rooms (e.g., 2 Deluxe + 1 Standard)
    //    resources = [
    //      { facilityType: "guest_room", category: "Deluxe", quantity: 2, ... },
    //      { facilityType: "guest_room", category: "Standard", quantity: 1, ... }
    //    ]
    //
    // 2. rooms_dining:
    //    ALL rooms + Dining Hall (automatically added by backend)
    //    resources = [
    //      { facilityType: "guest_room", category: "Deluxe", quantity: 10, ... },
    //      { facilityType: "guest_room", category: "Standard", quantity: 5, ... },
    //      { facilityType: "dining_hall", quantity: 1, ... }
    //    ]
    //
    // 3. full_bhavan:
    //    ALL resources (everything in the venue)
    //    resources = [all rooms + all facilities]
    //
    // 4. function_dining:
    //    resources = [
    //      { facilityType: "function_hall", quantity: 1, ... },
    //      { facilityType: "dining_hall", quantity: 1, ... }
    //    ]
    //
    // 5. function_only:
    //    resources = [{ facilityType: "function_hall", quantity: 1, ... }]
    //
    // 6. mini_hall:
    //    resources = [{ facilityType: "mini_hall", quantity: 1, ... }]
    //
    resources: [{
        resource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource',
            required: true
        },
        facilityType: {
            type: String,
            enum: ['guest_room', 'function_hall', 'dining_hall', 'mini_hall', 'full_venue'],
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
            // For guest rooms: "Deluxe", "Standard", etc.
            // For others: null
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
            // Number of units booked (e.g., 3 Deluxe rooms, 1 Function Hall)
        },
        pricePerUnit: {
            type: Number,
            required: true,
            // Price per unit per day (from Resource.basePrice)
        },
        days: {
            type: Number,
            required: true,
            // Number of days/nights
        },
        subtotal: {
            type: Number,
            required: true,
            // pricePerUnit × quantity × days
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
    },
    // ==================== CAPACITY INFORMATION ====================
    // Only for rooms_only and rooms_dining packages
    numberOfGuests: {
        type: Number,
        min: 1,
        // Required only for room bookings, calculated as: number of rooms × 4
    },

    calculatedCapacity: {
        type: Number,
        // Auto-calculated based on package:
        // - For room packages: sum of all room capacities
        // - For hall packages: hall capacity from Resource
    },

    // ==================== PRICING BREAKDOWN (SIMPLIFIED) ====================
    pricing: {
        // Total from all resources (before GST)
        subtotal: {
            type: Number,
            required: true,
            // Sum of all resources[].subtotal
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

        // Final total (subtotal + GST)
        totalAmount: {
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
            // totalAmount - paidAmount
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
        this.pricing.balanceAmount = this.pricing.totalAmount - this.pricing.paidAmount;
    }

    next();
});

// Validation: Ensure numberOfGuests is provided for room packages
bookingSchema.pre('save', function (next) {
    const roomPackages = ['rooms_only', 'rooms_dining', 'full_bhavan'];

    if (roomPackages.includes(this.category)) {
        if (!this.numberOfGuests || this.numberOfGuests === 0) {
            return next(new Error('numberOfGuests is required for room bookings'));
        }
    }

    next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;