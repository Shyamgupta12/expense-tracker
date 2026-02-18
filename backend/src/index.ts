import express from "express";
import cors from "cors";
import expenseRoutes from "./routes/expenses";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.use(cors());
app.use(express.json());

app.use("/expenses", expenseRoutes);

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use(errorHandler);

app.listen(PORT, () => {
    process.stdout.write(`Server running on http://localhost:${PORT}\n`);
});

export default app;
