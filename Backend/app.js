import mongoose from "mongoose";
import express, { json } from "express";
import cors from "cors";
import apiRoutes from "./src/apiUsersRoutes.js";
// import razorpayRoutes from './src/Razorpay/routes/RazorpayRoute.js';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://taskify-f-t3pg.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(json());
app.use(cookieParser());

// Use API routes
app.use("/api", apiRoutes);
// app.use('/api/razorpay', razorpayRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    const { createAdminUser } = await import("./src/server.js");
    await createAdminUser();
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is listening to ${port}`);
});

export default app;
