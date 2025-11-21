import express from 'express';
import Room from '../models/Room.js';
import protectRoute from '../middleware/auth.middleware.js';
import daysjs from 'dayjs';
import { deleteImage, generateUploadSignature } from '../lib/cloudinary.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';
import Booking from '../models/Booking.js';


daysjs.extend(customParseFormat);
daysjs.extend(utc);

const router = express.Router();

router.get('/', protectRoute, async (req,res)=>{

    try {
        const rooms = await Room.find({isActive: true});

        return res.status(200).json({
            message: "Rooms fetched successfully",
            rooms,
            count:rooms.length,
        });
    } catch (error) {
        console.log(error, 'Error in Get Rooms Route');
        return res.status(500).json({ message: "Internal server error" });
    }
});


// GET /api/rooms/check-availability
router.get('/check-availability', protectRoute,async (req, res) => {
    try {
        const { checkInDate, checkOutDate } = req.query;

        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({ 
                message: "Check-in and check-out dates are required" 
            });
        }

        // Parse dates in UTC to avoid timezone issues
        // This ensures all dates are at midnight UTC for consistent comparisons
        const checkIn = daysjs.utc(checkInDate, 'DD-MM-YYYY', true).startOf('day');
        const checkOut = daysjs.utc(checkOutDate, 'DD-MM-YYYY', true).startOf('day');

        // Validate dates
        if (!checkIn.isValid() || !checkOut.isValid()) {
            return res.status(400).json({ 
                message: "Invalid date format. Expected DD-MM-YYYY" 
            });
        }

        if (checkOut.isSame(checkIn) || checkOut.isBefore(checkIn)) {
            return res.status(400).json({ 
                message: "Check-out date must be after check-in date" 
            });
        }

        const today = daysjs().utc().startOf('day');
        if (checkIn.isBefore(today)) {
            return res.status(400).json({ 
                message: "Check-in date cannot be in the past" 
            });
        }

        const availableRooms = await Room.getAllWithAvailability(
            checkIn.toDate(), 
            checkOut.toDate()
        );

        const numberOfNights = checkOut.diff(checkIn, 'day');

        return res.status(200).json({
            success: true,
            message: "Available rooms fetched successfully",
            checkInDate,
            checkOutDate,
            numberOfNights,
            rooms: availableRooms,
            count: availableRooms.filter(r => r.available).length
        });

    } catch (error) {
        console.log(error, 'Error in Check Availability');
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.get('/types', protectRoute, async (req,res)=>{
    try {
        const types = await Room.distinct('roomType');
        return res.status(200).json({
            message: "Room types fetched successfully",
            types,
        });
    } catch (error) {
        console.log(error, 'Error in Get Room Types Route');
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/:roomId',protectRoute, async (req,res)=>{
    try {
        const {roomId} = req.params;
        const room = await Room.findById(roomId);
        
        if(!room){
            return res.status(404).json({ message: "Room not found" });
        }

        if(!room.isActive){
            return res.status(404).json({ message: "Room is not active" });
        }

        return res.status(200).json({
            message: "Room fetched successfully",
            room,
        });
    } catch (error) {
        console.log(error, 'Error in Get Room By Id Route');
        return res.status(500).json({ message: "Internal server error" });
    }
})

//specific room availability
router.get('/:roomId/availability',protectRoute, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { checkInDate, checkOutDate } = req.query;

        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({ 
                message: "Check-in and check-out dates are required" 
            });
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Parse dates in UTC to avoid timezone issues
        const checkIn = daysjs.utc(checkInDate, 'DD-MM-YYYY', true).startOf('day');
        const checkOut = daysjs.utc(checkOutDate, 'DD-MM-YYYY', true).startOf('day');

        if (!checkIn.isValid() || !checkOut.isValid()) {
            return res.status(400).json({ 
                message: "Invalid date format. Expected DD-MM-YYYY" 
            });
        }

        // ✅ USE MODEL METHOD - Simple!
        const availability = await room.checkAvailability(
            checkIn.toDate(), 
            checkOut.toDate()
        );

        const numberOfNights = checkOut.diff(checkIn, 'day');

        return res.status(200).json({
            success: true,
            room: {
                id: room._id,
                name: room.roomName,
                type: room.roomType,
                price: room.roomPrice,
                capacity: room.roomCapacity
            },
            availability,
            checkInDate,
            checkOutDate,
            numberOfNights
        });

    } catch (error) {
        console.log(error, 'Error in Check Specific Room Availability');
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid room ID" });
        }
        
        return res.status(500).json({ message: "Internal server error" });
    }
});



