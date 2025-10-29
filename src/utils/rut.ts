/**
 * Utilidades para validación de RUT chileno
 */

/**
 * Formatea un RUT agregando puntos y guión
 * @param rut RUT sin formato (solo números y K)
 * @returns RUT formateado (ej: 12.345.678-9)
 */
export const formatRut = (rut: string): string => {
  // Eliminar caracteres no válidos
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  
  if (cleanRut.length < 2) return cleanRut;
  
  // Separar número y dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  // Agregar puntos cada 3 dígitos desde la derecha
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${dv}`;
};

/**
 * Limpia un RUT dejando solo números y K
 * @param rut RUT con o sin formato
 * @returns RUT sin formato (ej: 12345678-9)
 */
export const cleanRut = (rut: string): string => {
  // Eliminar puntos y dejar solo números, guión y K
  const cleaned = rut.replace(/\./g, '').replace(/[^0-9kK-]/g, '');
  return cleaned.toUpperCase();
};

/**
 * Valida el dígito verificador de un RUT chileno
 * @param rut RUT completo (con o sin formato)
 * @returns true si el RUT es válido
 */
export const validateRut = (rut: string): boolean => {
  // Limpiar el RUT
  const cleanedRut = cleanRut(rut);
  
  // Validar formato básico (7-8 dígitos + guión + dígito verificador)
  if (!/^[0-9]{7,8}-[0-9kK]$/.test(cleanedRut)) {
    return false;
  }
  
  // Separar número y dígito verificador
  const [body, dv] = cleanedRut.split('-');
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  // Recorrer de derecha a izquierda
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDv = 11 - (sum % 11);
  let calculatedDv: string;
  
  if (expectedDv === 11) {
    calculatedDv = '0';
  } else if (expectedDv === 10) {
    calculatedDv = 'K';
  } else {
    calculatedDv = expectedDv.toString();
  }
  
  // Comparar con el dígito verificador proporcionado
  return calculatedDv === dv.toUpperCase();
};

/**
 * Obtiene mensaje de error para un RUT inválido
 * @param rut RUT a validar
 * @returns Mensaje de error o null si es válido
 */
export const getRutError = (rut: string): string | null => {
  if (!rut || rut.trim() === '') {
    return 'El RUT es requerido';
  }
  
  const cleanedRut = cleanRut(rut);
  
  if (!/^[0-9]{7,8}-[0-9kK]$/.test(cleanedRut)) {
    return 'Formato de RUT inválido (ej: 12345678-9)';
  }
  
  if (!validateRut(rut)) {
    return 'RUT inválido (dígito verificador incorrecto)';
  }
  
  return null;
};

