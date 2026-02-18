import { useState, useEffect, useCallback } from "react";
import { getExpenses } from "./api/expenses";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseTable from "./components/ExpenseTable";
import CategoryFilter from "./components/CategoryFilter";
import { Expense } from "./types";

function getInitialCategory(): string {
    const params = new URLSearchParams(window.location.search);
    return params.get("category") || "";
}

export default function App() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [total, setTotal] = useState(0);
    const [category, setCategory] = useState(getInitialCategory);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchExpenses = useCallback(async (cat: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getExpenses(cat || undefined);
            setExpenses(data.expenses);
            setTotal(data.total);
        } catch {
            setError("Failed to load expenses. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses(category);
    }, [category, fetchExpenses]);

    const handleCategoryChange = useCallback((newCategory: string) => {
        setCategory(newCategory);
        const url = new URL(window.location.href);
        if (newCategory) {
            url.searchParams.set("category", newCategory);
        } else {
            url.searchParams.delete("category");
        }
        window.history.replaceState({}, "", url.toString());
    }, []);

    const handleExpenseCreated = useCallback(() => {
        fetchExpenses(category);
    }, [category, fetchExpenses]);

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <div className="header-title">
                        <span className="header-icon">💰</span>
                        <h1>Expense Tracker</h1>
                    </div>
                    <div className="total-display" id="total-display">
                        <span className="total-label">Total</span>
                        <span className="total-amount">₹{total.toFixed(2)}</span>
                    </div>
                </div>
            </header>

            <main className="app-main">
                <section className="form-section">
                    <ExpenseForm onExpenseCreated={handleExpenseCreated} />
                </section>

                <section className="list-section">
                    <div className="list-header">
                        <h2>Expenses</h2>
                        <CategoryFilter
                            value={category}
                            onChange={handleCategoryChange}
                        />
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner" />
                            <p>Loading expenses...</p>
                        </div>
                    ) : (
                        <ExpenseTable expenses={expenses} />
                    )}
                </section>
            </main>
        </div>
    );
}
