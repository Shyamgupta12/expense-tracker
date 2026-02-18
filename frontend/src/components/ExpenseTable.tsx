import { Expense } from "../types";

interface Props {
    expenses: Expense[];
}

export default function ExpenseTable({ expenses }: Props) {
    if (expenses.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No expenses yet. Add your first expense above!</p>
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table className="expense-table" id="expense-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th className="amount-col">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.id}>
                            <td className="date-cell">
                                {new Date(expense.date).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </td>
                            <td>
                                <span className="category-badge">{expense.category}</span>
                            </td>
                            <td className="description-cell">
                                {expense.description || "—"}
                            </td>
                            <td className="amount-cell">₹{expense.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
