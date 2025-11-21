import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import daysjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';
import Booking from '../models/Booking.js';
import protectRoute from '../middleware/auth.middleware.js';
import Room from '../models/Room.js';


const router = express.Router();

daysjs.extend(customParseFormat);
daysjs.extend(utc);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// Create new booking order

router.post('/create-order', protectRoute, async (req, res) => {

    try {
        const {
            rooms,
            checkInDate,
            checkOutDate,
            numberOfNights,
            totalPrice,
            numberOfGuests,
            guestDetails,
            specialRequests
        } = req.body;


        // Validate required fields
        if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
            return res.status(400).json({
                message: "At least one room must be selected"
            });
        }

        if (!checkInDate || !checkOutDate || !numberOfNights || !totalPrice || !numberOfGuests) {
            return res.status(400).json({
                message: "All booking details are required"
            });
        }

        if (!guestDetails?.fullName || !guestDetails?.phoneNumber) {
            return res.status(400).json({
                message: "Guest name and phone number are required"
            });
        }

        // Parse dates in UTC to avoid timezone issues
        // This ensures all dates are at midnight UTC for consistent comparisons
        const checkIn = daysjs.utc(checkInDate, 'DD-MM-YYYY', true).startOf('day');
        const checkOut = daysjs.utc(checkOutDate, 'DD-MM-YYYY', true).startOf('day');

        // Validate date format
        if (!checkIn.isValid() || !checkOut.isValid()) {
            return res.status(400).json({
                message: "Invalid date format. Expected DD-MM-YYYY"
            });
        }

        // Validate date logic
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

        //Validate number of nights
        const calculatedNights = checkOut.diff(checkIn, 'day');
        if (calculatedNights !== numberOfNights) {
            return res.status(400).json({
                message: "Number of nights calculated does not match the provided number of nights"
            });
        }

        // Process and validate each room
        const roomItems = [];
        let calculatedTotal = 0;
        let totalCapacity = 0;

        for (const roomItem of rooms) {

            const { roomId, numberOfRooms, subtotal } = roomItem;

            if (!roomId || !numberOfRooms || !subtotal) {
                return res.status(400).json({
                    message: "Invalid Room Data"
                });
            }

            //Find room
            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({
                    message: "Room not found"
                });
            }

            if (!room.isActive) {
                return res.status(400).json({
                    message: "Room is not active"
                });
            }

            //Check availability
            const availability = await room.checkAvailability(checkIn.toDate(), checkOut.toDate(), numberOfRooms);
            if (!availability.available) {
                return res.status(400).json({
                    message: `Only ${availability.availableRooms} ${room.roomName}(s) available for selected dates`,
                    roomName: room.roomName,
                    availableRooms: availability.availableRooms,
                    requestedRooms: numberOfRooms
                });
            }

            //Validate Price (price per night * number of rooms * number of nights)
            const expectedSubTotal = room.roomPrice * numberOfRooms * numberOfNights;

            if (Math.abs(subtotal - expectedSubTotal) > 0.01) {
                return res.status(400).json({
                    message: "Price mismatch. Please refresh and try again.",
                    expected: expectedSubTotal,
                    received: subtotal
                });
            }
            calculatedTotal += expectedSubTotal;
            totalCapacity += room.roomCapacity * numberOfRooms;

            roomItems.push({
                room: roomId,
                numberOfRooms: numberOfRooms,
                pricePerNight: room.roomPrice,
                subtotal: expectedSubTotal
            });


        }

        //Validate total price
        if (Math.abs(calculatedTotal - totalPrice) > 0.01) {
            console.log(calculatedTotal, totalPrice, 'Total price mismatch');
            return res.status(400).json({
                message: "Total price mismatch. Please refresh and try again."
            });
        }

        //Create Razorpay Order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalPrice * 100),
            currency: 'INR',
            receipt: `booking_${Date.now()}`,
            notes: {
                checkInDate: checkIn.format('DD-MM-YYYY'),
                checkOutDate: checkOut.format('DD-MM-YYYY'),
                numberOfNights: numberOfNights,
                numberOfGuests: numberOfGuests,
            }
        });

        //Create booking with pending status
        const booking = await Booking.create({
            userId: req.user._id,           // Changed from 'user'
            rooms: roomItems,
            checkInDate: checkIn.toDate(),
            checkOutDate: checkOut.toDate(),
            noOfGuests: numberOfGuests,      // Changed from 'numberOfGuests'
            noOfDays: numberOfNights,        // Changed from 'numberOfNights'
            noOfRooms: roomItems.reduce((sum, item) => sum + item.numberOfRooms, 0), // Calculate total rooms
            totalPrice,
            transactionId: razorpayOrder.id, // Add this
            guestDetails,
            specialRequests,
            status: 'pending',
            paymentStatus: 'pending',
            // Remove: specialRequests, status, paymentStatus, razorpayOrderId
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            bookingId: booking._id,
            bookingReference: booking.bookingReferenceId,
            razorpayOrder: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            },
                razorpayKeyId: process.env.RAZORPAY_API_KEY
        });


    } catch (error) {
        console.log(error, 'Error in Create Booking Order');
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/verify-payment', protectRoute, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
            return res.status(400).json({
                message: "All payment details are required"
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        // Check if booking belongs to the logged-in user
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized access to this booking"
            });
        }

        // Check if booking is already confirmed
        if (booking.status === 'confirmed') {
            return res.status(400).json({
                message: "Booking already confirmed"
            });
        }

        // Check if booking order ID matches
        if (booking.transactionId !== razorpay_order_id) {
            return res.status(400).json({
                message: "Order ID mismatch"
            });
        }

        // Verify Razorpay signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            // Signature verification failed - possible fraud attempt
            booking.status = 'failed';
            booking.paymentStatus = 'failed';
            booking.paymentAttempts = (booking.paymentAttempts || 0) + 1;
            booking.paymentFailedReason = 'Signature verification failed';
            await booking.save();

            return res.status(400).json({
                message: "Payment verification failed. Please contact support."
            });
        }

        // Signature verified - Update booking
        booking.status = 'confirmed';
        booking.paymentStatus = 'paid';
        booking.razorpayPaymentId = razorpay_payment_id;
        booking.razorpaySignature = razorpay_signature;
        booking.confirmedAt = new Date();
        booking.paymentAttempts = (booking.paymentAttempts || 0) + 1;

        await booking.save();

        // Populate room details for response
        await booking.populate('rooms.room', 'roomName roomType roomImages');

        return res.status(200).json({
            success: true,
            message: "Payment verified and booking confirmed successfully",
            booking: {
                bookingId: booking._id,
                bookingReference: booking.bookingReferenceId,
                status: booking.status,
                paymentStatus: booking.paymentStatus,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                totalPrice: booking.totalPrice,
                rooms: booking.rooms,
                guestDetails: booking.guestDetails,
                confirmedAt: booking.confirmedAt
            }
        });

    } catch (error) {
        console.log(error, 'Error in Verify Payment');
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


//Get user's bookings :- 

router.get('/my-bookings', protectRoute, async (req, res) => {

    try {
        const {status} = req.query;

        //build filter 
        const filter = {
            userId: req.user._id,
        }

        if( status !== undefined && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            filter.status = status;
        }

        //Get all bookings with room details
        const bookings = await Booking.find(filter).populate('rooms.room', 'roomName roomType roomImages').sort({createdAt:-1});

        return res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            bookings: bookings,
            total: bookings.length,
        });
        
    } catch (error) {
        console.log(error, 'Error in Get User Bookings');
        return res.status(500).json({ message: "Internal server error" });
    }
});


