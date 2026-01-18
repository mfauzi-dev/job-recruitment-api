import { logger } from "../config/logger.js";
import { ResponseError } from "../middleware/error.middleware.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import {
    createApplicationValidation,
    updateApplicationValidation,
} from "../validations/application.validation.js";
import { validated } from "../validations/validation.js";
import path from "path";
import fs from "fs";
import Company from "../models/Company.js";
import sequelize from "../config/database.js";

export const createApplication = async (req, res) => {
    try {
        const { id } = req.params;

        const userId = req.user.id;

        const user = await User.findOne({
            where: {
                id: userId,
            },
        });

        if (!user.curriculumVitaeUrl) {
            throw new ResponseError(
                400,
                "Silahkan upload Daftar Riwayat Hidup anda terlebih dulu",
            );
        }

        const job = await Job.findOne({
            where: {
                id: id,
                status: "open",
            },
        });

        if (!job) {
            throw new ResponseError(404, "Pekerjaan ini telah ditutup.");
        }

        const existingApplication = await Application.findOne({
            where: {
                userId: userId,
                jobId: job.id,
            },
        });

        if (existingApplication) {
            if (req.file) {
                const filePath = path.join(
                    "uploads/coverLetter",
                    req.file.filename,
                );
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            throw new ResponseError(
                400,
                "Anda sudah melamar pekerjaan ini sebelumnya.",
            );
        }

        const request = validated(createApplicationValidation, req.body);

        if (!req.file) {
            throw new ResponseError(404, "Surat lamaran wajib diunggah");
        }

        const coverLetterPath = req.file.filename;

        const applicant = await Application.create({
            userId: userId,
            jobId: job.id,
            status: request.status,
            coverLetterUrl: coverLetterPath,
        });

        const coverLetter = applicant.coverLetterUrl
            ? `http://localhost:${process.env.APP_PORT}/uploads/coverLetter/${applicant.coverLetterUrl}`
            : null;
        logger.info("Create application successfully");
        res.status(200).json({
            success: true,
            message: "Surat lamaran berhasil dikirim",
            data: {
                ...applicant.toJSON(),
                coverLetter,
            },
        });
    } catch (error) {
        logger.error("Create application failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllApplicantion = async (req, res) => {
    try {
        const userId = req.user.id;

        const company = await Company.findOne({
            where: {
                userId,
            },
        });
        if (!company) {
            throw new ResponseError(
                404,
                "Perusahaan tidak ditemukan untuk user ini",
            );
        }

        const companyId = company.id;

        const { page = 1, perPage = 10 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(perPage);

        const limit = parseInt(perPage);

        const data = await sequelize.query(
            `
            SELECT j.id, j.title as jobTitle, 
                   a.id as applicationId, a.status, a.coverLetterUrL,
                   u.id as candidateId, u.name as candidateName, u.email, u.curriculumVitaeUrl,
            CASE
            WHEN a.coverLetterUrl IS NOT NULL THEN CONCAT('http://localhost:${process.env.APP_PORT}/uploads/coverLetter/', a.coverLetterUrl) 
                ELSE NULL
            END as coverLetterPublicUrl,
            CASE
            WHEN u.curriculumVitaeUrl IS NOT NULL THEN CONCAT('http://localhost:${process.env.APP_PORT}/uploads/curriculumVitae/', u.curriculumVitaeUrl) 
                ELSE NULL
            END as curriculumVitaePublicUrl
            FROM jobs j
            INNER JOIN applications a ON a.jobId = j.id
            LEFT JOIN users u ON a.userId = u.id
            WHERE j.companyId = :companyId
            ORDER BY j.createdAt DESC, a.createdAt DESC
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
            throw new ResponseError(404, "Pelamar belum ada.");
        }

        const [countResult] = await sequelize.query(
            `
            SELECT COUNT(*) AS total
            FROM jobs j
            LEFT JOIN applications a ON a.jobId = j.id
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

        logger.info("Get view applicants successfully");
        return res.status(200).json({
            success: true,
            message: "Semua post berhasil didapatkan.",
            currentPage: parseInt(page),
            perPage: limit,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            data,
        });
    } catch (error) {
        logger.error("View Applicant failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateStatusApplication = async (req, res) => {
    try {
        const userId = req.user.id;

        const { jobId, applicationId } = req.params;

        const request = validated(updateApplicationValidation, req.body);

        const company = await Company.findOne({
            where: {
                userId: userId,
            },
        });

        const application = await Application.findOne({
            where: {
                id: applicationId,
                jobId: jobId,
            },
            include: [
                {
                    model: Job,
                    as: "job",
                    where: {
                        companyId: company.id,
                    },
                },
            ],
        });

        if (!application) {
            throw new ResponseError(404, "Data lamaran tidak ditemukan.");
        }

        application.status = request.status;
        await application.save();

        logger.info("Update Status Application Success");
        res.status(200).json({
            success: true,
            message: "Status surat lamaran berhasil diupdate",
            data: application,
        });
    } catch (error) {
        logger.error("Update Status Application failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const detailApplication = async (req, res) => {
    try {
        const userId = req.user.id;

        const { jobId, applicationId } = req.params;

        const application = await Application.findOne({
            where: {
                id: applicationId,
                userId: userId,
                jobId: jobId,
            },
            include: [
                {
                    model: User,
                    as: "candidate",
                    attributes: ["id", "name", "email", "curriculumVitaeUrl"],
                },
                {
                    model: Job,
                    as: "job",
                    attributes: ["id", "title"],
                    include: [
                        {
                            model: Company,
                            as: "company",
                            attributes: ["id", "name"],
                        },
                    ],
                },
            ],
        });

        if (!application) {
            throw new ResponseError(404, "Data lamaran tidak ditemukan.");
        }

        const dataJson = application.toJSON();

        dataJson.coverLetterPublicUrl = `http://localhost:${process.env.APP_PORT}/uploads/coverLetter/${dataJson.coverLetterUrl}`;

        dataJson.curriculumVitaePublicUrl = `http://localhost:${process.env.APP_PORT}/uploads/curriculumVitae/${dataJson.candidate.curriculumVitaeUrl}`;
        logger.info("Get Detail Application Success");
        res.status(200).json({
            success: true,
            message: "Detail Surat lamaran anda",
            data: dataJson,
        });
    } catch (error) {
        logger.error("Get Detail Application Failed", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
