import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { publicRoutes } from "./routes/public-api.js";
import { routes } from "./routes/api.js";

dotenv.config();

export const app = express();

app.use(
    cors({
        credentials: true,
        origin: "http://localhost:5173",
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", publicRoutes);
app.use("/api", routes);

app.use(errorMiddleware);
