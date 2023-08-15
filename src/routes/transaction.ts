import express from "express";
import { authMiddleware } from "../controllers/authMiddleware";
import { TransactionController } from "../controllers/TransactionController";
const router = express.Router();

router.use(authMiddleware);
router.get("/", TransactionController.getAllTransactions);
router.post("/", TransactionController.postTransaction);
router.get("/:id", TransactionController.getTransactionById);
router.put("/:id", TransactionController.updateTransaction);
router.delete("/:id", TransactionController.deleteTransaction);
router.post(
  "/input",
  TransactionController.transactionInputMiddleware,
  TransactionController.postTransaction
);

export { router as transactionsRouter };
