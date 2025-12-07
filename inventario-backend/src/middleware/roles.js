module.exports = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ msg: 'No tienes permisos' });
    }
    next();
  };
};
