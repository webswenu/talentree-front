import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { processInvitationsService } from "../../services/process-invitations.service";
import { workersService } from "../../services/workers.service";
import { useAuthStore } from "../../store/authStore";

export const InvitationAcceptedPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"accepting" | "loading_application" | "success" | "error">("accepting");
    const [errorMsg, setErrorMsg] = useState("");
    const hasAccepted = useRef(false);

    useEffect(() => {
        const acceptInvitation = async () => {
            if (!token) {
                setStatus("error");
                setErrorMsg("Token de invitación no encontrado");
                return;
            }

            // Prevenir doble ejecución (React 18 StrictMode)
            if (hasAccepted.current) {
                return;
            }
            hasAccepted.current = true;

            try {
                // 1. Aceptar la invitación
                const acceptResponse = await processInvitationsService.accept({ token });
                setStatus("loading_application");

                // 2. Obtener el processId de la respuesta
                const processId = acceptResponse.processId || acceptResponse.invitation.processId;

                if (!processId) {
                    throw new Error("No se pudo obtener el ID del proceso");
                }

                // 3. Obtener el workerId del usuario autenticado
                const workerId = user?.worker?.id;

                if (!workerId) {
                    // Si no hay workerId, redirigir al dashboard normal
                    console.warn("Usuario no tiene perfil de trabajador, redirigiendo al dashboard");
                    setTimeout(() => {
                        navigate("/dashboard");
                    }, 2000);
                    return;
                }

                // 4. Obtener todas las postulaciones del trabajador
                const workerProcesses = await workersService.getWorkerProcesses(workerId);

                // 5. Encontrar el WorkerProcess que corresponde a este proceso
                const workerProcess = workerProcesses.find(
                    wp => wp.process?.id === processId
                );

                if (!workerProcess) {
                    // Si no se encuentra, redirigir al dashboard de postulaciones
                    console.warn("No se encontró el WorkerProcess, redirigiendo a postulaciones");
                    setTimeout(() => {
                        navigate("/trabajador/postulaciones");
                    }, 2000);
                    return;
                }

                // 6. Redirigir al detalle de la postulación (donde está el VideoRequirementGate)
                setStatus("success");
                setTimeout(() => {
                    navigate(`/trabajador/postulaciones/${workerProcess.id}`);
                }, 2000);

            } catch (error) {
                console.error("Error accepting invitation:", error);
                setStatus("error");
                setErrorMsg(
                    error instanceof Error
                        ? error.message
                        : "Error al aceptar la invitación"
                );
                // Resetear el flag en caso de error para permitir reintentos
                hasAccepted.current = false;
            }
        };

        acceptInvitation();
    }, [token, navigate, user]);

    if (status === "accepting") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-6"></div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Aceptando invitación...
                        </h1>
                        <p className="text-gray-600">
                            Por favor espera un momento
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "loading_application") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-6"></div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Preparando tu postulación...
                        </h1>
                        <p className="text-gray-600">
                            Estamos cargando los detalles del proceso
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Error al aceptar invitación
                        </h1>
                        <p className="text-gray-600 mb-6">{errorMsg}</p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            Ir al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // status === "success"
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        ¡Invitación aceptada con éxito!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Ya estás postulado al proceso. Te llevaremos a los detalles de tu postulación...
                    </p>
                    <div className="animate-pulse text-teal-600 font-medium">
                        Redirigiendo en 2 segundos...
                    </div>
                </div>
            </div>
        </div>
    );
};
