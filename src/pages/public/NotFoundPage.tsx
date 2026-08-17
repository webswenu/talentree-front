import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * P-56. Antes el contenido completo de esta página era el texto
 * "404 - Página No Encontrada", sin un solo enlace, sin botones y sin menú:
 * quien llegaba aquí quedaba encerrado y solo podía salir editando la URL.
 *
 * Es además la red de seguridad de P-68, donde las notificaciones del candidato
 * enlazaban a una ruta inexistente: aunque un enlace esté mal, nadie se queda
 * atrapado.
 */

/** El panel que le corresponde a cada rol, para ofrecer la vuelta a "su" casa. */
const PANEL_POR_ROL: Record<string, string> = {
    admin_talentree: "/admin",
    company: "/empresa",
    evaluator: "/evaluador",
    worker: "/trabajador",
    guest: "/invitado",
};

export const NotFoundPage = () => {
    const { user } = useAuthStore();
    const panel = user?.role ? PANEL_POR_ROL[user.role] : undefined;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-6xl font-bold text-primary-500 mb-2">404</p>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    No encontramos esta página
                </h1>
                <p className="text-gray-600 mb-8">
                    Puede que el enlace esté mal escrito, que la página se haya
                    movido o que ya no exista.
                </p>

                <div className="flex flex-col gap-3">
                    {/* Si hay sesión, lo más útil es su propio panel. */}
                    {panel && (
                        <Link
                            to={panel}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                            Ir a mi panel
                        </Link>
                    )}

                    <Link
                        to="/"
                        className={
                            panel
                                ? "px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                : "px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        }
                    >
                        Volver al inicio
                    </Link>

                    {/* Destino más probable de quien llega desde un correo. */}
                    <Link
                        to="/oportunidades"
                        className="text-sm text-secondary-700 hover:text-secondary-800 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 rounded"
                    >
                        Ver oportunidades laborales
                    </Link>
                </div>
            </div>
        </div>
    );
};
