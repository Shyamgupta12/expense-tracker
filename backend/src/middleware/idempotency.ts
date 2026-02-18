import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

/**
 * Idempotency middleware for POST requests.
 *
 * Reads the `Idempotency-Key` header. If a record with that key already exists,
 * the cached response is returned immediately without executing the handler.
 * Otherwise, it intercepts `res.json()` to capture and persist the response
 * so subsequent retries with the same key return the original result.
 */
export function idempotency() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (req.method !== "POST") {
            next();
            return;
        }

        const idempotencyKey = req.headers["idempotency-key"];

        if (!idempotencyKey || typeof idempotencyKey !== "string") {
            res.status(400).json({ error: "Idempotency-Key header is required for POST requests" });
            return;
        }

        try {
            const existing = await prisma.idempotencyRecord.findUnique({
                where: { key: idempotencyKey },
            });

            if (existing) {
                res.status(existing.statusCode).json(JSON.parse(existing.responseBody));
                return;
            }

            const originalJson = res.json.bind(res);

            res.json = function (body: unknown): Response {
                const statusCode = res.statusCode;

                prisma.idempotencyRecord
                    .create({
                        data: {
                            key: idempotencyKey,
                            statusCode,
                            responseBody: JSON.stringify(body),
                        },
                    })
                    .catch(() => {
                        /* If the record already exists due to a race, that is fine. */
                    });

                return originalJson(body);
            };

            next();
        } catch (error) {
            next(error);
        }
    };
}
