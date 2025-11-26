import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
    // ==================== BASIC INFO ====================
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    
    category: {
        type: String,
        required: true,
        unique: true,
        enum: [
            'full_bhavan',
            'function_dining',
            'function_only',
            'rooms_dining',
            'rooms_only',
            'mini_hall'
        ],
    },
    
    description: {
        type: String,
        required: true,
    },
    
    shortDescription: {
        type: String,
    },
    
    displayOrder: {
        type: Number,
        default: 0,
    },
    icon: {
        type: String,
    },
    images: {
        type: [String],
        default: [],
    },
    
    // ==================== RESOURCE INCLUSION RULES ====================
    includes: {
        // Which facility types are included in this package
        facilityTypes: {
            type: [String],
            required: true,
            enum: ['guest_room', 'function_hall', 'dining_hall', 'mini_hall', 'full_venue'],
        },
        allowRoomSelection: {
            type: Boolean,
            default: false,
            // true for "Rooms Only" and "Rooms + Dining"
            // false for "Full Bhavan", "Function Hall + Dining"
        },
        minRooms: {
            type: Number,
            default: 0,
        },
        maxRooms: {
            type: Number,
            default: null, // null = no limit
        },
        isExclusive: {
            type: Boolean,
            default: false,
            // true for Full Bhavan
        },
    },
    
    // ==================== PRICING RULES ====================
    pricing: {
        // Base price for the package (without any rooms)
        basePrice: {
            type: Number,
            required: true,
            // For "Function Hall + Dining" = 70,000
            // For "Rooms Only" = 0 (because price comes from rooms)
        },
        
        // Is pricing per day or one-time?
        perDayRate: {
            type: Boolean,
            default: true,
        },
                
    },
    
    // ==================== AVAILABILITY RULES ====================
    availability: {
        // Minimum days for booking
        minDays: {
            type: Number,
            default: 1,
        },
        
        // Maximum days for booking
        maxDays: {
            type: Number,
            default: 30,
        },
        
        // How many days in advance can users book?
        advanceBookingDays: {
            type: Number,
            default: 90,
        },
        
        // Minimum days before check-in for booking
        minAdvanceBookingDays: {
            type: Number,
            default: 1, // Can book for tomorrow
        }
    },
    
    // ==================== FEATURES & HIGHLIGHTS ====================
    features: {
        type: [String],
        default: [],
        // Example: ["24/7 Support", "Free WiFi", "Parking Included"]
    },
    
    highlights: {
        type: [String],
        default: [],
        // Example: ["Accommodates 500+ guests", "Full catering service"]
    },
    
    // ==================== METADATA ====================
    isActive: {
        type: Boolean,
        default: true,
    },
    
    isPopular: {
        type: Boolean,
        default: false,
        // For highlighting on frontend
    },
    
    terms: {
        type: [String],
        default: [],
        // Terms and conditions specific to this package
    },
    
}, { timestamps: true });

// ==================== INDEXES ====================
packageSchema.index({ category: 1 });
packageSchema.index({ isActive: 1, displayOrder: 1 });

const Package = mongoose.model('Package', packageSchema);

export default Package;