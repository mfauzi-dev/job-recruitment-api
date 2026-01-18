import Joi from "joi";

const registerValidation = Joi.object({
    name: Joi.string().min(4).max(191).required().messages({
        "any.required": `Nama wajib diisi`,
    }),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com"] } })
        .max(191)
        .required()
        .messages({
            "string.email": `Email harus dalam format yang benar.`,
            "any.required": `Email wajib diisi`,
        }),
    password: Joi.string().min(4).max(25).required().messages({
        "any.required": `Password wajib diisi`,
    }),
    confirmPassword: Joi.string().min(4).max(25).required(),
    roleName: Joi.string().valid("company", "candidate").required().messages({
        "any.only": "Role tidak valid. Hanya boleh Company atau Candidate",
        "any.required": `Password wajib diisi`,
    }),
});

const loginValidation = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com"] } })
        .max(191)
        .required()
        .messages({
            "string.email": `Email harus dalam format yang benar.`,
            "any.required": `Email wajib diisi`,
        }),
    password: Joi.string().min(4).max(25).required().messages({
        "any.required": `Password wajib diisi`,
    }),
});

export { registerValidation, loginValidation };
