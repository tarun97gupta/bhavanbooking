import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import rateLimit from 'express-rate-limit';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 100 requests per `windowMs`
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '10h' });
}

router.post("/register", authLimiter, async (req, res) => {
    try {
        const { fullName, phoneNumber, email, password } = req.body;

        if (!fullName || !phoneNumber || !password) {
            return res.status(400).json({ message: "Provide all required fields" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }
        if (fullName.length < 3) {
            return res.status(400).json({ message: "Full name must be at least 3 characters long" });
        }

        // Validate phone number format (exactly 10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
        }

        // Check if phone number already exists
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            return res.status(400).json({ message: "Phone number already exists" });
        }
        
        // Check if email already exists (if provided)
        if (email && email.length > 0) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: "Email already exists" });
            }
        }

        const user = await User.create({ 
            fullName, 
            phoneNumber, 
            email: email || null, 
            password 
        });

        await user.save();

        const token = generateToken(user._id);
        return res.status(201).json({
            message: "User created successfully", 
            user: {
                id: user._id,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                email: user.email || null,
            }, 
            token
        });

    } catch (error) {
        console.log(error, 'Error in Register Route');
        return res.status(500).json({ message: "Internal server error" });
    }

});

router.post("/login", authLimiter, async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        if (!phoneNumber || !password) {
            return res.status(400).json({ message: "Phone number and password are required" });
        }

        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        const token = generateToken(user._id);
        return res.status(200).json({
            message: "Login successful", 
            user: {
                id: user._id,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                email: user.email || null,
            }, 
            token
        });

    } catch (error) {
        console.log(error, 'Error in Login Route');
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/auth/me - Verify token and get current user
// This endpoint checks if the JWT token is still valid and returns user info
router.get('/me', protectRoute, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Return user information
        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email || null,
                phoneNumber: user.phoneNumber,
                role: user.role,
                createdAt: user.createdAt
            }
        });
        
    } catch (error) {
        console.log(error, 'Error in Get Current User');
        return res.status(500).json({ message: "Internal server error" });
    }
});


export default router;