//Cancel Booking :- 
router.patch('/:bookingId/cancel', protectRoute, async (req, res) => {

    try {
        const {bookingId} = req.params;
        const {cancellationReason} = req.body;

        const booking = await Booking.findById(bookingId);

        if(!booking){
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        //Check if booking belongs to the logged-in user
        if(booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized access to this booking"
            });
        }

        // Check if booking can be cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }
        
        if (booking.status === 'completed') {
            return res.status(400).json({ message: "Cannot cancel completed booking" });
        }

        // Check if cancellation is allowed (e.g., not within 24 hours of check-in)
        const checkInDate = daysjs.utc(booking.checkInDate);
        const now = daysjs().utc();
        const hoursUntilCheckIn = checkInDate.diff(now, 'hour');

        if (hoursUntilCheckIn < 24) {
            return res.status(400).json({ message: "Cannot cancel booking within 24 hours of check-in" });
        }

        // Update booking status and cancellation reason
        booking.status = 'cancelled';
        booking.cancellationReason = cancellationReason;
        booking.cancelledAt = new Date();

        // If payment was made, update payment status
        if (booking.paymentStatus === 'paid') {
            booking.paymentStatus = 'refunded'; // In real app, initiate Razorpay refund here
        }
        
        await booking.save();



        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            booking: booking
        });

        
    } catch (error) {
        console.log(error, 'Error in Cancel Booking');
        return res.status(500).json({ message: "Internal server error" });
    }
});

