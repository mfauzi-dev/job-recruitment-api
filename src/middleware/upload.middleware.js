import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = "uploads/";

        if (file.fieldname === "logo") {
            folder = "uploads/logo/";
        }
        if (file.fieldname === "thumbnail") {
            folder = "uploads/thumbnail/";
        }

        if (file.fieldname === "coverLetter") {
            folder = "uploads/coverLetter/";
        }

        if (file.fieldname === "curriculumVitae") {
            folder = "uploads/curriculumVitae/";
        }
        fs.mkdirSync(folder, { recursive: true });

        cb(null, folder);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Hanya file gambar dan PDF yang diperbolehkan!"), false);
    }
};

export const upload = multer({ storage, fileFilter });
