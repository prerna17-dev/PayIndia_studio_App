exports.now = () => new Date();

exports.addMinutes = (minutes) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
};

exports.formatDateTime = (date = new Date()) => {
  return date.toISOString().slice(0, 19).replace("T", " ");
};

exports.formatDateToMySQL = (dateStr) => {
  if (!dateStr || !dateStr.includes("/")) return dateStr;
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
};
