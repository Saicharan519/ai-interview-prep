export function validate(zodSchema) {
  return (req, res, next) => {
    const validationResult = zodSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    req.body = validationResult.data;
    next();
  };
}
