
const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),

  description: Joi.string().trim().allow('', null).optional(),

  team_id: Joi.number().integer().positive().required(),

  status: Joi.string()
    .valid('pending', 'in_progress', 'completed')
    .default('pending'),

  assigned_to: Joi.number().integer().positive().allow(null).optional(),

  due_date: Joi.date().iso().allow(null).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),

  description: Joi.string().trim().allow('', null).optional(),

  status: Joi.string()
    .valid('pending', 'in_progress', 'completed')
    .optional(),

  assigned_to: Joi.number().integer().positive().allow(null).optional(),

  due_date: Joi.date().iso().allow(null).optional(),
}).min(1);

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};
