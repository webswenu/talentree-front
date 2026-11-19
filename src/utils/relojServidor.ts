/**
 * Hora del servidor vista desde el navegador.
 *
 * El temporizador de los tests comparaba `Date.now()` —el reloj del equipo del
 * candidato— contra `startedAt`, que pone el servidor. Si el PC iba adelantado
 * más que la duración del test, el test se daba por vencido al abrirse y se
 * enviaba solo, vacío, en un segundo. Le pasó a una candidata real el
 * 19-11-2026 con DISC, IC e IL: tres informes sin un solo dato.
 *
 * Cada respuesta del API ya trae `timestamp` con la hora del servidor (lo pone
 * `TransformResponseInterceptor`). Con eso se estima el desfase del reloj
 * local y todo cálculo contra horas del servidor usa `ahoraServidor()`.
 */

let desfaseMs: number | null = null;
let mejorIdaYVueltaMs = Number.POSITIVE_INFINITY;

/**
 * Registra una muestra. Se queda con la de menor ida y vuelta, que es la que
 * menos error mete al suponer que el servidor respondió a mitad de camino.
 */
export const registrarHoraServidor = (
    timestampServidor: unknown,
    enviadoEn: number | undefined,
    recibidoEn: number
): void => {
    if (typeof timestampServidor !== "string") return;
    const horaServidor = Date.parse(timestampServidor);
    if (Number.isNaN(horaServidor)) return;

    const inicio = typeof enviadoEn === "number" ? enviadoEn : recibidoEn;
    const idaYVuelta = Math.max(0, recibidoEn - inicio);
    if (desfaseMs !== null && idaYVuelta > mejorIdaYVueltaMs) return;

    mejorIdaYVueltaMs = idaYVuelta;
    desfaseMs = horaServidor - (inicio + idaYVuelta / 2);
};

/** `Date.now()` corregido a la hora del servidor (o el local, si aún no hay muestra). */
export const ahoraServidor = (): number => Date.now() + (desfaseMs ?? 0);

/**
 * Si ya hubo al menos una respuesta del API. Antes de eso `ahoraServidor()`
 * es el reloj local sin corregir, y no sirve para decidir que un test venció.
 */
export const hayHoraServidor = (): boolean => desfaseMs !== null;

/** Solo para pruebas. */
export const reiniciarRelojServidor = (): void => {
    desfaseMs = null;
    mejorIdaYVueltaMs = Number.POSITIVE_INFINITY;
};
