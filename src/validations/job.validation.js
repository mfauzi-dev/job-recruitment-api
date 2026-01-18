import Joi from "joi";

const createJobValidation = Joi.object({
    title: Joi.string().min(4).max(255).required().messages({
        "any.required": `Judul wajib diisi`,
    }),
    description: Joi.string().min(4).max(5000).required().messages({
        "any.required": `Deskripsi perusahaan wajib diisi`,
    }),
    location: Joi.string().min(4).max(1000).required().messages({
        "any.required": `Judul wajib diisi`,
    }),
    status: Joi.string().valid("open", "closed").optional(),
});

const updateJobValidation = Joi.object({
    title: Joi.string().min(4).max(255).optional(),
    description: Joi.string().min(4).max(5000).optional(),
    location: Joi.string().min(4).max(1000).optional(),
    status: Joi.string().valid("open", "closed").optional(),
});

export { createJobValidation, updateJobValidation };
