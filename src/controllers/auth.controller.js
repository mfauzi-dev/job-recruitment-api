import { logger } from "../config/logger.js";
import { ResponseError } from "../middleware/error.middleware.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/generateToken.js";
import {
    sendPasswordResetEmail,
    sendResetSuccessEmail,
    sendVerificationEmail,
    sendWelcomeEmail,
} from "../utils/sendEmail.js";
import {
    loginValidation,
    registerValidation,
} from "../validations/auth.validation.js";
import { validated } from "../validations/validation.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import crypto from "crypto";

export const register = async (req, res) => {
    try {
        const request = validated(registerValidation, req.body);

        const role = await Role.findOne({
            where: {
                name: request.roleName,
            },
        });

        const userAlreadyExists = await User.findOne({
            where: {
                email: request.email,
            },
        });

        if (userAlreadyExists) {
            throw new ResponseError(400, "User sudah ada");
        }

        if (request.password !== request.confirmPassword) {
            throw new ResponseError(
                400,
                "Password dan Konfirmasi Password tidak sama",
            );
        }

        const hashedPassword = await hashPassword(request.password);

        const result = await User.create({
            email: request.email,
            password: hashedPassword,
            name: request.name,
            roleId: role.id,
        });

        const { password: undefined, ...userWithoutPassword } = result.toJSON();

        logger.info(`Registrasi Berhasil`);
        return res.status(201).json({
            success: true,
            message: "Registrasi Berhasil",
            data: userWithoutPassword,
        });
    } catch (error) {
        logger.error("User registration failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const request = validated(loginValidation, req.body);

        const user = await User.findOne({
            where: {
                email: request.email,
            },
            include: [
                {
                    model: Role,
                    as: "role",
                },
            ],
        });

        if (!user) {
            throw new ResponseError(400, "Email dan Password salah");
        }

        const isPasswordValid = await comparePassword(
            request.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new ResponseError(400, "Email dan Password salah");
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.lastLogin = new Date();
        user.save();

        const { password, ...userWithoutPassword } = user.toJSON();

        logger.info("Logged in successfully");
        res.status(200).json({
            success: true,
            message: "Login Berhasil",
            data: userWithoutPassword,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        logger.error("User registration failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const user = await User.findOne({
            where: {
                id: decoded.id,
            },
            include: [
                {
                    model: Role,
                    as: "role",
                },
            ],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return res.status(200).json({
            success: true,
            message: "Token refreshed",
            accessToken,
            refreshToken,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
};

export const sendVerificationToken = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findOne({
            where: {
                id: userId,
            },
            include: [
                {
                    model: Role,
                    as: "role",
                },
            ],
        });

        if (user.isVerified === 1) {
            throw new ResponseError(400, "Email sudah diverifikasi.");
        }

        const verificationToken = Math.floor(
            100000 + Math.random() * 900000,
        ).toString();

        const verificationTokenExpiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000,
        );

        user.verificationToken = verificationToken;
        user.verificationTokenExpiresAt = verificationTokenExpiresAt;

        await user.save();

        const { password, ...userWithoutPassword } = user.toJSON();

        await sendVerificationEmail(user.email, verificationToken);

        logger.info("Send verification token successfully");
        return res.status(200).json({
            success: true,
            message: "Send verification token successfully",
            data: userWithoutPassword,
        });
    } catch (error) {
        logger.error("Send verification token failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { code } = req.body;

        const user = await User.findOne({
            where: {
                verificationToken: code,
                verificationTokenExpiresAt: {
                    [Op.gt]: new Date(),
                },
            },
            include: [
                {
                    model: Role,
                    as: "role",
                },
            ],
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code",
            });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiresAt = null;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        const { password, ...userWithoutPassword } = user.toJSON();

        logger.info("Email verified successfully");
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        logger.error("Email verification failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        if (!user) {
            throw new ResponseError(400, "User not found");
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();

        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
        );

        logger.info("Password reset link sent successfully");
        return res.status(200).json({
            success: true,
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        logger.error("Password reset link failed to send", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpiresAt: {
                    [Op.gt]: new Date(),
                },
            },
        });

        if (!user) {
            throw new ResponseError(400, "Invalid or expired reset token");
        }

        const hashedPassword = await hashPassword(password);

        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpiresAt = null;
        await user.save();

        await sendResetSuccessEmail(user.email);

        logger.info("Password reset success");
        return res.status(200).json({
            success: true,
            message: "Password reset success",
        });
    } catch (error) {
        logger.error("Password reset failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
