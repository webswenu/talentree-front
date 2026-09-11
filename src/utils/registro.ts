/**
 * Limpieza del formulario antes de enviarlo (hallazgos R-01 y R-02).
 *
 * El formulario inicializa todos los campos en cadena vacia y envia el objeto
 * entero. `@IsOptional()` de class-validator solo salta `undefined` y `null`,
 * asi que `""` entraba al validador y fallaba: quien dejaba en blanco un campo
 * rotulado «opcional» —el telefono, la fecha de nacimiento— no podia
 * registrarse, y encima le decian que el formato era invalido cuando no habia
 * escrito nada.
 *
 * El backend tambien se corrigio (VacioComoAusente), a proposito: la API se
 * puede llamar sin pasar por esta pantalla. Esto evita el viaje inutil.
 */
export const limpiarOpcionales = <T extends Record<string, unknown>>(
    datos: T
): Partial<T> => {
    const limpio: Record<string, unknown> = {};

    for (const [campo, valor] of Object.entries(datos)) {
        if (typeof valor === "string") {
            const recortado = valor.trim();
            // Se omite el campo entero en vez de mandar "": para la API es la
            // diferencia entre «no lo llenó» y «lo llenó mal».
            if (recortado === "") continue;
            limpio[campo] = recortado;
            continue;
        }
        if (valor === undefined || valor === null) continue;
        limpio[campo] = valor;
    }

    return limpio as Partial<T>;
};
