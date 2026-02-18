import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { createExpense } from "../api/expenses";
import { CreateExpensePayload } from "../types";

const CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Bills",
    "Health",
    "Education",
    "Other",
];

interface Props {
    onExpenseCreated: () => void;
}

export default function ExpenseForm({ onExpenseCreated }: Props) {
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const idempotencyKeyRef = useRef(uuidv4());

    const resetForm = useCallback(() => {
        setAmount("");
        setCategory("");
        setDescription("");
        setDate(new Date().toISOString().slice(0, 10));
        setError(null);
        setSuccess(false);
        idempotencyKeyRef.current = uuidv4();
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);
            setSuccess(false);

            const parsedAmount = parseFloat(amount);
            if (!parsedAmount || parsedAmount <= 0) {
                setError("Amount must be greater than 0");
                return;
            }
            if (!category) {
                setError("Category is required");
                return;
            }
            if (!date) {
                setError("Date is required");
                return;
            }

            const payload: CreateExpensePayload = {
                amount: parsedAmount,
                category,
                description,
                date: new Date(date).toISOString(),
            };

            setSubmitting(true);

            try {
                await createExpense(payload, idempotencyKeyRef.current);
                setSuccess(true);
                onExpenseCreated();
                setTimeout(() => {
                    resetForm();
                }, 800);
            } catch (err: unknown) {
                if (err && typeof err === "object" && "response" in err) {
                    const axiosErr = err as { response?: { data?: { error?: string; details?: Array<{ message: string }> } } };
                    const data = axiosErr.response?.data;
                    if (data?.details) {
                        setError(data.details.map((d) => d.message).join(", "));
                    } else if (data?.error) {
                        setError(data.error);
                    } else {
                        setError("Failed to create expense");
                    }
                } else {
                    setError("Network error. Please try again.");
                }
            } finally {
                setSubmitting(false);
            }
        },
        [amount, category, description, date, onExpenseCreated, resetForm]
    );

    return (
        <form className="expense-form" onSubmit={handleSubmit}>
            <h2>Add Expense</h2>

            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">Expense added!</div>}

            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="expense-amount">Amount (₹)</label>
                    <input
                        id="expense-amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={submitting}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="expense-category">Category</label>
                    <select
                        id="expense-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={submitting}
                        required
                    >
                        <option value="" disabled>
                            Select category
                        </option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="expense-date">Date</label>
                    <input
                        id="expense-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={submitting}
                        required
                    />
                </div>

                <div className="form-group full-width">
                    <label htmlFor="expense-description">Description</label>
                    <input
                        id="expense-description"
                        type="text"
                        placeholder="What did you spend on?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={submitting}
                    />
                </div>
            </div>

            <button
                id="submit-expense"
                type="submit"
                className="btn-primary"
                disabled={submitting}
            >
                {submitting ? (
                    <span className="btn-loading">
                        <span className="spinner" />
                        Adding...
                    </span>
                ) : (
                    "Add Expense"
                )}
            </button>
        </form>
    );
}
