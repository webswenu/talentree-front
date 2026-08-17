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

/**
 * P-47. Las fechas se mostraban UN DÍA ANTES del real.
 *
 * `new Date("2026-08-17")` —una fecha sin hora, que es como las devuelve el
 * backend para contractStartDate, appliedAt, birthDate, etc.— se interpreta
 * como medianoche UTC. En Chile (UTC-3 o UTC-4) eso cae a las 21:00 del día
 * ANTERIOR, y al formatear en horario local se muestra el 16.
 *
 * Una fecha sin hora no representa un instante, sino un día del calendario:
 * hay que construirla como local, no convertirla desde UTC.
 */
const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export const aFechaLocal = (date: string | Date): Date => {
    if (date instanceof Date) return date;

    // Acepta también "2026-08-17T00:00:00.000Z" recortando la parte de hora
    // cuando esta es exactamente medianoche UTC, que es como el backend
    // serializa las columnas de tipo `date`.
    const soloDia = date.length > 10 && date.endsWith("T00:00:00.000Z")
        ? date.slice(0, 10)
        : date;

    if (SOLO_FECHA.test(soloDia)) {
        const [anio, mes, dia] = soloDia.split("-").map(Number);
        return new Date(anio, mes - 1, dia);
    }

    return new Date(date);
};

export const formatDate = (date: string | Date): string => {
    const d = aFechaLocal(date);
    return d.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

/** Formato corto (17-08-2026), para tablas donde el mes en letras no cabe. */
export const formatDateShort = (date: string | Date): string => {
    return aFechaLocal(date).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const formatDateTime = (date: string | Date): string => {
    // Aquí sí hay hora, así que la conversión de zona es correcta.
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString("es-CL", {
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
