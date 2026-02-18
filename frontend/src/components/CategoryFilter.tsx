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
    value: string;
    onChange: (category: string) => void;
}

export default function CategoryFilter({ value, onChange }: Props) {
    return (
        <div className="category-filter">
            <label htmlFor="filter-category">Filter by Category</label>
            <select
                id="filter-category"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>
        </div>
    );
}
