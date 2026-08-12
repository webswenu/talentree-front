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

/**
 * Obtiene el mensaje de error legible de una excepción de axios.
 * @param err Error capturado
 * @param fallback Texto a mostrar cuando el backend no entrega un motivo
 * @returns Mensaje listo para mostrar al usuario
 */
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as ApiErrorShape;

        // Sin respuesta del servidor: problema de red, DNS, CORS o backend caído
        if (!axiosError.response) {
            return "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.";
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
