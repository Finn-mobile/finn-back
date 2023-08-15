import express from "express";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import { CategoryController } from "./controllers/CategoryController";
import { LoginController } from "./controllers/LoginController";
import { transactionsRouter } from "./routes/transaction";
const openapiDocument = yaml.load("./openapi.yaml");

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use(express.json());

app.use("/transactions", transactionsRouter);

app.get("/categories", CategoryController.getAllCategories);

app.post("/signup", LoginController.signup);
app.post("/login", LoginController.login);

app.listen(3000, () => console.log("🚀 Server ready at: http://localhost:3000"));
