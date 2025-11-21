import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    bookingReferenceId:{
        type: String,
        unique: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rooms: [{
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true
        },
        numberOfRooms: {
            type: Number,
            required: true,
            min: 1
        },
        pricePerNight: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        },
        _id: false
    }],
    checkInDate:{
        type: Date,
        required: true,
    },
    checkOutDate:{
        type: Date,
        required: true,
    },
    totalPrice:{
        type: Number,
        required: true,
    },
    noOfRooms:{
        type: Number,
        required: true,
    },
    noOfGuests:{
        type: Number,
        required: true,
    },
    noOfDays:{
        type: Number,
        required: true,
    },
    transactionId:{
        type: String,
        required: true,
    },
    guestDetails: {
        fullName: {
            type: String,
            required: [true, 'Guest full name is required'],
        },
        phoneNumber: {
            type: String,
            required: [true, 'Guest phone number is required'],
        },
        email: {
            type: String,
        },
        idProof: {
            type: String,
        }
    },
    specialRequests:{
        type: String,
        default: null
    },
    status:{
        type: String,
        default: 'pending'
    },
    paymentStatus:{
        type: String,
        default: 'pending'
    },
    cancellationReason:{
        type: String,
        default: null
    },
    cancelledAt:{
        type: Date,
        default: null
    }
}, { timestamps: true });


bookingSchema.pre('save', async function(next){
    if(this.isNew && !this.bookingReferenceId)
        {
            const randomStr = Math.random().toString(36).substring(2,8).toUpperCase();
            this.bookingReferenceId = `BHV-${randomStr}`;
        }
    next();
})

// 1. For "My Bookings" page (most used)
bookingSchema.index({ user: 1, createdAt: -1 });

// 2. For booking reference lookup
bookingSchema.index({ bookingReference: 1 });

// 3. For availability checking (critical!)
bookingSchema.index({ 'rooms.room': 1, checkInDate: 1, checkOutDate: 1, status: 1 });


const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;