import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postsRouter from "./routes/posts.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(postsRouter);

const start = async() => {
    const MongoDB = process.env.DB_URL;
    const connectDB = await mongoose.connect(MongoDB);
    
    app.listen(9090, () => {
        console.log("Server is running on port 9090")
    })
}

start();
