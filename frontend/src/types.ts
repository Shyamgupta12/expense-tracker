export interface Expense {
    id: string;
    amount: number;
    amountPaise: number;
    category: string;
    description: string;
    date: string;
    createdAt: string;
}

export interface ExpensesResponse {
    expenses: Expense[];
    total: number;
}

export interface CreateExpensePayload {
    amount: number;
    category: string;
    description: string;
    date: string;
}
