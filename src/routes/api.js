import express from "express";
import { getUserProfile, updatePassword, updateProfile } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { sendVerificationToken, verifyEmail } from "../controllers/auth.controller.js";

import { upload } from "../middleware/upload.middleware.js";
import { createCompany, deleteCompany, detailCompany, updateCompany } from "../controllers/company.controller.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { createJob, deleteJob, detailJob, getAllJobs, updateJob } from "../controllers/job.controller.js";
import {
    createApplication,
    detailApplication,
    getAllApplicantion,
    updateStatusApplication,
} from "../controllers/application.controller.js";

const routes = express.Router();

routes.get("/users/me", authenticate, getUserProfile);
routes.patch("/users/password", authenticate, updatePassword);
routes.patch("/users/profile", authenticate, upload.single("curriculumVitae"), updateProfile);

routes.post("/users/verification/resend", authenticate, sendVerificationToken);
routes.post("/users/verification/verify", authenticate, verifyEmail);

// Company
routes.post(
    "/company",
    authenticate,
    authorizeRoles("company"),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    createCompany,
);
routes.get("/company", authenticate, authorizeRoles("company"), detailCompany);
routes.patch(
    "/company",
    authenticate,
    authorizeRoles("company"),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    updateCompany,
);
routes.delete("/company", authenticate, authorizeRoles("company"), deleteCompany);

// Job
routes.post("/company/job", authenticate, authorizeRoles("company"), createJob);
routes.get("/company/job", authenticate, authorizeRoles("company"), getAllJobs);
routes.get("/company/job/:id", authenticate, authorizeRoles("company"), detailJob);
routes.patch("/company/job/:id", authenticate, authorizeRoles("company"), updateJob);
routes.delete("/company/job/:id", authenticate, authorizeRoles("company"), deleteJob);

// Application
routes.post(
    "/company/job/:id/applicants",
    authenticate,
    authorizeRoles("candidate"),
    upload.single("coverLetter"),
    createApplication,
);

routes.get("/company/job/:id/applicants", authenticate, authorizeRoles("company"), getAllApplicantion);
routes.patch(
    "/company/job/:jobId/applicants/:applicationId",
    authenticate,
    authorizeRoles("company"),
    updateStatusApplication,
);
routes.get(
    "/company/job/:jobId/applicants/:applicationId",
    authenticate,
    authorizeRoles("candidate"),
    detailApplication,
);

export { routes };
