import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

dotenv.config();

// Connect to database
connectDB();

console.log("🛠️  Environment Check:");
console.log(`   - MONGO_URI: ${process.env.MONGO_URI ? "LOADED ✅" : "MISSING ❌"}`);
console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? "LOADED ✅" : "MISSING ❌"}`);
console.log(`   - FRONTEND_URL: ${process.env.FRONTEND_URL || "Allow All (*)"}`);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// Health Check Route
app.get("/", (req, res) => {
    res.send("QuizCraft Backend is running successfully! 🚀");
});

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
