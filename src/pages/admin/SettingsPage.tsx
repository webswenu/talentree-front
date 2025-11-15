import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    useGeneralSettings,
    useNotificationSettings,
    useUpsertSettingsBatch,
    useInitializeDefaults,
} from "../../hooks/useSettings";
import {
    UpdateSettingDto,
    GeneralSettings,
    NotificationSettings,
} from "../../types/settings.types";

export const SettingsPage = () => {
    const location = useLocation();
    const isEvaluator = location.pathname.includes("/evaluador");
    const [activeTab, setActiveTab] = useState("general");
    const [hasInitialized, setHasInitialized] = useState(false);

    const { data: generalSettings, isLoading: loadingGeneral } =
        useGeneralSettings();
    const { data: notificationSettings, isLoading: loadingNotifications } =
        useNotificationSettings();
    const upsertBatchMutation = useUpsertSettingsBatch();
    const initializeMutation = useInitializeDefaults();

    const [generalForm, setGeneralForm] = useState<GeneralSettings>({
        system_name: "",
        contact_email: "",
        system_description: "",
        timezone: "America/Santiago",
        logo_url: "",
    });

    const [notificationsForm, setNotificationsForm] =
        useState<NotificationSettings>({
            notifications_enabled: true,
            email_notifications: true,
            in_app_notifications: true,
            notification_frequency: "instant",
        });

    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!hasInitialized && !loadingGeneral && generalSettings) {
            const isEmpty = Object.keys(generalSettings).length === 0;
            if (isEmpty) {
                initializeMutation.mutate(undefined, {
                    onSuccess: () => setHasInitialized(true),
                });
            } else {
                setHasInitialized(true);
            }
        }
    }, [generalSettings, loadingGeneral, hasInitialized, initializeMutation]);

    useEffect(() => {
        if (generalSettings) {
            setGeneralForm({
                system_name: generalSettings.system_name || "",
                contact_email: generalSettings.contact_email || "",
                system_description: generalSettings.system_description || "",
                timezone: generalSettings.timezone || "America/Santiago",
                logo_url: generalSettings.logo_url || "",
            });
        }
    }, [generalSettings]);

    useEffect(() => {
        if (notificationSettings) {
            setNotificationsForm({
                notifications_enabled:
                    notificationSettings.notifications_enabled ?? true,
                email_notifications:
                    notificationSettings.email_notifications ?? true,
                in_app_notifications:
                    notificationSettings.in_app_notifications ?? true,
                notification_frequency:
                    notificationSettings.notification_frequency || "instant",
            });
        }
    }, [notificationSettings]);

    const handleGeneralChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setGeneralForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleNotificationChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setNotificationsForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault();

        const settings: UpdateSettingDto[] = [
            {
                key: "system_name",
                value: generalForm.system_name,
                isPublic: true,
            },
            {
                key: "contact_email",
                value: generalForm.contact_email,
                isPublic: true,
            },
            {
                key: "system_description",
                value: generalForm.system_description,
                isPublic: true,
            },
            { key: "timezone", value: generalForm.timezone },
            { key: "logo_url", value: generalForm.logo_url, isPublic: true },
        ];

        await upsertBatchMutation.mutateAsync(settings);
        setSuccessMessage("Configuración general guardada correctamente");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleSaveNotifications = async (e: React.FormEvent) => {
        e.preventDefault();

        const settings: UpdateSettingDto[] = [
            {
                key: "notifications_enabled",
                value: notificationsForm.notifications_enabled,
            },
            {
                key: "email_notifications",
                value: notificationsForm.email_notifications,
            },
            {
                key: "in_app_notifications",
                value: notificationsForm.in_app_notifications,
            },
            {
                key: "notification_frequency",
                value: notificationsForm.notification_frequency,
            },
        ];

        await upsertBatchMutation.mutateAsync(settings);
        setSuccessMessage(
            "Configuración de notificaciones guardada correctamente"
        );
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const isLoading =
        loadingGeneral || loadingNotifications || upsertBatchMutation.isPending;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    Configuración del Sistema
                </h1>
                {successMessage && !isEvaluator && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                        {successMessage}
                    </div>
                )}
                {isEvaluator && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded text-sm">
                        Modo solo lectura
                    </div>
                )}
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "general"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        General
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
                </nav>
            </div>

            {activeTab === "general" && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Configuración General
                    </h2>
                    <form onSubmit={handleSaveGeneral} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del Sistema
                            </label>
                            <input
                                type="text"
                                name="system_name"
                                value={generalForm.system_name}
                                onChange={handleGeneralChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                disabled={isLoading || isEvaluator}
                                readOnly={isEvaluator}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email de Contacto
                            </label>
                            <input
                                type="email"
                                name="contact_email"
                                value={generalForm.contact_email}
                                onChange={handleGeneralChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                disabled={isLoading || isEvaluator}
                                readOnly={isEvaluator}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción del Sistema
                            </label>
                            <textarea
                                name="system_description"
                                value={generalForm.system_description}
                                onChange={handleGeneralChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                disabled={isLoading || isEvaluator}
                                readOnly={isEvaluator}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Zona Horaria
                            </label>
                            <select
                                name="timezone"
                                value={generalForm.timezone}
                                onChange={handleGeneralChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                disabled={isLoading || isEvaluator}
                            >
                                <option value="America/Santiago">
                                    America/Santiago
                                </option>
                                <option value="America/Buenos_Aires">
                                    America/Buenos Aires
                                </option>
                                <option value="America/Lima">
                                    America/Lima
                                </option>
                                <option value="America/Bogota">
                                    America/Bogota
                                </option>
                                <option value="America/Mexico_City">
                                    America/Mexico City
                                </option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL del Logo
                            </label>
                            <input
                                type="url"
                                name="logo_url"
                                value={generalForm.logo_url}
                                onChange={handleGeneralChange}
                                placeholder="https://ejemplo.com/logo.png"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                disabled={isLoading || isEvaluator}
                                readOnly={isEvaluator}
                            />
                        </div>
                        {!isEvaluator && (
                            <button
                                type="submit"
                                className="btn-primary disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        )}
                    </form>
                </div>
            )}

            {activeTab === "notifications" && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Configuración de Notificaciones
                    </h2>
                    <form
                        onSubmit={handleSaveNotifications}
                        className="space-y-4"
                    >
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="notifications_enabled"
                                checked={
                                    notificationsForm.notifications_enabled
                                }
                                onChange={handleNotificationChange}
                                className="h-4 w-4 text-blue-600 rounded"
                                disabled={isLoading || isEvaluator}
                            />
                            <label className="ml-2 text-sm text-gray-700">
                                Habilitar notificaciones del sistema
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="email_notifications"
                                checked={notificationsForm.email_notifications}
                                onChange={handleNotificationChange}
                                className="h-4 w-4 text-blue-600 rounded"
                                disabled={
                                    isLoading ||
                                    !notificationsForm.notifications_enabled ||
                                    isEvaluator
                                }
                            />
                            <label className="ml-2 text-sm text-gray-700">
                                Notificaciones por correo electrónico
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="in_app_notifications"
                                checked={notificationsForm.in_app_notifications}
                                onChange={handleNotificationChange}
                                className="h-4 w-4 text-blue-600 rounded"
                                disabled={
                                    isLoading ||
                                    !notificationsForm.notifications_enabled ||
                                    isEvaluator
                                }
                            />
                            <label className="ml-2 text-sm text-gray-700">
                                Notificaciones en la aplicación
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Frecuencia de Notificaciones
                            </label>
                            <select
                                name="notification_frequency"
                                value={notificationsForm.notification_frequency}
                                onChange={handleNotificationChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                disabled={
                                    isLoading ||
                                    !notificationsForm.notifications_enabled ||
                                    isEvaluator
                                }
                            >
                                <option value="instant">Instantáneas</option>
                                <option value="daily">Resumen Diario</option>
                                <option value="weekly">Resumen Semanal</option>
                            </select>
                        </div>
                        {!isEvaluator && (
                            <button
                                type="submit"
                                className="btn-primary disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};
