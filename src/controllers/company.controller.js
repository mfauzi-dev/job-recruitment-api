import path from "path";
import { logger } from "../config/logger.js";
import { ResponseError } from "../middleware/error.middleware.js";
import Company from "../models/Company.js";
import { createCompanyValidation, updateCompanyValidation } from "../validations/company.validation.js";
import { validated } from "../validations/validation.js";
import fs from "fs";

export const createCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const request = validated(createCompanyValidation, req.body);
        const companyExists = await Company.findOne({
            where: { userId: userId },
        });

        if (companyExists) {
            if (req.files) {
                if (req.files.logo) {
                    fs.unlinkSync(req.files.logo[0].path);
                }
                if (req.files.thumbnail) {
                    fs.unlinkSync(req.files.thumbnail[0].path);
                }
            }
            throw new ResponseError(400, "Anda sudah mendaftarkan perusahaan");
        }

        if (!req.files.logo || !req.files.thumbnail) {
            throw new ResponseError(400, "Gambar wajib diunggah.");
        }
        const logoPath = req.files.logo[0].filename;
        const thumbnailPath = req.files.thumbnail[0].filename;

        const company = await Company.create({
            userId: userId,
            name: request.name,
            website: request.website,
            description: request.description,
            logoUrl: logoPath,
            thumbnailUrl: thumbnailPath,
        });

        logger.info("Create company successfully");
        res.status(200).json({
            success: true,
            message: "company berhasil ditambahkan",
            data: company,
        });
    } catch (error) {
        logger.error("Create company failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const detailCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const company = await Company.findOne({
            where: {
                userId,
            },
        });

        if (!company) {
            throw new ResponseError(404, "Perusahaan belum dibuat");
        }
        const thumbnail = company.thumbnailUrl
            ? `http://localhost:${process.env.APP_PORT}/uploads/thumbnail/${company.thumbnailUrl}`
            : null;

        const logo = company.logoUrl
            ? `http://localhost:${process.env.APP_PORT}/uploads/logo/${company.logoUrl}`
            : null;

        logger.info("Get detail company successfully");
        res.status(200).json({
            success: true,
            message: "Detail perusahaan berhasil ditampilkan",
            data: {
                ...company.toJSON(),
                thumbnail,
                logo,
            },
        });
    } catch (error) {
        logger.error("detail company failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const userId = req.user.id;

        const request = validated(updateCompanyValidation, req.body);

        const company = await Company.findOne({
            where: {
                userId,
            },
        });
        if (!company) {
            throw new ResponseError(404, "Perusahaan tidak ditemukan");
        }

        company.name = request.name ?? company.name;
        company.website = request.website ?? company.website;
        company.description = request.description ?? company.description;

        if (req.files.logo && req.files.logo.length > 0) {
            if (company.logoUrl) {
                const oldPath = path.join("uploads/logo", company.logoUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            company.logoUrl = req.files.logo[0].filename;
        }

        if (req.files.thumbnail && req.files.thumbnail.length > 0) {
            if (company.thumbnailUrl) {
                const oldPath = path.join("uploads/thumbnail", company.thumbnailUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            company.thumbnailUrl = req.files.thumbnail[0].filename;
        }

        await company.save();

        const thumbnail = company.thumbnailUrl
            ? `http://localhost:${process.env.APP_PORT}/uploads/thumbnail/${company.thumbnailUrl}`
            : null;

        const logo = company.logoUrl
            ? `http://localhost:${process.env.APP_PORT}/uploads/logo/${company.logoUrl}`
            : null;

        logger.info("Company updated successfully");
        res.status(200).json({
            success: true,
            message: "Company berhasil diperbarui",
            data: {
                ...company.toJSON(),
                logo,
                thumbnail,
            },
        });
    } catch (error) {
        logger.error("Update company failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const userId = req.user.id;

        const company = await Company.findOne({
            where: {
                userId,
            },
        });

        if (!company) {
            throw new ResponseError(404, "Perusahaan tidak ditemukan");
        }

        if (company.logoUrl) {
            const logoPath = path.join("uploads/logo", company.logoUrl);
            if (fs.existsSync(logoPath)) {
                fs.unlinkSync(logoPath);
            }
        }

        if (company.thumbnailUrl) {
            const thumbnailPath = path.join("uploads/thumbnail", company.thumbnailUrl);
            if (fs.existsSync(thumbnailPath)) {
                fs.unlinkSync(thumbnailPath);
            }
        }

        await company.destroy();

        logger.info("Company deleted successfully");

        res.status(200).json({
            success: true,
            message: "Perusahaan berhasil dihapus",
            data: company,
        });
    } catch (error) {
        logger.error("Delete company failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
