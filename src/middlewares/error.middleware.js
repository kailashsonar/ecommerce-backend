import ApiError from "../utils/ApiError.js";
import { ZodError } from "zod";

const errorMiddleware = (error, req, res, next) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors = [];

    if (error instanceof ApiError) {
        statusCode = error.statusCode;
        message = error.message;
        errors = error.errors || [];
    }
    else if (error.name === "ValidationError") {
        statusCode = 400;
        message = error.message;
        errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
        }));
    }
    else if (error instanceof ZodError) {
        statusCode = 400;
        message = error?.issues[0]?.message || "Validation Error";
        
        errors = error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));
    }
    else if (error.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired, please login again";
    }
    else if (error.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid authentication token";
    }

    const response = {
        status: false,
        message,
        errors
    };

    return res.status(statusCode).json(response);
}


export default errorMiddleware;