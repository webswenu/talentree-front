export const formatRUT = (rut: string): string => {
    const cleaned = rut.replace(/[^0-9kK]/g, "");
    if (cleaned.length <= 1) return cleaned;

    const dv = cleaned.slice(-1);
    const number = cleaned.slice(0, -1);
    const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${formatted}-${dv}`;
};

export const validateRUT = (rut: string): boolean => {
    const cleaned = rut.replace(/[^0-9kK]/g, "");
    if (cleaned.length < 2) return false;

    const dv = cleaned.slice(-1).toUpperCase();
    const number = parseInt(cleaned.slice(0, -1), 10);

    let sum = 0;
    let multiplier = 2;

    for (let i = number.toString().length - 1; i >= 0; i--) {
        sum += parseInt(number.toString()[i], 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDV = 11 - (sum % 11);
    const calculatedDV =
        expectedDV === 11
            ? "0"
            : expectedDV === 10
            ? "K"
            : expectedDV.toString();

    return dv === calculatedDV;
};

export const formatDate = (date: string | Date): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const formatDateTime = (date: string | Date): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
    }).format(amount);
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("es-CL").format(num);
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
};

export const capitalize = (text: string): string => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatFullName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
};
