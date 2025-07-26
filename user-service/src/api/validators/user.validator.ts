import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional().allow('') 
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const updateUserSchema = Joi.object({
  fullName: Joi.string().min(3).max(50),
  phone: Joi.string().allow('')
}).min(1);