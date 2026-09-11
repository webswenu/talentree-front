export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Reglas de formato del registro.
 *
 * Estas funciones son el ESPEJO de las del backend
 * (common/validators/telefono.validator.ts y password.validator.ts). Cada una
 * devuelve el motivo concreto del rechazo, no solo un booleano, y el texto de
 * ayuda que ve la persona se deriva de la misma constante: asi la pantalla no
 * puede volver a prometer una regla distinta de la que aplica el servidor,
 * que era el origen de R-03.
 *
 * Si cambia una regla, cambia aqui y en su gemela del backend, y los tests de
 * los dos lados usan la misma tabla de casos.
 */

/** Digitos DESPUES del prefijo. 15 es el maximo de E.164. */
export const DIGITOS_MIN_TELEFONO = 8;
export const DIGITOS_MAX_TELEFONO = 15;

export const AYUDA_TELEFONO =
    "Con el prefijo del país. Puedes escribirlo con espacios: +56 9 1234 5678";

// Espacios, parentesis, puntos y todas las variantes de guion (U+2010 a U+2015),
// que es lo que aparece cuando alguien pega un telefono desde otro documento.
const SEPARADORES_TELEFONO = /[\s().\-‐-―]/g;

/**
 * Deja el telefono en su forma canonica: '+' y digitos. Es la que se envia y
 * la que se guarda. Acepta '00' como prefijo internacional.
 *
 * El bug R-04 era exactamente esto: la validacion miraba el valor sin espacios
 * y el envio mandaba el valor con espacios.
 */
export const normalizarTelefono = (valor: string): string => {
    const sinSeparadores = valor.trim().replace(SEPARADORES_TELEFONO, "");
    return sinSeparadores.replace(/^00/, "+");
};

/** Devuelve el motivo del rechazo, o null si el telefono sirve. */
export const mensajeDeTelefono = (valor: string): string | null => {
    const canonico = normalizarTelefono(valor);
    if (canonico === "") return null; // el telefono es opcional

    if (!canonico.startsWith("+")) {
        return "Falta el prefijo del país. Por ejemplo: +56 9 1234 5678";
    }

    const digitos = canonico.slice(1);
    if (!/^[0-9]+$/.test(digitos)) {
        return "El teléfono solo puede tener números después del prefijo.";
    }
    if (
        digitos.length < DIGITOS_MIN_TELEFONO ||
        digitos.length > DIGITOS_MAX_TELEFONO
    ) {
        return `El teléfono debe tener entre ${DIGITOS_MIN_TELEFONO} y ${DIGITOS_MAX_TELEFONO} dígitos después del prefijo.`;
    }
    return null;
};

export const isValidPhone = (phone: string): boolean =>
    mensajeDeTelefono(phone) === null;

/** Largo minimo de la contrasena. Igual que LARGO_MINIMO_PASSWORD del backend. */
export const LARGO_MINIMO_PASSWORD = 8;

export const AYUDA_PASSWORD =
    "Al menos 8 caracteres, con una mayúscula y un número.";

/** Misma lista que PASSWORDS_COMUNES del backend. Se comparan en minuscula. */
const PASSWORDS_COMUNES = new Set([
    "12345678",
    "123456789",
    "1234567890",
    "password",
    "password1",
    "contrasena",
    "qwertyui",
    "qwerty123",
    "abc12345",
    "talentree",
    "admin123",
    "iloveyou",
]);

/** Devuelve el motivo del rechazo, o null si la contrasena sirve. */
export const mensajeDePassword = (valor: string): string | null => {
    if (valor.length < LARGO_MINIMO_PASSWORD) {
        return `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`;
    }
    if (!/[a-zA-Z]/.test(valor)) {
        return "La contraseña debe incluir al menos una letra.";
    }
    if (!/[A-ZÁÉÍÓÚÑÜ]/.test(valor)) {
        return "La contraseña debe incluir al menos una letra mayúscula.";
    }
    if (!/[0-9]/.test(valor)) {
        return "La contraseña debe incluir al menos un número.";
    }
    if (PASSWORDS_COMUNES.has(valor.toLowerCase())) {
        return "Esa contraseña es demasiado común. Elige otra.";
    }
    return null;
};

export const isStrongPassword = (password: string): boolean =>
    mensajeDePassword(password) === null;

export const isRequired = (value: unknown): boolean => {
    if (typeof value === "string") {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
};

export const minLength = (value: string, min: number): boolean => {
    return value.length >= min;
};

export const maxLength = (value: string, max: number): boolean => {
    return value.length <= max;
};

export const isInRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
};

export const isNumber = (value: unknown): boolean => {
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value === "string") {
        const n = Number(value);
        return value.trim() !== "" && Number.isFinite(n);
    }
    return false;
};

export const isInteger = (value: unknown): boolean => {
    if (typeof value === "number") return Number.isInteger(value);
    if (typeof value === "string") {
        if (value.trim() === "") return false;
        const n = Number(value);
        return Number.isInteger(n);
    }
    return false;
};

export const isPositive = (value: number): boolean => {
    return value > 0;
};
