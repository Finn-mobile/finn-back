import express from "express";
import { authMiddleware } from "../controllers/authMiddleware";
import { ExpenseController } from "../controllers/ExpenseController";
const router = express.Router();

router.use(authMiddleware);
router.get("/", ExpenseController.getAllExpenses);
router.post("/", ExpenseController.postExpense);
router.get("/:id", ExpenseController.getExpenseById);
router.put("/:id", ExpenseController.updateExpense);
router.delete("/:id", ExpenseController.deleteExpense);
router.post(
  "/input",
  ExpenseController.expenseInputMiddleware,
  ExpenseController.postExpense
);

export { router as expensesRouter };
