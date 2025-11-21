import mongoose from 'mongoose';

function arrayMinLength(val) {
    return val.length >= 1;
}

const roomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
    },
    roomDescription: {
        type: String,
        required: true,
    },
    roomImages: {
        type: [String],
        required: true,
        validate: [arrayMinLength, 'Room must have at least one image']
    },
    roomPrice: {
        type: Number,
        required: true,
    },
    roomType:{
        type: String,
        required: true,
        enum: ['Deluxe', 'Standard'],
    },
    roomCapacity: {
        type: Number,
        required: true,
    },
    roomAmenities: {
        type: [String],
        required: true,
    },
    roomPolicies: {
        type: [String],
        required: true,
    },
    totalRooms: {
        type: Number,
        required: true,
    },
    isActive:{
        type: Boolean,
        default: true,
    },
}, { timestamps: true });


// ============================================================================
// INSTANCE METHOD: Check availability for this specific room
// ============================================================================
roomSchema.methods.checkAvailability = async function(checkInDate, checkOutDate, numberOfRooms = 1) {
    const Booking = mongoose.model('Booking');
    
    // Find overlapping bookings
    // Two bookings overlap if: checkOutA > checkInB AND checkInA < checkOutB
    // Same-day checkout/checkin is allowed (checkout morning, checkin afternoon)
    const overlappingBookings = await Booking.find({
        'rooms.room': this._id,
        status: { $in: ['confirmed', 'pending'] },
        checkInDate: { $lt: checkOutDate },      // Existing booking starts before new checkout
        checkOutDate: { $gt: checkInDate }       // Existing booking ends after new checkin
    });
    
    // Calculate booked rooms
    let bookedRooms = 0;
    overlappingBookings.forEach(booking => {
        booking.rooms.forEach(roomItem => {
            if (roomItem.room.toString() === this._id.toString()) {
                bookedRooms += roomItem.numberOfRooms;
            }
        });
    });
    
    const availableRooms = this.totalRooms - bookedRooms;
    
    return {
        available: availableRooms >= numberOfRooms,
        availableRooms: Math.max(0, availableRooms),
        totalRooms: this.totalRooms,
        bookedRooms: bookedRooms,
        roomId: this._id,
        roomName: this.roomName,
        roomType: this.roomType
    };
};

// ============================================================================
// STATIC METHOD: Get all rooms with availability
// ============================================================================
roomSchema.statics.getAllWithAvailability = async function(checkInDate, checkOutDate) {
    const rooms = await this.find({ isActive: true });
    
    const roomsWithAvailability = await Promise.all(
        rooms.map(async (room) => {
            const availability = await room.checkAvailability(checkInDate, checkOutDate, 1);
            return {
                ...room.toObject(),
                ...availability
            };
        })
    );
    
    return roomsWithAvailability;
};




const Room = mongoose.model('Room', roomSchema);

export default Room;