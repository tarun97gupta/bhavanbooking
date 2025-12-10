import mongoose from 'mongoose';


function arrayMinLength(val) {
    return val.length >= 1;
}


const resourceSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        // required: true,
        // validate: [arrayMinLength, 'Resource must have at least one image']
    },
    // ==============Resource Classifications==============
    facilityType: {
        type: String,
        required: [true, 'Facility type is required'],
        enum: {
            values: ['guest_room', 'function_hall', 'dining_hall', 'mini_hall'],
            message: '{VALUE} is not a valid facility type'
        },
        index: true,
        // Used to categorize resources for package selection
    },

    category: {
        type: String,
        required: function () {
            return this.facilityType === 'guest_room';
        },
        enum: ['Deluxe', 'Standard'],
        // Only applicable for guest rooms
    },
    // ==================== PRICING ====================
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Price cannot be negative'],
        // Price per day/night
    },
    // ==================== CAPACITY & AVAILABILITY ====================
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1'],
        // For guest rooms: number of people
        // For halls: number of attendees
    },

    totalUnits: {
        type: Number,
        required: [true, 'Total units is required'],
        min: [1, 'Total units must be at least 1'],
        default: 1,
        // For guest rooms: how many identical rooms exist
        // For halls: typically 1
    },

    isExclusive: {
        type: Boolean,
        default: false,
        // true = Only one booking at a time (Function Hall, Full Venue)
        // false = Multiple bookings allowed if units available (Guest Rooms)
    },

    canBookAlone:{
        type: Boolean,
        default: true,
    },

    minBookingDays: {
        type: Number,
        default: 1,
        min: [1, 'Minimum booking days must be at least 1'],
    },

    maxBookingDays: {
        type: Number,
        default: 7,
        // Maximum consecutive days a resource can be booked
    },
    advanceBookingDays: {
        type: Number,
        default: 7,
        // How far in advance can this be booked
    },
    // ==================== AMENITIES & FEATURES ====================
    amenities: {
        type: [String],
        default: [],
        // Examples: ["WiFi", "AC", "TV", "Parking", "Catering"]
    },

    // ==================== POLICIES ====================
    policies: {
        type: [String],
        default: [],
        // Examples: ["No smoking", "Check-in after 2 PM", "ID proof required"]
    },
    // ==================== METADATA ====================
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    }
}, { timestamps: true });


// ==================== INDEXES ====================
resourceSchema.index({ facilityType: 1, isActive: 1 });
resourceSchema.index({ category: 1, isActive: 1 });
resourceSchema.index({ basePrice: 1 });
resourceSchema.index({ name: 'text', description: 'text' }); // For text search

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
