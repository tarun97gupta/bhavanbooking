import express from 'express';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import { connectDB } from './lib/db.js';
import cors from 'cors';
import resourceRoutes from './routes/resourceRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();

const PORT = process.env.PORT || 3000;

// job.start();
// CORS configuration
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, '0.0.0.0', ()=>{
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://192.168.0.12:${PORT}`);
    connectDB();
})  