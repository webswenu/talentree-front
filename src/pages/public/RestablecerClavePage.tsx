import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import authService from "../../services/auth.service";
import { getApiErrorMessage } from "../../utils/apiError";
import { AYUDA_PASSWORD, mensajeDePassword } from "../../utils/validators";
import { AuthCard } from "./AuthCard";

/** Destino del enlace del correo de recuperación. */
export const RestablecerClavePage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [password, setPassword] = useState("");
    const [confirmacion, setConfirmacion] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [listo, setListo] = useState<{ email: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const motivo = mensajeDePassword(password);
        if (motivo) {
            setError(motivo);
            return;
        }
        if (password !== confirmacion) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setEnviando(true);
        setError("");
        try {
            const r = await authService.restablecerClave(token, password);
            setListo({ email: r.email });
        } catch (err) {
            setError(
                getApiErrorMessage(err, "No pudimos cambiar la contraseña.")
            );
        } finally {
            setEnviando(false);
        }
    };

    if (!token) {
        return (
            <AuthCard titulo="Enlace no válido">
                <p className="text-sm text-gray-600 mb-4">
                    Este enlace está incompleto. Pide uno nuevo.
                </p>
                <Link
                    to="/recuperar-clave"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                >
                    Recuperar contraseña
                </Link>
            </AuthCard>
        );
    }

    if (listo) {
        return (
            <AuthCard titulo="Contraseña actualizada">
                <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg mb-6">
                    Ya puedes iniciar sesión con <strong>{listo.email}</strong>{" "}
                    y tu contraseña nueva.
                </div>
                <Link
                    to="/login"
                    className="block w-full text-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold"
                >
                    Iniciar sesión
                </Link>
            </AuthCard>
        );
    }

    return (
        <AuthCard titulo="Crea una nueva contraseña">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                        {/expir|válido/i.test(error) && (
                            <>
                                {" "}
                                <Link
                                    to="/recuperar-clave"
                                    className="underline font-medium"
                                >
                                    Pedir otro enlace
                                </Link>
                            </>
                        )}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña nueva
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                        autoComplete="new-password"
                        required
                        disabled={enviando}
                    />
                    <p className="mt-1 text-xs text-gray-500">{AYUDA_PASSWORD}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Repite la contraseña
                    </label>
                    <input
                        type="password"
                        value={confirmacion}
                        onChange={(e) => setConfirmacion(e.target.value)}
                        className="input"
                        autoComplete="new-password"
                        required
                        disabled={enviando}
                    />
                </div>
                <button
                    type="submit"
                    disabled={enviando}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {enviando ? "Guardando..." : "Guardar contraseña"}
                </button>
            </form>
        </AuthCard>
    );
};
