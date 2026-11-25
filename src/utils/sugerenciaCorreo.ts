/**
 * Detecta errores de tipeo frecuentes en el dominio del correo y propone la
 * version corregida. No bloquea nada: solo se muestra como sugerencia.
 *
 * Caso real (24-11-2026): "Juanperez@91gmail.com" en vez de
 * "juanperez91@gmail.com". La cuenta quedo con un dominio que no existe y
 * la persona no pudo volver a entrar ni recibir correos.
 */

const DOMINIOS_COMUNES = [
    "gmail.com",
    "hotmail.com",
    "hotmail.cl",
    "outlook.com",
    "outlook.cl",
    "live.cl",
    "live.com",
    "yahoo.com",
    "yahoo.es",
    "icloud.com",
];

const distancia = (a: string, b: string): number => {
    const fila = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
        let previo = fila[0];
        fila[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const temp = fila[j];
            fila[j] = Math.min(
                fila[j] + 1,
                fila[j - 1] + 1,
                previo + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
            previo = temp;
        }
    }
    return fila[b.length];
};

/** Devuelve el correo corregido, o null si no hay nada que sugerir. */
export const sugerirCorreo = (valor: string): string | null => {
    const correo = valor.trim().toLowerCase();
    const partes = correo.split("@");
    if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
    let [local, dominio] = partes;

    if (DOMINIOS_COMUNES.includes(dominio)) {
        return valor.trim() !== correo ? correo : null;
    }

    // "91gmail.com": numeros pegados al dominio, que iban antes de la @.
    const pegados = dominio.match(/^([0-9._-]+)(.+)$/);
    if (pegados && DOMINIOS_COMUNES.includes(pegados[2])) {
        return `${local}${pegados[1].replace(/[._-]+$/, "")}@${pegados[2]}`;
    }

    // "gmial.com", "gmail.co", "hotmal.com"...
    let mejor: string | null = null;
    let mejorDistancia = 3;
    for (const candidato of DOMINIOS_COMUNES) {
        const d = distancia(dominio, candidato);
        if (d < mejorDistancia) {
            mejor = candidato;
            mejorDistancia = d;
        }
    }
    if (mejor && mejorDistancia <= 2) {
        local = local.trim();
        return `${local}@${mejor}`;
    }
    return null;
};