//Admin routes Authentication required.
// Create new room
router.post('/admin/rooms', protectRoute, async (req, res) => {
    try {
        // TODO: Add admin role check here
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ message: "Admin access required" });
        // }

        const {
            roomName,
            roomDescription,
            roomImages,
            roomPrice,
            roomType,
            roomCapacity,
            roomAmenities,
            roomPolicies,
            totalRooms
        } = req.body;

        // Validate required fields
        if (!roomName || !roomDescription || !roomImages || !roomPrice || 
            !roomType || !roomCapacity || !roomAmenities || !roomPolicies || !totalRooms) {
            return res.status(400).json({ 
                message: "All fields are required" 
            });
        }

        // Validate arrays
        if (!Array.isArray(roomImages) || roomImages.length === 0) {
            return res.status(400).json({ 
                message: "At least one room image is required" 
            });
        }

        if (!Array.isArray(roomAmenities) || roomAmenities.length === 0) {
            return res.status(400).json({ 
                message: "At least one amenity is required" 
            });
        }

        if (!Array.isArray(roomPolicies) || roomPolicies.length === 0) {
            return res.status(400).json({ 
                message: "At least one policy is required" 
            });
        }

        // Validate numbers
        if (roomPrice <= 0) {
            return res.status(400).json({ 
                message: "Room price must be greater than 0" 
            });
        }

        if (roomCapacity <= 0) {
            return res.status(400).json({ 
                message: "Room capacity must be greater than 0" 
            });
        }

        if (totalRooms <= 0) {
            return res.status(400).json({ 
                message: "Total rooms must be greater than 0" 
            });
        }

        // Check if room type already exists
        const existingRoom = await Room.findOne({ 
            roomName: roomName.trim(), 
            roomType: roomType 
        });

        if (existingRoom) {
            return res.status(400).json({ 
                message: "Room with this name and type already exists" 
            });
        }

        // Create room
        const room = await Room.create({
            roomName: roomName.trim(),
            roomDescription: roomDescription.trim(),
            roomImages,
            roomPrice,
            roomType,
            roomCapacity,
            roomAmenities,
            roomPolicies,
            totalRooms,
            isActive: true
        });

        return res.status(201).json({
            success: true,
            message: "Room created successfully",
            room
        });

    } catch (error) {
        console.log(error, 'Error in Create Room');
        return res.status(500).json({ message: "Internal server error" });
    }
});

//Update the Room
router.put('/admin/rooms/:roomId', protectRoute, async (req, res) => {
    try {
        // TODO: Add admin role check
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ message: "Admin access required" });
        // }

        const { roomId } = req.params;
        const updates = req.body;
        console.log(updates, 'Updates');

        // Validate roomId
        if (!roomId) {
            return res.status(400).json({ message: "Room ID is required" });
        }

        // Find room
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        // Validate only the fields that are being updated

        // Validate roomImages (if provided)
        if (updates.roomImages !== undefined) {
            if (!Array.isArray(updates.roomImages) || updates.roomImages.length === 0) {
                return res.status(400).json({ 
                    message: "At least one room image is required" 
                });
            }
        }

        // Validate roomAmenities (if provided)
        if (updates.roomAmenities !== undefined) {
            if (!Array.isArray(updates.roomAmenities) || updates.roomAmenities.length === 0) {
                return res.status(400).json({ 
                    message: "At least one amenity is required" 
                });
            }
        }

        // Validate roomPolicies (if provided)
        if (updates.roomPolicies !== undefined) {
            if (!Array.isArray(updates.roomPolicies) || updates.roomPolicies.length === 0) {
                return res.status(400).json({ 
                    message: "At least one policy is required" 
                });
            }
        }

        // Validate roomPrice (if provided)
        if (updates.roomPrice !== undefined) {
            const price = Number(updates.roomPrice);
            if (isNaN(price) || price <= 0) {
                return res.status(400).json({ 
                    message: "Room price must be a positive number" 
                });
            }
            updates.roomPrice = price; // Convert to number
        }

        // Validate roomCapacity (if provided)
        if (updates.roomCapacity !== undefined) {
            const capacity = Number(updates.roomCapacity);
            if (isNaN(capacity) || capacity <= 0) {
                return res.status(400).json({ 
                    message: "Room capacity must be a positive number" 
                });
            }
            updates.roomCapacity = capacity; // Convert to number
        }

        // Validate totalRooms (if provided)
        if (updates.totalRooms !== undefined) {
            const total = Number(updates.totalRooms);
            if (isNaN(total) || total <= 0) {
                return res.status(400).json({ 
                    message: "Total rooms must be a positive number" 
                });
            }
            updates.totalRooms = total; // Convert to number
        }

        // Trim string fields (if provided)
        if (updates.roomName) {
            updates.roomName = updates.roomName.trim();
        }

        if (updates.roomDescription) {
            updates.roomDescription = updates.roomDescription.trim();
        }

        // Update room (only fields that were sent)
        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            { $set: updates },
            { 
                new: true,           // Return updated document
                runValidators: true  // Run mongoose validators
            }
        );

        return res.status(200).json({
            success: true,
            message: "Room updated successfully",
            room: updatedRoom
        });

    } catch (error) {
        console.log(error, 'Error in Update Room');
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid room ID" });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(500).json({ message: "Internal server error" });
    }
});


//Admin route to get all the rooms.
router.get('/admin/rooms', protectRoute, async (req, res) => {
    try {
        const rooms = await Room.find({isActive: true});
        return res.status(200).json({
            message: "Rooms fetched successfully",
            rooms,
        });
    } catch (error) {
        console.log(error, 'Error in Get All Rooms Route');
        return res.status(500).json({ message: "Internal server error" });
    }
});

//Get Signature for Cloudinary Upload
//Admin route Authentication required.
router.get('/admin/rooms/upload-signature', protectRoute, (req, res) => {
    try {
        const { timestamp, signature } = generateUploadSignature();
        return res.status(200).json({
            timestamp,
            signature,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder: 'bhavan-booking/rooms'
        });
    } catch (error) {
        console.log(error, 'Error in Get Upload Signature Route');
        return res.status(500).json({ message: "Internal server error" });
    }
});


// 2. Delete image (after user removes)
router.delete('/admin/rooms/image', protectRoute, async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if(!imageUrl){
            return res.status(400).json({ message: "Image URL is required" });
        }
        const result = await deleteImage(imageUrl);
        if(!result){
            return res.status(400).json({ message: "Failed to delete image" });
        }
        return res.status(200).json({ success: true, message: "Image deleted successfully", result });
    } catch (error) {
        console.log(error, 'Error in Delete Image Route');
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
