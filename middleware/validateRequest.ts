import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

export const validateRequest = (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction): void => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  console.log("Schema validation error",error);
  if (error) {
    res.status(400).json({ errors: error.details.map((detail) => detail.message) });
  } else {
    next();
  }
};
