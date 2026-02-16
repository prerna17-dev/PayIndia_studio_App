module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: "You do not have permission to access this resource" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: "Role validation failed" });
    }
  };
};
