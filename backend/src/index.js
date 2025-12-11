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

app.listen(PORT, '0.0.0.0', ()=>{
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://192.168.0.12:${PORT}`);
    connectDB();
})  