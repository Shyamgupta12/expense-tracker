import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { idempotency } from "../middleware/idempotency";

const router = Router();

/* ------------------------------------------------------------------ */
/*  Validation schema                                                  */
/* ------------------------------------------------------------------ */

const createExpenseSchema = z.object({
    amount: z
        .number({ required_error: "amount is required" })
        .positive("amount must be greater than 0"),
    category: z
        .string({ required_error: "category is required" })
        .min(1, "category is required"),
    description: z.string().default(""),
    date: z
        .string({ required_error: "date is required" })
        .min(1, "date is required")
        .refine((v) => !isNaN(Date.parse(v)), "date must be a valid ISO string"),
});

/* ------------------------------------------------------------------ */
/*  POST /expenses                                                     */
/* ------------------------------------------------------------------ */

router.post(
    "/",
    idempotency(),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = createExpenseSchema.parse(req.body);

            const amountPaise = Math.round(data.amount * 100);

            const expense = await prisma.expense.create({
                data: {
                    amountPaise,
                    category: data.category,
                    description: data.description,
                    date: new Date(data.date),
                },
            });

            res.status(201).json({
                id: expense.id,
                amount: expense.amountPaise / 100,
                amountPaise: expense.amountPaise,
                category: expense.category,
                description: expense.description,
                date: expense.date.toISOString(),
                createdAt: expense.createdAt.toISOString(),
            });
        } catch (error) {
            next(error);
        }
    }
);

/* ------------------------------------------------------------------ */
/*  GET /expenses                                                      */
/* ------------------------------------------------------------------ */

router.get(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { category } = req.query;

            const where: Record<string, unknown> = {};
            if (category && typeof category === "string") {
                where.category = category;
            }

            const expenses = await prisma.expense.findMany({
                where,
                orderBy: { date: "desc" },
            });

            const totalPaise = expenses.reduce((sum, e) => sum + e.amountPaise, 0);

            res.json({
                expenses: expenses.map((e) => ({
                    id: e.id,
                    amount: e.amountPaise / 100,
                    amountPaise: e.amountPaise,
                    category: e.category,
                    description: e.description,
                    date: e.date.toISOString(),
                    createdAt: e.createdAt.toISOString(),
                })),
                total: totalPaise / 100,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
