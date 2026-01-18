import { logger } from "../config/logger.js";
import { ResponseError } from "../middleware/error.middleware.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import {
    updatePasswordValidation,
    updateProfileValidation,
} from "../validations/user.validation.js";
import { validated } from "../validations/validation.js";
import path from "path";
import fs from "fs";

export const getUserProfile = async (req, res) => {
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

        const { password, ...userWithoutPassword } = user.toJSON();

        logger.info("Get user profile successfully");
        return res.status(200).json({
            success: true,
            message: "User Profile Berhasil Didapatkan",
            data: userWithoutPassword,
        });
    } catch (error) {
        logger.error("Failed to get user profile", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const request = validated(updatePasswordValidation, req.body);

        if (request.newPassword !== request.confirmPassword) {
            throw new ResponseError(
                404,
                "Password baru dan konfirmasi password tidak sama",
            );
        }

        const user = await User.findOne({
            where: {
                id: userId,
            },
        });

        const isMatch = await comparePassword(
            request.oldPassword,
            user.password,
        );

        if (!isMatch) {
            throw new ResponseError(404, "Password lama anda salah");
        }

        const hashedPassword = await hashPassword(request.newPassword);

        user.password = hashedPassword;
        user.save();

        const { password, ...userWithoutPassword } = user.toJSON();

        logger.info("User updated password successfully");
        return res.status(200).json({
            success: true,
            message: "Update Password Berhasil",
            data: userWithoutPassword,
        });
    } catch (error) {
        logger.error("Failed to updated password", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const request = validated(updateProfileValidation, req.body);

        const user = await User.findOne({
            where: {
                id: userId,
            },
        });

        if (req.file) {
            if (user.curriculumVitaeUrl) {
                const oldPath = path.join(
                    "uploads/curriculumVitae",
                    user.curriculumVitaeUrl,
                );
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            user.curriculumVitaeUrl = req.file.filename;
        }

        user.name = request.name ?? user.name;
        await user.save();

        const curriculumVitae = user.curriculumVitaeUrl
            ? `http://localhost:${process.env.APP_PORT}/uploads/curriculumVitae/${user.curriculumVitaeUrl}`
            : null;

        const { password, curriculumVitaeUrl, ...userWithoutPassword } =
            user.toJSON();

        logger.info("User updated profile successfully");
        return res.status(200).json({
            success: true,
            message: "Update Profile Berhasil",
            data: { ...userWithoutPassword, curriculumVitae },
        });
    } catch (error) {
        logger.error("Failed to updated Profile", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
