const validateFields = (req, res, next) => {
  const requiredFields = ["type", "description", "value", "category"];
  const validTypes = ["gasto", "recebimento"];
  const validCategories = ["alimentação", "roupas", "eletronicos", "outros"];

  const missingFields = requiredFields.filter(
    (field) => !req.body.hasOwnProperty(field)
  );
  const extraFields = Object.keys(req.body).filter(
    (field) => !requiredFields.includes(field)
  );
  if (missingFields.length > 0) {
    return res
      .status(400)
      .json({ message: `Missing fields: ${missingFields.join(", ")}` });
  }
  if (extraFields.length > 0) {
    return res
      .status(400)
      .json({ message: `Extra fields: ${extraFields.join(", ")}` });
  }
  if (!validTypes.includes(req.body.type)) {
    return res.status(400).json({ message: `Invalid type: ${req.body.type}` });
  }
  if (typeof req.body.description !== "string") {
    return res
      .status(400)
      .json({ message: `Invalid description: ${req.body.description}` });
  }
  if (typeof req.body.value !== "number") {
    return res
      .status(400)
      .json({ message: `Invalid value: ${req.body.value}` });
  }
  if (!validCategories.includes(req.body.category)) {
    return res
      .status(400)
      .json({ message: `Invalid category: ${req.body.category}` });
  }
  next();
};

module.exports = { validateFields };
