import { getApiErrorMessage } from "../../utils/apiError";

interface Props {
    /** El error que devolvió react-query. */
    error: unknown;
    /** Qué se estaba intentando cargar, para el texto por defecto. */
    recurso: string;
    /** `refetch` de react-query. */
    onReintentar?: () => void;
}

/**
 * P-61. Los listados del panel consumían react-query sin mirar el estado de
 * error: cuando fallaba la conexión, la pantalla mostraba la lista vacía y el
 * mensaje "No hay resultados", indistinguible de un vacío legítimo. El
 * administrador concluía que se habían borrado los datos, y el error persistía
 * hasta que recargaba la página a mano.
 *
 * Dos cosas que este componente hace y el estado vacío no debe hacer:
 * decir que hubo un fallo, y ofrecer reintentar sin recargar.
 */
export const ListError = ({ error, recurso, onReintentar }: Props) => (
    <div
        role="alert"
        className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
        </div>

        <p className="text-red-800 font-medium mb-1">
            No pudimos cargar {recurso}
        </p>
        <p className="text-red-700 text-sm mb-4">
            {getApiErrorMessage(
                error,
                "Revisa tu conexión e intenta nuevamente."
            )}
        </p>

        {onReintentar && (
            <button
                type="button"
                onClick={onReintentar}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                Reintentar
            </button>
        )}
    </div>
);
