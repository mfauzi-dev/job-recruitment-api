import Joi from "joi";

const createApplicationValidation = Joi.object({
    status: Joi.string()
        .valid("pending", "accepted", "rejected")
        .default("pending")
        .optional(),
});

const updateApplicationValidation = Joi.object({
    status: Joi.string().valid("pending", "accepted", "rejected").optional(),
});

export { createApplicationValidation, updateApplicationValidation };
