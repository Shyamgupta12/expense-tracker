import axios from "axios";
import { CreateExpensePayload, Expense, ExpensesResponse } from "../types";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "Content-Type": "application/json" },
});

export async function createExpense(
    payload: CreateExpensePayload,
    idempotencyKey: string
): Promise<Expense> {
    const response = await api.post<Expense>("/expenses", payload, {
        headers: { "Idempotency-Key": idempotencyKey },
    });
    return response.data;
}

export async function getExpenses(category?: string): Promise<ExpensesResponse> {
    const params: Record<string, string> = {};
    if (category) {
        params.category = category;
    }
    const response = await api.get<ExpensesResponse>("/expenses", { params });
    return response.data;
}
