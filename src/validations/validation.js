import { ResponseError } from "../middleware/error.middleware.js";

const validated = (schema, request) => {
    const result = schema.validate(request, {
        errors: {
            allowUnknown: false,
            wrap: {
                label: "",
            },
        },
    });

    if (result.error) {
        throw new ResponseError(400, result.error.message);
    } else {
        return result.value;
    }
};

export { validated };
