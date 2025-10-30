export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(\+?56)?(\s?)(0?9)(\s?)[98765432]\d{7}$/;
    return phoneRegex.test(phone);
};

export const isStrongPassword = (password: string): boolean => {
    const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
};

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
