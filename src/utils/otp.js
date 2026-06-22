/**
 * Genera un código OTP numérico de 6 dígitos.
 * @returns {string} OTP de 6 dígitos con padding de ceros si es necesario
 */
exports.generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return String(otp).padStart(6, '0');
};