/**
 * Puente para avisar desde fuera de React.
 *
 * El sistema de avisos vive en un contexto de React (ToastContext), así que
 * solo se puede usar desde componentes. El interceptor de axios, en cambio, es
 * código de módulo: corre fuera del árbol y no puede llamar a un hook.
 *
 * Sin este puente, la única forma de avisar de un 403 desde el interceptor
 * sería un `alert()`, que bloquea, o no avisar nada, que es justo el defecto
 * que se está corrigiendo (P-78).
 *
 * El proveedor registra su función al montarse; si nadie la registró todavía,
 * el aviso cae al log y no rompe nada.
 */

type Aviso = (mensaje: string) => void;

let mostrarError: Aviso | null = null;

/** Lo llama ToastProvider al montarse. */
export const registrarAvisoDeError = (fn: Aviso): void => {
    mostrarError = fn;
};

export const desregistrarAvisoDeError = (): void => {
    mostrarError = null;
};

/**
 * Evita repetir el mismo aviso cuando una pantalla dispara varias peticiones a
 * la vez: sin esto, un panel con cinco consultas mostraría cinco avisos
 * idénticos de golpe.
 */
let ultimoMensaje = "";
let ultimoInstante = 0;
const VENTANA_ANTIRREPETICION_MS = 3000;

export const avisarError = (mensaje: string): void => {
    const ahora = Date.now();

    if (
        mensaje === ultimoMensaje &&
        ahora - ultimoInstante < VENTANA_ANTIRREPETICION_MS
    ) {
        return;
    }

    ultimoMensaje = mensaje;
    ultimoInstante = ahora;

    if (mostrarError) {
        mostrarError(mensaje);
    } else {
        console.error("[aviso sin proveedor]", mensaje);
    }
};
