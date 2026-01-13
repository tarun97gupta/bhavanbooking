import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    packageName: {
        type: String,
        required: true
    },
    // Guest details
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    visitingFrom: {
        type: String,
        trim: true
    },
    // Dates
    checkInDate: {
        type: String, // Format: DD-MM-YYYY
        required: true
    },
    checkOutDate: {
        type: String, // Format: DD-MM-YYYY
        required: true
    },
    numberOfNights: {
        type: Number,
        required: true
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'contacted', 'converted', 'rejected'],
        default: 'pending'
    },
    // Admin notes
    notes: {
        type: String
    }
}, {
    timestamps: true // createdAt, updatedAt
});

// Index for faster queries
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ phoneNumber: 1 });
enquirySchema.index({ packageId: 1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;

