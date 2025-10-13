/**
 * Valida un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida un teléfono chileno
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+?56)?(\s?)(0?9)(\s?)[98765432]\d{7}$/;
  return phoneRegex.test(phone);
};

/**
 * Valida una contraseña fuerte
 */
export const isStrongPassword = (password: string): boolean => {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

/**
 * Valida que un campo no esté vacío
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Valida la longitud mínima de un texto
 */
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

/**
 * Valida la longitud máxima de un texto
 */
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

/**
 * Valida que un número esté en un rango
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Valida que sea un número
 */
export const isNumber = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Valida que sea un entero
 */
export const isInteger = (value: any): boolean => {
  return Number.isInteger(Number(value));
};

/**
 * Valida que sea positivo
 */
export const isPositive = (value: number): boolean => {
  return value > 0;
};
