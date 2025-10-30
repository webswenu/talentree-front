import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useUpdateCompany } from "../../hooks/useCompanies";
import {
    useChangePassword,
    useUpdateNotificationPreferences,
} from "../../hooks/useUsers";
import type { Company } from "../../types/company.types";

export const CompanySettingsPage = () => {
    const { user } = useAuthStore();
    const updateCompanyMutation = useUpdateCompany();
    const changePasswordMutation = useChangePassword();
    const updateNotificationsMutation = useUpdateNotificationPreferences();
    const companyData =
        typeof user?.company === "object" && user?.company
            ? (user.company as Company)
            : null;

    const [activeTab, setActiveTab] = useState<
        "info" | "notifications" | "account"
    >("info");
    const [successMessage, setSuccessMessage] = useState("");

    const [companyForm, setCompanyForm] = useState({
        name: companyData?.name || "",
        rut: companyData?.rut || "",
        email: companyData?.email || "",
        phone: companyData?.phone || "",
        address: companyData?.address || "",
        website: companyData?.website || "",
        description: companyData?.description || "",
    });

    const [notificationsForm, setNotificationsForm] = useState({
        emailNotifications:
            user?.notificationPreferences?.emailNotifications ?? true,
        candidateUpdates:
            user?.notificationPreferences?.candidateUpdates ?? true,
        processReminders:
            user?.notificationPreferences?.processReminders ?? true,
        newEvaluations: user?.notificationPreferences?.newEvaluations ?? true,
    });

    const [accountForm, setAccountForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (companyData) {
            setCompanyForm({
                name: companyData.name || "",
                rut: companyData.rut || "",
                email: companyData.email || "",
                phone: companyData.phone || "",
                address: companyData.address || "",
                website: companyData.website || "",
                description: companyData.description || "",
            });
        }
    }, [companyData]);

    const handleSaveCompanyInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyData?.id) return;

        try {
            await updateCompanyMutation.mutateAsync({
                id: companyData.id,
                data: companyForm,
            });
            setSuccessMessage("Información guardada correctamente");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error("Error saving company info:", err);
        }
    };

    const handleSaveNotifications = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateNotificationsMutation.mutateAsync(notificationsForm);
            setSuccessMessage("Preferencias de notificaciones guardadas");
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
            setSuccessMessage("Contraseña actualizada correctamente");
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
                <h1 className="text-2xl font-bold text-gray-800">
                    Configuración
                </h1>
                <p className="text-gray-600 mt-1">
                    Administra la información de tu empresa y preferencias
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
                        onClick={() => setActiveTab("info")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "info"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Información de Empresa
                    </button>
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "notifications"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Notificaciones
                    </button>
                    <button
                        onClick={() => setActiveTab("account")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "account"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Mi Cuenta
                    </button>
                </nav>
            </div>

            {activeTab === "info" && (
                <form
                    onSubmit={handleSaveCompanyInfo}
                    className="bg-white rounded-lg shadow p-6 space-y-6"
                >
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Información de la Empresa
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la Empresa *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={companyForm.name}
                                    onChange={(e) =>
                                        setCompanyForm({
                                            ...companyForm,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    RUT *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={companyForm.rut}
                                    onChange={(e) =>
                                        setCompanyForm({
                                            ...companyForm,
                                            rut: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={companyForm.email}
                                    onChange={(e) =>
                                        setCompanyForm({
                                            ...companyForm,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={companyForm.phone}
                                    onChange={(e) =>
                                        setCompanyForm({
                                            ...companyForm,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={companyForm.address}
                                    onChange={(e) =>
                                        setCompanyForm({
                                            ...companyForm,
                                            address: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sitio Web
                                </label>
                                <input
                                    type="url"
                                    value={companyForm.website}
                                    onChange={(e) =>
                                        setCompanyForm({
                                            ...companyForm,
                                            website: e.target.value,
                                        })
                                    }
                                    placeholder="https://ejemplo.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    rows={4}
                                    value={companyForm.description}
                                    onChange={(e) =>
                                        setCompanyForm({
                                            ...companyForm,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Describe tu empresa..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={updateCompanyMutation.isPending}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateCompanyMutation.isPending
                                ? "Guardando..."
                                : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            )}

            {activeTab === "notifications" && (
                <form
                    onSubmit={handleSaveNotifications}
                    className="bg-white rounded-lg shadow p-6 space-y-6"
                >
                    <div>
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
                                        electrónico
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
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b">
                                <div>
                                    <p className="font-medium text-gray-800">
                                        Nuevas Evaluaciones
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Cuando se asignan nuevas evaluaciones
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={
                                            notificationsForm.newEvaluations
                                        }
                                        onChange={(e) =>
                                            setNotificationsForm({
                                                ...notificationsForm,
                                                newEvaluations:
                                                    e.target.checked,
                                            })
                                        }
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                                        checked={
                                            notificationsForm.candidateUpdates
                                        }
                                        onChange={(e) =>
                                            setNotificationsForm({
                                                ...notificationsForm,
                                                candidateUpdates:
                                                    e.target.checked,
                                            })
                                        }
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                                        checked={
                                            notificationsForm.processReminders
                                        }
                                        onChange={(e) =>
                                            setNotificationsForm({
                                                ...notificationsForm,
                                                processReminders:
                                                    e.target.checked,
                                            })
                                        }
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
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
                    <div>
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
