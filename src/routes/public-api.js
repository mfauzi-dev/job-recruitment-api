import express from "express";
import {
    forgotPassword,
    login,
    refreshToken,
    register,
    resetPassword,
} from "../controllers/auth.controller.js";
import {
    publicDetailJobs,
    publicGetAllJobs,
} from "../controllers/job.controller.js";

const publicRoutes = express.Router();

publicRoutes.post("/register", register);
publicRoutes.post("/login", login);
publicRoutes.post("/refresh-token", refreshToken);
publicRoutes.post("/forgot-password", forgotPassword);
publicRoutes.post("/reset-password/:token", resetPassword);

publicRoutes.get("/jobs", publicGetAllJobs);
publicRoutes.get("/jobs/:id", publicDetailJobs);

export { publicRoutes };
