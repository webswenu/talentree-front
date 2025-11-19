import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    useProcessInvitationByToken,
    useAcceptProcessInvitation,
} from "../../hooks/useProcessInvitations";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types/user.types";
import { ProcessInvitationStatus } from "../../types/process-invitation.types";

export const AcceptInvitationPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { data: invitation, isLoading, error } = useProcessInvitationByToken(token!);
    const acceptMutation = useAcceptProcessInvitation();

    useEffect(() => {
        // Si ya está aceptada y el usuario está logueado como worker, redirigir
        if (invitation?.status === ProcessInvitationStatus.ACCEPTED && user?.role === UserRole.WORKER) {
            navigate("/dashboard");
        }
    }, [invitation, user, navigate]);

    const handleAccept = async () => {
        if (!token) return;

        // Si el usuario NO está logueado, redirigir a login con el token
        if (!user) {
            navigate(`/login?fromInvitation=${token}`);
            return;
        }

        // Si está logueado, aceptar directamente
        try {
            await acceptMutation.mutateAsync({ token });
            // Éxito! Redirigir al dashboard
            navigate("/dashboard");
        } catch (error) {
            // Error manejado por el hook
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando invitación...</p>
                </div>
            </div>
        );
    }

    if (error || !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitación no encontrada</h1>
                        <p className="text-gray-600 mb-6">
                            La invitación que buscas no existe o el enlace es inválido.
                        </p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Invitación expirada
    if (invitation.status === ProcessInvitationStatus.EXPIRED || new Date() > new Date(invitation.expiresAt)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitación expirada</h1>
                        <p className="text-gray-600 mb-6">
                            Esta invitación ha expirado. Por favor, contacta al equipo de reclutamiento para solicitar una nueva invitación.
                        </p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Invitación cancelada
    if (invitation.status === ProcessInvitationStatus.CANCELLED) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitación cancelada</h1>
                        <p className="text-gray-600 mb-6">
                            Esta invitación ha sido cancelada.
                        </p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Invitación ya aceptada
    if (invitation.status === ProcessInvitationStatus.ACCEPTED) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ya aceptaste esta invitación</h1>
                        <p className="text-gray-600 mb-6">
                            Esta invitación ya fue aceptada. Puedes ver el proceso en tu dashboard.
                        </p>
                        <Link
                            to={user ? "/dashboard" : "/login"}
                            className="inline-block px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            {user ? "Ir al Dashboard" : "Iniciar Sesión"}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Invitación válida y pendiente
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-2xl w-full mx-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-8 text-white text-center">
                        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">¡Has sido invitado!</h1>
                        <p className="text-teal-100">a postular a un proceso de selección</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Proceso de Selección
                            </h2>
                            <p className="text-2xl font-bold text-gray-900">{invitation.processName}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Invitación para:</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-gray-700">
                                        {invitation.firstName} {invitation.lastName}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-700">{invitation.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex">
                                <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-yellow-900">Esta invitación expira el:</p>
                                    <p className="text-yellow-700">{new Date(invitation.expiresAt).toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleAccept}
                                disabled={acceptMutation.isPending}
                                className="w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
                            >
                                {acceptMutation.isPending ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </span>
                                ) : user ? (
                                    "Aceptar Invitación"
                                ) : (
                                    "Iniciar Sesión para Aceptar"
                                )}
                            </button>

                            {!user && (
                                <p className="text-center text-sm text-gray-600">
                                    ¿No tienes cuenta?{" "}
                                    <Link
                                        to={`/register/worker?fromInvitation=${token}`}
                                        className="font-medium text-teal-600 hover:text-teal-500"
                                    >
                                        Regístrate aquí
                                    </Link>
                                </p>
                            )}

                            <Link
                                to="/"
                                className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
