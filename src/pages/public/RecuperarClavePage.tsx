import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import authService from "../../services/auth.service";
import { getApiErrorMessage } from "../../utils/apiError";
import { AuthCard } from "./AuthCard";

/**
 * Pide el enlace para crear una contraseña nueva. Antes no existia: quien
 * olvidaba la clave dependia de que la admin se la cambiara a mano.
 */
export const RecuperarClavePage = () => {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get("email") ?? "");
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const valor = (
            (e.currentTarget.elements.namedItem("email") as HTMLInputElement)
                ?.value ?? email
        ).trim();
        if (!valor) return;

        setEnviando(true);
        setError("");
        try {
            const r = await authService.solicitarRecuperacion(valor);
            setMensaje(r.message);
        } catch (err) {
            setError(
                getApiErrorMessage(err, "No pudimos enviar el correo. Intenta de nuevo.")
            );
        } finally {
            setEnviando(false);
        }
    };

    return (
        <AuthCard titulo="Recuperar contraseña">
            {mensaje ? (
                <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg">
                    {mensaje}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Escribe el correo con que te registraste y te enviaremos
                        un enlace para crear una contraseña nueva.
                    </p>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="tu@email.com"
                            autoCapitalize="none"
                            autoCorrect="off"
                            required
                            disabled={enviando}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={enviando}
                        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {enviando ? "Enviando..." : "Enviar enlace"}
                    </button>
                </form>
            )}

            <div className="mt-6 text-center">
                <Link
                    to="/login"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                    ← Volver a iniciar sesión
                </Link>
            </div>
        </AuthCard>
    );
};
