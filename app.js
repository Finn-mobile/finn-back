const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { validateFields } = require("./helper");
app.use(bodyParser.json());

let items = [
  {
    id: uuidv4(),
    type: "gasto",
    description: "Lanche",
    value: 25.0,
    category: "alimentação",
  },
];

app.get("/items", (req, res) => {
  res.json(items);
});

app.get("/items/:id", (req, res) => {
  const index = items.findIndex((item) => item.id === req.params.id);
  if (index !== -1) {
    res.json(items[index]);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

app.post("/items", validateFields, async (req, res) => {
  const newItem = { id: uuidv4(), ...req.body };
  items.push(newItem);
  res.status(201).json({ message: "Item created", item: newItem });
});

app.put("/items/:id", validateFields, async (req, res) => {
  const index = items.findIndex((item) => item.id === req.params.id);
  if (index !== -1) {
    const updated_item = { id: items[index].id, ...req.body };
    items[index] = updated_item;
    res.json({ message: "Item updated", item: updated_item });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

app.delete("/items/:id", (req, res) => {
  const index = items.findIndex((item) => item.id === req.params.id);
  if (index !== -1) {
    items.splice(index, 1);
    res.json({ message: "Item deleted" });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

app.listen(3000, () =>
  console.log("Server listening on port http://localhost:3000")
);
