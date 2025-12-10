import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
    // ==================== BASIC INFO ====================
    name: {
        type: String,
        required: [true, 'Package name is required'],
        unique: true,
        trim: true,
    },

    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },

    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: [
                'full_venue',              // (i) Full Bhavan Booking
                'function_hall_dining',    // (ii) Function Hall + Dining
                'rooms_dining_mini_hall',  // (iii) All Rooms + Dining + Mini Hall
                'rooms_mini_hall',         // (iv) All Rooms + Mini Hall
                'function_hall_only',      // (v) Function Hall only
                'mini_hall',               // (vi) Mini Hall only
                'rooms_only'               // (vii) Individual room bookings
            ],
            message: '{VALUE} is not a valid category'
        },
        index: true,
    },

    description: {
        type: String,
        required: [true, 'Description is required'],
    },

    shortDescription: {
        type: String,
        trim: true,
    },

    images: {
        type: [String],
        default: [],
    },

    // ==================== RESOURCE INCLUSION ====================
    includes: {
        resources: [{
            resource: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Resource',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            },
            isRequired: {
                type: Boolean,
                default: true,
            },
            isFlexible: {
                type: Boolean,
                default: false,
                // true only for "rooms_only" package
            },
            minQuantity: {
                type: Number,
                min: 1,
            },
            maxQuantity: {
                type: Number,
                min: 1,
            }
        }],

        dining: {
            type: Boolean,
            default: false,
        },
        breakfast: {
            type: Boolean,
            default: false,
        },
        lunch: {
            type: Boolean,
            default: false,
        },
        dinner: {
            type: Boolean,
            default: false,
        }
    },

    // ==================== PRICING ====================
    pricing: {
        basePrice: {
            type: Number,
            required: [true, 'Base price is required'],
            min: [0, 'Price cannot be negative'],
            default: 0,
            // Fixed price per day
            // For "rooms_only", this is 0
        },

        gstPercentage: {
            type: Number,
            default: 18,
            min: 0,
            max: 100
        }
    },

    // ==================== BOOKING RULES ====================
    bookingRules: {
        minDays: {
            type: Number,
            default: 1,
            min: 1,
        },

        maxDays: {
            type: Number,
            default: 7,
            min: 1,
        },

        advanceBookingDays: {
            type: Number,
            default: 30,
        },

        cancellationPolicy: {
            type: String,
            default: 'No refund within 7 days of check-in',
        }
    },

    // ==================== ADDITIONAL INFO ====================
    termsAndConditions: {
        type: [String],
        default: [],
    },

    displayOrder: {
        type: Number,
        default: 0,
    },

    bookingCount: {
        type: Number,
        default: 0,
    },

    // ==================== METADATA ====================
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    }
}, { timestamps: true });


// ==================== INDEXES ====================
packageSchema.index({ category: 1, isActive: 1 });
packageSchema.index({ displayOrder: 1 });
packageSchema.index({ bookingCount: -1 });

// ==================== VIRTUAL FIELDS ====================
packageSchema.virtual('url').get(function () {
    return `/packages/${this.slug}`;
});

// ==================== PRE-SAVE VALIDATION ====================
packageSchema.pre('save', async function(next) {
    try {
        // Generate slug from name if not provided
        if (!this.slug && this.name) {
            this.slug = this.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Validate: rooms_only should have flexible resources
        if (this.category === 'rooms_only') {
            const hasFlexibleResource = this.includes.resources.some(r => r.isFlexible);
            if (!hasFlexibleResource) {
                return next(new Error('rooms_only package must have at least one flexible resource'));
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

const Package = mongoose.model('Package', packageSchema);
export default Package;