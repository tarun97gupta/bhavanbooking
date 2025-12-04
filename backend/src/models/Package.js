import mongoose from 'mongoose';


const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Package name is required'],
        unique: true,
        trim: true,
        // Example: "Full Bhavan Booking"
    },

    slug: {
        type: String,
        required: [true, 'Package slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        // Example: "full-bhavan-booking" (for URLs)
    },

    category: {
        type: String,
        required: [true, 'Category is required'],
        unique: true,
        enum: {
            values: [
                'full_bhavan',
                'function_dining',
                'function_only',
                'rooms_dining',
                'rooms_only',
                'mini_hall'
            ],
            message: '{VALUE} is not a valid category'
        },
        index: true,
    },

    description: {
        type: String,
        required: [true, 'Description is required'],
        // Detailed description for frontend
    },

    shortDescription: {
        type: String,
        trim: true,
        // Brief tagline
    },
    icon: {
        type: String,
        // Icon name or emoji for frontend display
        default: '🏨'
    },

    images: {
        type: [String],
        default: [],
        // Package promotional images
    },
    // ==================== RESOURCE INCLUSION RULES ====================
    includes: {
        // Required facility types (must be included)
        requiredFacilities: {
            type: [{
                facilityType: {
                    type: String,
                    enum: ['guest_room', 'function_hall', 'dining_hall', 'mini_hall', 'full_venue'],
                    required: true
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1
                },
                isFixed: {
                    type: Boolean,
                    default: true,
                    // true = user cannot change quantity
                    // false = user can select quantity (for guest rooms)
                }
            }],
            default: []
        },
        // NEW FIELD: Does user select rooms manually?
        allowRoomSelection: {
            type: Boolean,
            default: false,
            // true ONLY for "rooms_only" package
        },
        includesAllRooms: {
            type: Boolean,
            default: false,
            // true for "rooms_dining", "full_bhavan"
        },
        // Is this an exclusive booking? (blocks all other bookings)
        isExclusiveBooking: {
            type: Boolean,
            default: false,
            // true for Full Bhavan
        }
    },
    // ==================== PRICING CONFIGURATION ====================
    pricing: {
        // Fixed base price (before adding rooms/extras)
        basePrice: {
            type: Number,
            required: [true, 'Base price is required'],
            min: [0, 'Price cannot be negative'],
            default: 0
        },

        gstPercentage: {
            type: Number,
            default: 18,
            min: 0,
            max: 100
        },
    },

    // ==================== BOOKING RULES ====================
    bookingRules: {
        // Minimum stay duration
        minDays: {
            type: Number,
            default: 1,
            min: 1
        },

        // Maximum stay duration
        maxDays: {
            type: Number,
            default: 30,
            min: 1
        },

        // How far in advance can be booked?
        maxAdvanceBookingDays: {
            type: Number,
            default: 7
        },

        // Minimum advance notice required
        minAdvanceBookingDays: {
            type: Number,
            default: 1,
            // 1 = can book for tomorrow
            // 0 = can book for today
        },

        // Refund rules based on cancellation time
        refundPolicy: {
            type: String,
            enum: ['full_refund', 'partial_refund', 'no_refund'],
            default: 'partial_refund'
        }
    },

    // ==================== FEATURES & HIGHLIGHTS ====================
    features: {
        type: [String],
        default: [],
        // Example: ["24/7 Support", "Free WiFi", "Parking Included"]
    },
    amenities: {
        type: [String],
        default: [],
        // Inherited from included resources
    },

    // ==================== TERMS & CONDITIONS ====================
    terms: {
        type: [String],
        default: [],
        // Package-specific terms
    },
    // ==================== METADATA ====================
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
}, { timestamps: true });

// ==================== INDEXES ====================
packageSchema.index({ category: 1 });
packageSchema.index({ isActive: 1, displayOrder: 1 });

// Validation: Ensure package configuration makes sense
packageSchema.pre('save', function(next) {
    // rooms_only: Should NOT have requiredFacilities
    if (this.category === 'rooms_only') {
        if (this.includes.requiredFacilities.length > 0) {
            return next(new Error('rooms_only package should not have requiredFacilities'));
        }
        if (!this.includes.allowRoomSelection) {
            return next(new Error('rooms_only package must have allowRoomSelection = true'));
        }
    }
    
    // rooms_dining, full_bhavan: Should include all rooms
    if (['rooms_dining', 'full_bhavan'].includes(this.category)) {
        if (!this.includes.includesAllRooms) {
            return next(new Error(`${this.category} must have includesAllRooms = true`));
        }
    }
    
    next();
});

// ==================== VIRTUAL FIELDS ====================
packageSchema.virtual('url').get(function () {
    return `/packages/${this.slug}`;
});



const Package = mongoose.model('Package', packageSchema);
export default Package;