//Get Single Booking Details :- 

router.get('/single/:bookingId', protectRoute, async (req, res) => {
    try {
        const {bookingId} = req.params;

        //Find booking
        const booking = await Booking.findById(bookingId).populate('rooms.room', 'roomName roomType roomImages');

        if(!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        //Check if booking belongs to the logged-in user

        if(booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized access to this booking"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking details fetched successfully",
            booking: booking
        });

        
    } catch (error) {
        console.log(error, 'Error in Get Single Booking Details');
        return res.status(500).json({ message: "Internal server error" });
    }
});


//Admin routes :- 

// 5. ADMIN: GET ALL BOOKINGS - Admin panel
router.get('/admin', protectRoute, async (req, res) => {
    try {
        // TODO: Add admin role check middleware
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ message: "Admin access required" });
        // }
        
        const { 
            status, 
            paymentStatus,
            startDate, 
            endDate,
            search
        } = req.query;
        
        // Build filter
        const filter = {};
        
        // Status filter
        if (status !== undefined && ['pending', 'confirmed', 'cancelled', 'completed', 'failed'].includes(status)) {
            filter.status = status;
        }
        
        // Payment status filter
        if (paymentStatus !== undefined && ['pending', 'paid', 'refunded', 'failed'].includes(paymentStatus)) {
            filter.paymentStatus = paymentStatus;
        }
        
        // Date range filter (by check-in date)
        if (startDate !== undefined || endDate !== undefined) {
            filter.checkInDate = {};
            if (startDate) {
                const start = daysjs.utc(startDate, 'DD-MM-YYYY', true).startOf('day').toDate();
                filter.checkInDate.$gte = start;
            }
            if (endDate) {
                const end = daysjs.utc(endDate, 'DD-MM-YYYY', true).endOf('day').toDate();
                filter.checkInDate.$lte = end;
            }
        }
        
        // Search by booking reference, guest name, or email
        if (search !== undefined) {
            filter.$or = [
                { bookingReferenceId: { $regex: search, $options: 'i' } },
                { 'guestDetails.fullName': { $regex: search, $options: 'i' } },
                { 'guestDetails.email': { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get all bookings
        const bookings = await Booking.find(filter)
            .populate('userId', 'fullName email phoneNumber')
            .populate('rooms.room', 'roomName roomType')
            .sort({ createdAt: -1 });
        
        // Calculate statistics
        const stats = await Booking.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            }
        ]);
        
        return res.status(200).json({
            success: true,
            totalBookings: bookings.length,
            bookings,
            stats
        });
        
    } catch (error) {
        console.log(error, 'Error in Get All Bookings (Admin)');
        return res.status(500).json({ message: "Internal server error" });
    }
});


// 6. ADMIN: UPDATE BOOKING STATUS - Manually update booking
router.patch('/admin/bookings/:bookingId', protectRoute, async (req, res) => {
    try {
        // TODO: Add admin role check middleware
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ message: "Admin access required" });
        // }
        
        const { bookingId } = req.params;
        const { status, paymentStatus, notes } = req.body;
        
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        
        // Update status if provided
        if (status !== undefined && ['pending', 'confirmed', 'cancelled', 'completed', 'failed'].includes(status)) {
            booking.status = status;
            
            // Set timestamps based on status
            if (status === 'confirmed' && !booking.confirmedAt) {
                booking.confirmedAt = new Date();
            } else if (status === 'cancelled' && !booking.cancelledAt) {
                booking.cancelledAt = new Date();
            }
        }
        
        // Update payment status if provided
        if (paymentStatus && ['pending', 'paid', 'refunded', 'failed'].includes(paymentStatus)) {
            booking.paymentStatus = paymentStatus;
        }
        
        // Add admin notes if provided
        if (notes) {
            booking.cancellationReason = notes; // Or create a separate 'adminNotes' field
        }
        
        await booking.save();
        
        return res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            booking
        });
        
    } catch (error) {
        console.log(error, 'Error in Update Booking (Admin)');
        return res.status(500).json({ message: "Internal server error" });
    }
});


export default router;