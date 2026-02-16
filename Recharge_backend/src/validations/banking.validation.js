const Joi = require("joi");

exports.addBankAccountSchema = Joi.object({
  bank_id: Joi.number().integer().required(),

  account_number: Joi.string()
    .min(9)
    .max(20)
    .required(),

  account_holder_name: Joi.string()
    .min(3)
    .max(100)
    .required(),

  ifsc_code: Joi.string()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid IFSC code",
    }),

  linked_mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional(),
});

exports.moneyTransferSchema = Joi.object({
  account_id: Joi.number().integer().required(),

  amount: Joi.number()
    .positive()
    .min(1)
    .required()
    .messages({
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be greater than 0",
    }),
});
