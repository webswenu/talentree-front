import { useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../../hooks/useAuth";

export const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const loginMutation = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginMutation.mutateAsync({ email, password });
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
