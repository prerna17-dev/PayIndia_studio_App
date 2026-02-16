const Joi = require("joi");

exports.mobileRechargeSchema = Joi.object({
  number: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid mobile number",
    }),

  operator: Joi.string()
    .min(2)
    .max(50)
    .required(),

  amount: Joi.number()
    .positive()
    .min(1)
    .required()
    .messages({
      "number.base": "Amount must be numeric",
      "number.positive": "Amount must be greater than 0",
    }),
});
