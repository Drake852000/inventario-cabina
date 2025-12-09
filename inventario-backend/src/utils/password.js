function esPasswordFuerte(password) {
  // Al menos: 8 caracteres, 1 minúscula, 1 mayúscula, 1 número, 1 símbolo
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

module.exports = { esPasswordFuerte };
