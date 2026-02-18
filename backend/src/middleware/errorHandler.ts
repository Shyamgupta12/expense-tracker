import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface AppError extends Error {
    statusCode?: number;
}

export function errorHandler(
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof ZodError) {
        res.status(400).json({
            error: "Validation failed",
            details: err.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
        return;
    }

    const statusCode = err.statusCode ?? 500;
    const message =
        statusCode === 500 ? "Internal server error" : err.message;

    res.status(statusCode).json({ error: message });
}
