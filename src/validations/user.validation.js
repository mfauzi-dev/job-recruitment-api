import Joi from "joi";

const updatePasswordValidation = Joi.object({
    oldPassword: Joi.string().min(4).max(25).required().messages({
        "any.required": `Password lama wajib diisi`,
    }),
    newPassword: Joi.string().min(4).max(25).required().messages({
        "any.required": `Password baru wajib diisi`,
    }),
    confirmPassword: Joi.string().min(4).max(25).required().messages({
        "any.required": `Konfirmasi password wajib diisi`,
    }),
});

const updateProfileValidation = Joi.object({
    name: Joi.string().min(4).max(191).optional().messages({
        "any.required": `Nama wajib diisi`,
    }),
});

export { updatePasswordValidation, updateProfileValidation };
