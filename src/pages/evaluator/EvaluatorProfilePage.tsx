import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
    useChangePassword,
    useUpdateNotificationPreferences,
} from "../../hooks/useUsers";

export const EvaluatorProfilePage = () => {
    const { user } = useAuthStore();
    const changePasswordMutation = useChangePassword();
    const updateNotificationsMutation = useUpdateNotificationPreferences();
    const [activeTab, setActiveTab] = useState<
        "profile" | "notifications" | "account"
    >("profile");
    const [successMessage, setSuccessMessage] = useState("");

    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        specialty: "",
        bio: "",
    });

    const [notificationsForm, setNotificationsForm] = useState({
        emailNotifications:
            user?.notificationPreferences?.emailNotifications ?? true,
        newEvaluations: user?.notificationPreferences?.newEvaluations ?? true,
        candidateUpdates:
            user?.notificationPreferences?.candidateUpdates ?? true,
        processReminders:
            user?.notificationPreferences?.processReminders ?? true,
    });

    const [accountForm, setAccountForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("Perfil actualizado correctamente");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleSaveNotifications = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateNotificationsMutation.mutateAsync(notificationsForm);
            setSuccessMessage("Preferencias guardadas");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Error al guardar las preferencias";
            console.error("Error saving notifications:", errorMessage);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (accountForm.newPassword !== accountForm.confirmPassword) {
            setSuccessMessage("");
            console.error("Las contraseñas no coinciden");
            return;
        }

        try {
            await changePasswordMutation.mutateAsync({
                currentPassword: accountForm.currentPassword,
                newPassword: accountForm.newPassword,
            });
            setSuccessMessage("Contraseña actualizada");
            setAccountForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Error al cambiar la contraseña";
            console.error("Error changing password:", errorMessage);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
                <p className="text-gray-600 mt-1">
                    Administra tu información personal y preferencias
                </p>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    {successMessage}
                </div>
            )}

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "profile"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Información Personal
                    </button>
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "notifications"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Notificaciones
                    </button>
                    <button
                        onClick={() => setActiveTab("account")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "account"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Seguridad
                    </button>
                </nav>
            </div>

            {activeTab === "profile" && (
                <form
                    onSubmit={handleSaveProfile}
                    className="bg-white rounded-lg shadow p-6 space-y-4"
                >
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Información Personal
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                required
                                value={profileForm.firstName}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        firstName: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Apellido *
                            </label>
                            <input
                                type="text"
                                required
                                value={profileForm.lastName}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        lastName: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                disabled
                                value={profileForm.email}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                El email no puede ser modificado
                            </p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Especialidad
                            </label>
                            <input
                                type="text"
                                value={profileForm.specialty}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        specialty: e.target.value,
                                    })
                                }
                                placeholder="Ej: Psicología Organizacional, Recursos Humanos"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Biografía
                            </label>
                            <textarea
                                rows={4}
                                value={profileForm.bio}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        bio: e.target.value,
                                    })
                                }
                                placeholder="Cuéntanos sobre tu experiencia..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            )}

            {activeTab === "notifications" && (
                <form
                    onSubmit={handleSaveNotifications}
                    className="bg-white rounded-lg shadow p-6 space-y-6"
                >
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Preferencias de Notificaciones
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <p className="font-medium text-gray-800">
                                    Notificaciones por Email
                                </p>
                                <p className="text-sm text-gray-600">
                                    Recibir notificaciones en tu correo
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={
                                        notificationsForm.emailNotifications
                                    }
                                    onChange={(e) =>
                                        setNotificationsForm({
                                            ...notificationsForm,
                                            emailNotifications:
                                                e.target.checked,
                                        })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <p className="font-medium text-gray-800">
                                    Nuevas Evaluaciones
                                </p>
                                <p className="text-sm text-gray-600">
                                    Tests que requieren tu revisión
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationsForm.newEvaluations}
                                    onChange={(e) =>
                                        setNotificationsForm({
                                            ...notificationsForm,
                                            newEvaluations: e.target.checked,
                                        })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <p className="font-medium text-gray-800">
                                    Actualizaciones de Candidatos
                                </p>
                                <p className="text-sm text-gray-600">
                                    Cambios en el estado de candidatos
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationsForm.candidateUpdates}
                                    onChange={(e) =>
                                        setNotificationsForm({
                                            ...notificationsForm,
                                            candidateUpdates: e.target.checked,
                                        })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium text-gray-800">
                                    Recordatorios de Procesos
                                </p>
                                <p className="text-sm text-gray-600">
                                    Procesos próximos a vencer
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationsForm.processReminders}
                                    onChange={(e) =>
                                        setNotificationsForm({
                                            ...notificationsForm,
                                            processReminders: e.target.checked,
                                        })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Guardar Preferencias
                        </button>
                    </div>
                </form>
            )}

            {activeTab === "account" && (
                <form
                    onSubmit={handleChangePassword}
                    className="bg-white rounded-lg shadow p-6 space-y-6"
                >
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Cambiar Contraseña
                    </h2>
                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña Actual
                            </label>
                            <input
                                type="password"
                                required
                                value={accountForm.currentPassword}
                                onChange={(e) =>
                                    setAccountForm({
                                        ...accountForm,
                                        currentPassword: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                value={accountForm.newPassword}
                                onChange={(e) =>
                                    setAccountForm({
                                        ...accountForm,
                                        newPassword: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmar Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                value={accountForm.confirmPassword}
                                onChange={(e) =>
                                    setAccountForm({
                                        ...accountForm,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Actualizar Contraseña
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
