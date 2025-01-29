import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { v4 as uuidv4 } from 'uuid'; // For generating unique request IDs

export const validateRequest = (schema: ObjectSchema) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = uuidv4(); // Unique identifier for logs

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // Show all validation errors
    allowUnknown: false, // Prevent unknown fields
    stripUnknown: true, // Automatically remove unknown fields
  });

  if (error) {
    console.error(`[${requestId}] Validation Error:`, JSON.stringify(error.details));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map(({ message, path }) => ({
        field: path.join('.'),
        message,
      })),
    });
    return;
  }

  // Replace req.body with sanitized/validated data
  req.body = value;
  console.info(`[${requestId}] Validation Passed, Proceeding...`);
  next();
};
