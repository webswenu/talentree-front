/**
 * Utilidades para traducir errores del backend a mensajes legibles por el usuario.
 *
 * El backend responde los errores de negocio en `response.data.message`, ya sea
 * como texto o como arreglo de textos (validaciones de class-validator).
 * Sin esta extracción, un error de axios se muestra con su mensaje crudo
 * ("Request failed with status code 400"), que no le dice nada al usuario.
 */

interface ApiErrorShape {
    response?: {
        status?: number;
        // Nest responde un objeto, pero un proxy o gateway intermedio puede
        // devolver texto plano.
        data?: { message?: string | string[] } | string;
    };
    code?: string;
}

/** Saca el texto del cuerpo de la respuesta, venga como string o como arreglo. */
const extraerMensaje = (
    data: { message?: string | string[] } | string | undefined
): string | undefined => {
    if (typeof data === "string") {
        return data.trim() !== "" ? data : undefined;
    }

    const message = data?.message;

    if (typeof message === "string" && message.trim() !== "") return message;
    if (Array.isArray(message) && message.length > 0) return message.join(". ");

    return undefined;
};

/**
 * Obtiene el mensaje de error legible de una excepción de axios.
 * @param err Error capturado
 * @param fallback Texto a mostrar cuando el backend no entrega un motivo
 * @returns Mensaje listo para mostrar al usuario
 */
/**
 * Un fallo de red o un tiempo agotado, que en axios NO traen `response`.
 *
 * Verificado en produccion el 19-08-2026 simulando la caida de la red: la
 * pantalla mostraba "No pudimos cargar los candidatos" y debajo, en ingles y
 * crudo, "Network Error". La rama que ya existia para esto (`!response`) vive
 * dentro de `if ("response" in err)`, y en un error de red axios nunca crea esa
 * propiedad: la condicion es falsa y se cae hasta `err.message`.
 */
const fallaDeRed = (err: unknown): string | null => {
    if (!err || typeof err !== "object") return null;

    const e = err as { code?: string; message?: string; response?: unknown };

    if (e.code === "ECONNABORTED" || /timeout/i.test(e.message ?? "")) {
        return "La operación tardó demasiado y se canceló. Vuelve a intentarlo.";
    }

    if (e.code === "ERR_NETWORK" || e.message === "Network Error") {
        return "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.";
    }

    return null;
};

export const getApiErrorMessage = (err: unknown, fallback: string): string => {
    const red = fallaDeRed(err);
    if (red) return red;

    if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as ApiErrorShape;

        // Sin respuesta del servidor: problema de red, DNS, CORS o backend caído
        if (!axiosError.response) {
            return "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.";
        }

        const status = axiosError.response.status ?? 0;

        // P-72. Un 4xx trae una validación útil que conviene mostrar. Un 5xx,
        // en cambio, trae el error interno del servidor, en inglés y sin nada
        // accionable: "Internal server error", "connect ECONNREFUSED". Al
        // usuario le sirve saber que el problema no es suyo y que sus datos
        // siguen ahí.
        if (status >= 500) {
            return "No pudimos completar la operación. El problema es nuestro, no tuyo: tus datos siguen aquí. Intenta nuevamente en unos minutos.";
        }

        // P-78. El 403 se presentaba como un listado vacío, sin decir nada.
        if (status === 403) {
            const propio = extraerMensaje(axiosError.response.data);
            return (
                propio ??
                "No tienes permiso para ver esta información. Si crees que deberías tenerlo, contacta al administrador."
            );
        }

        const data = axiosError.response.data;

        if (typeof data === "string") {
            if (data.trim() !== "") return data;
        } else {
            const message = data?.message;

            if (typeof message === "string" && message.trim() !== "") {
                return message;
            }

            if (Array.isArray(message) && message.length > 0) {
                return message.join(". ");
            }
        }
    }

    if (err instanceof Error && err.message && !/^Request failed with status code/i.test(err.message)) {
        return err.message;
    }

    return fallback;
};
