import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";

export const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const loginMutation = useLogin();

    // Si ya está logueado y hay redirect, navegar allí
    useEffect(() => {
        if (user) {
            const redirect = searchParams.get("redirect");
            if (redirect) {
                navigate(redirect);
            }
        }
    }, [user, searchParams, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Primero hacer login
            await loginMutation.mutateAsync({ email, password });

            // Si hay invitación, redirigir a la página de aceptación
            const fromInvitation = searchParams.get("fromInvitation");
            if (fromInvitation) {
                navigate(`/invitation-accepted?token=${fromInvitation}`);
            } else {
                // Si no hay invitación, verificar si hay redirect
                const redirect = searchParams.get("redirect");
                if (redirect) {
                    navigate(redirect);
                }
                // Si no hay redirect, el hook useLogin ya navega a /dashboard
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/cta2.jpg)' }}
            >
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Botón de volver */}
            <Link
                to="/"
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-teal-400 transition-colors duration-300 group"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
                <span className="font-medium">Volver</span>
            </Link>

            <div className="card max-w-md w-full m-4 relative z-10">
                <div className="text-center mb-8">
                    <img
                        src="/talentreelogo.png"
                        alt="Talentree"
                        className="h-32 mx-auto mb-4"
                    />
                </div>

                <h2 className="text-2xl font-semibold text-center mb-6">
                    Iniciar Sesión
                </h2>

                {loginMutation.isError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {loginMutation.error instanceof Error
                            ? loginMutation.error.message
                            : "Error al iniciar sesión"}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="tu@email.com"
                            required
                            disabled={loginMutation.isPending}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="••••••••"
                            required
                            disabled={loginMutation.isPending}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending || !email.trim() || !password.trim()}
                        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        {loginMutation.isPending ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Iniciando sesión...
                            </span>
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="text-sm text-gray-600 hover:text-gray-800"
                    >
                        ← Volver al inicio
                    </Link>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600">
                    ¿Eres candidato?{" "}
                    <Link
                        to="/register/worker"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Regístrate aquí
                    </Link>
                </div>
            </div>
        </div>
    );
};
