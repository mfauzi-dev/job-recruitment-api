import Joi from "joi";

const createCompanyValidation = Joi.object({
    name: Joi.string().min(4).max(255).required().messages({
        "any.required": `Nama perusahaan wajib diisi`,
    }),
    website: Joi.string().min(4).max(255).required().messages({
        "any.required": `Website perusahaan wajib diisi`,
    }),
    description: Joi.string().min(4).max(5000).required().messages({
        "any.required": `Deskripsi perusahaan wajib diisi`,
    }),
});

const updateCompanyValidation = Joi.object({
    name: Joi.string().min(4).max(255).optional(),
    website: Joi.string().min(4).max(255).optional(),
    description: Joi.string().min(4).max(5000).optional(),
});

export { createCompanyValidation, updateCompanyValidation };
