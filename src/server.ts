import express from "express";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import { CategoryController } from "./controllers/CategoryController";
import { LoginController } from "./controllers/LoginController";
import { expensesRouter } from "./routes/expenses";
const openapiDocument = yaml.load("./openapi.yaml");

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use(express.json());

app.use("/expenses", expensesRouter);

app.get("/categories", CategoryController.getAllCategories);

app.post("/signup", LoginController.signup);
app.post("/login", LoginController.login);

app.listen(3000, () =>
  console.log("🚀 Server ready at: http://localhost:3000")
);
