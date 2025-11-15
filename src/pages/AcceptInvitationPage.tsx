import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invitationsService, Invitation } from "../services/invitations.service";
import { toast } from "../utils/toast";
import { Company } from "../types/company.types";

interface InvitationWithCompany extends Invitation {
    company?: Company;
}

export const AcceptInvitationPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [invitation, setInvitation] = useState<InvitationWithCompany | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchInvitation = async () => {
            if (!token) {
                setError("Token de invitación no válido");
                setIsLoading(false);
                return;
            }

            try {
                const response = await invitationsService.getInvitationByToken(
                    token
                );
                setInvitation(response.data as InvitationWithCompany);
            } catch (err: unknown) {
                const errorMessage = 
                    (err && typeof err === 'object' && 'response' in err && 
                     err.response && typeof err.response === 'object' && 
                     'data' in err.response && err.response.data && 
                     typeof err.response.data === 'object' && 
                     'message' in err.response.data &&
                     typeof err.response.data.message === 'string')
                        ? err.response.data.message
                        : "Error al cargar la invitación";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvitation();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setIsSubmitting(true);

        try {
            await invitationsService.acceptInvitation({
                token: token!,
                password,
            });
            toast.success("¡Cuenta creada exitosamente!");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err: unknown) {
            const errorMessage = 
                (err && typeof err === 'object' && 'response' in err && 
                 err.response && typeof err.response === 'object' && 
                 'data' in err.response && err.response.data && 
                 typeof err.response.data === 'object' && 
                 'message' in err.response.data &&
                 typeof err.response.data.message === 'string')
                    ? err.response.data.message
                    : "Error al aceptar la invitación";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Cargando invitación...
                    </p>
                </div>
            </div>
        );
    }

    if (error && !invitation) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Invitación no válida
                    </h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Ir al inicio de sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📧</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Bienvenido a Talentree
                    </h1>
                    <p className="text-gray-600">
                        Has sido invitado por{" "}
                        <strong>{invitation?.company?.name}</strong>
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">
                        Crear cuenta para:
                    </p>
                    <p className="font-semibold text-gray-800">
                        {invitation?.firstName} {invitation?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{invitation?.email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingresa tu contraseña"
                            required
                            minLength={8}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Mínimo 8 caracteres
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirma tu contraseña"
                            required
                            minLength={8}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    ¿Ya tienes una cuenta?{" "}
                    <a
                        href="/login"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Iniciar sesión
                    </a>
                </p>
            </div>
        </div>
    );
};
