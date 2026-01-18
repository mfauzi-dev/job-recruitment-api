class ResponseError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const errorMiddleware = async (err, req, res, next) => {
    if (!err) {
        next();
        return;
    }

    if (err instanceof ResponseError) {
        res.status(err.status)
            .json({
                success: false,
                errors: err.message,
                data: null,
            })
            .end();
    } else {
        res.status(500)
            .json({
                success: false,
                errors: err.message,
                data: null,
            })
            .end();
    }
};

export { ResponseError };
