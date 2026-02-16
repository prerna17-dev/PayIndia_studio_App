exports.calculateCommission = (amount, percentage) => {
  return Number(((amount * percentage) / 100).toFixed(2));
};
