export const validateFields = (requiredFields = []) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: missingFields,
      });
    }

    next();
  };
};
