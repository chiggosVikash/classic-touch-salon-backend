import Joi from 'joi';

export const adminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  number: Joi.string().required(),
  password: Joi.string().min(6).required()
});

export const employeeSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional().allow("").empty(""),
  number: Joi.string(),
  gender: Joi.string(),
});

export const serviceSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().optional().allow("").empty(""),
});

export const billSchema = Joi.object({
  employeeId: Joi.string().required(),
  serviceIds: Joi.array().items(Joi.string().required()).min(1).required(),
  amount: Joi.number().min(0).required(),
  tipAmount: Joi.number().min(0).default(0),
  discountAmount: Joi.number().min(0).default(0),
  paymentMode: Joi.string().valid('cash', 'online').required(),
  paymentDate: Joi.string().required(),
  customerName: Joi.string().optional().allow("").empty(""),
  customerPhoneNumber: Joi.string().optional().allow("").empty(""),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
