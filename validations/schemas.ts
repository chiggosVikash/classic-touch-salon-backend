import Joi from 'joi';

export const adminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  number: Joi.string().required(),
  password: Joi.string().min(6).required()
});

export const employeeSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email(),
  number: Joi.string(),
  gender: Joi.string(),
});

export const serviceSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().required(),
});

export const billSchema = Joi.object({
  employeeId: Joi.string().required(),
  services: Joi.array().items(Joi.string().required()).min(1).required(),
  amount: Joi.number().min(0).required(),
  tip: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
  paymentMethod: Joi.string().valid('cash', 'online').required(),
  date: Joi.date().default(() => new Date(),),
  user: Joi.object({
    name: Joi.string().optional(),
    number: Joi.number().optional(),
  }).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
