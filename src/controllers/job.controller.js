import sequelize from "../config/database.js";
import { logger } from "../config/logger.js";
import { ResponseError } from "../middleware/error.middleware.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import {
    createJobValidation,
    updateJobValidation,
} from "../validations/job.validation.js";
import { validated } from "../validations/validation.js";

export const createJob = async (req, res) => {
    try {
        const userId = req.user.id;

        const company = await Company.findOne({
            where: {
                userId: userId,
            },
        });

        const request = validated(createJobValidation, req.body);

        const job = await Job.create({
            companyId: company.id,
            title: request.title,
            description: request.description,
            location: request.location,
            status: request.status,
        });

        logger.info("Create job successfully");
        res.status(200).json({
            success: true,
            message: "Pekerjaan berhasil ditambahkan",
            data: job,
        });
    } catch (error) {
        logger.error("Create company failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        const company = await Company.findOne({
            where: {
                userId: userId,
            },
        });

        const companyId = company.id;

        const { page = 1, perPage = 10 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(perPage);

        const limit = parseInt(perPage);

        const data = await sequelize.query(
            `
            SELECT j.id, j.title, j.description, j.location, j.status,
                   c.id as companyId, c.name as company_name
            FROM
            jobs j
            LEFT JOIN companies c ON c.id = j.companyId
            WHERE j.companyId = :companyId
            ORDER BY j.createdAt DESC
            LIMIT :limit OFFSET :offset
            `,
            {
                replacements: {
                    companyId,
                    limit,
                    offset,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (data.length === 0) {
            throw new ResponseError(404, "Pekerjaan belum ada");
        }

        const [countResult] = await sequelize.query(
            `
            SELECT COUNT(*) as total
            FROM
            jobs j
            LEFT JOIN companies c ON c.id = j.companyId
            WHERE j.companyId = :companyId
            `,
            {
                replacements: {
                    companyId,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        const total = Number(countResult.total || 0);

        logger.info("Get view job successfully");
        return res.status(200).json({
            success: true,
            message: "Semua job berhasil didapatkan.",
            currentPage: parseInt(page),
            perPage: limit,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            data,
        });
    } catch (error) {
        logger.error("Get all job failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const detailJob = async (req, res) => {
    try {
        const userId = req.user.id;

        const { id } = req.params;

        const company = await Company.findOne({
            where: {
                userId: userId,
            },
        });

        const job = await Job.findOne({
            where: {
                companyId: company.id,
                id: id,
            },
        });

        if (!job) {
            throw new ResponseError(404, "Pekerjaan tidak ditemukan");
        }

        logger.info("Get detail job successfully");
        res.status(200).json({
            success: true,
            message: "Detail pekerjaan berhasil didapatkan",
            data: job,
        });
    } catch (error) {
        logger.error("Get detail job failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateJob = async (req, res) => {
    try {
        const userId = req.user.id;

        const { id } = req.params;

        const request = validated(updateJobValidation, req.body);

        const company = await Company.findOne({
            where: {
                userId: userId,
            },
        });

        const job = await Job.findOne({
            where: {
                companyId: company.id,
                id: id,
            },
            include: [
                {
                    model: Company,
                    as: "company",
                    attributes: ["id", "name", "website", "description"],
                },
            ],
        });

        if (!job) {
            throw new ResponseError(404, "Pekerjaan tidak ditemukan");
        }

        job.title = request.title ?? job.title;
        job.description = request.description ?? job.description;
        job.location = request.location ?? job.location;
        job.status = request.status ?? job.status;

        await job.save();

        logger.info("Update job successfully");
        res.status(200).json({
            success: true,
            message: "Pekerjaan berhasil diupdate",
            data: job,
        });
    } catch (error) {
        logger.error("Update job failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const userId = req.user.id;

        const { id } = req.params;

        const company = await Company.findOne({
            where: {
                userId: userId,
            },
        });

        const job = await Job.findOne({
            where: {
                companyId: company.id,
                id: id,
            },
            include: [
                {
                    model: Company,
                    as: "company",
                    attributes: ["id", "name", "website", "description"],
                },
            ],
        });

        if (!job) {
            throw new ResponseError(404, "Pekerjaan tidak ditemukan");
        }

        await job.destroy();

        logger.info("Delete job successfully");
        res.status(200).json({
            success: true,
            message: "Pekerjaan berhasil dihapus",
            data: job,
        });
    } catch (error) {
        logger.error("Delete job failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const publicGetAllJobs = async (req, res) => {
    try {
        const { search = "", page = 1, perPage = 10 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(perPage);

        const limit = parseInt(perPage);

        const searchQuery = `%${search || ""}%`;

        const data = await sequelize.query(
            `
            SELECT j.id, j.title, j.description, j.location, j.status,
                   c.id as companyId, c.name as company_name
            FROM
            jobs j
            LEFT JOIN companies c ON c.id = j.companyId
            WHERE status = 'open'
                AND (j.title LIKE :searchQuery OR j.location LIKE :searchQuery)
            ORDER BY j.createdAt DESC
            LIMIT :limit OFFSET :offset
            `,
            {
                replacements: {
                    searchQuery,
                    limit,
                    offset,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (data.length === 0) {
            throw new ResponseError(404, "Pekerjaan belum ada");
        }

        const [countResult] = await sequelize.query(
            `
            SELECT COUNT(*) as total
            FROM
            jobs j
            LEFT JOIN companies c ON c.id = j.companyId
            WHERE status = 'open'
                AND (j.title LIKE :searchQuery OR j.location LIKE :searchQuery)
            `,
            {
                replacements: {
                    searchQuery,
                },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        const total = Number(countResult.total || 0);

        logger.info("Get view job successfully");
        return res.status(200).json({
            success: true,
            message: "Semua job berhasil didapatkan.",
            currentPage: parseInt(page),
            perPage: limit,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            data,
        });
    } catch (error) {
        logger.error("Get all job failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const publicDetailJobs = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findOne({
            where: {
                id: id,
            },
            include: [
                {
                    model: Company,
                    as: "company",
                    attributes: ["id", "name", "website", "description"],
                    required: false,
                },
            ],
        });

        if (!job) {
            throw new ResponseError(404, "Pekerjaan tidak ditemukan");
        }

        logger.info("Get detail job successfully");
        return res.status(200).json({
            success: true,
            message: "Detail job berhasil didapatkan.",
            data: job,
        });
    } catch (error) {
        logger.error("Get detail job failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
