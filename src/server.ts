import { ExpenseController } from "./controllers/ExpenseController";
import { CategoryController } from "./controllers/CategoryController";
import express from "express";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
const openapiDocument = yaml.load("./openapi.yaml");

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use(express.json());

app.get("/expenses", ExpenseController.getAllExpenses);
app.post("/expenses", ExpenseController.postExpense);
app.get("/expenses/:id", ExpenseController.getExpenseById);
app.put("/expenses/:id", ExpenseController.updateExpense);
app.delete("/expenses/:id", ExpenseController.deleteExpense);

app.get("/categories", CategoryController.getAllCategories);

app.listen(3000, () =>
  console.log("🚀 Server ready at: http://localhost:3000")
);
