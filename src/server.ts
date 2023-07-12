import { PrismaClient } from "@prisma/client";
import { ExpenseController } from "./controllers/ExpenseController";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get("/expenses", ExpenseController.getAllExpenses);

app.get("/expenses/:id", ExpenseController.getExpenseById);

app.post("/expenses", ExpenseController.postExpense);

app.get("/categories", async (req, res) => {
  const allCategories = await prisma.category.findMany();
  res.json(allCategories);
});

app.listen(3000, () =>
  console.log("🚀 Server ready at: http://localhost:3000")
);
