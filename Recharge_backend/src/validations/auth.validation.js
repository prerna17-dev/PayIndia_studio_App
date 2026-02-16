const Joi = require("joi");

exports.sendOtpSchema = Joi.object({
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid mobile number",
      "any.required": "Mobile number is required",
    }),
});

exports.verifyOtpSchema = Joi.object({
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required(),

  otp: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "string.length": "OTP must be 6 digits",
      "string.pattern.base": "OTP must be numeric",
    }),
});
