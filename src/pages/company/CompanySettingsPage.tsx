import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import {
    useUpdateCompany,
    useUploadCompanyLogo,
    useDeleteCompanyLogo,
} from "../../hooks/useCompanies";
import {
    useChangePassword,
    useUpdateNotificationPreferences,
} from "../../hooks/useUsers";
import type { Company } from "../../types/company.types";
import { ConfirmModal } from "../../components/common/ConfirmModal";

export const CompanySettingsPage = () => {
    const { user, setUser } = useAuthStore();
    const updateCompanyMutation = useUpdateCompany();
    const uploadLogoMutation = useUploadCompanyLogo();
    const deleteLogoMutation = useDeleteCompanyLogo();
    const changePasswordMutation = useChangePassword();
    const updateNotificationsMutation = useUpdateNotificationPreferences();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Detectar si el usuario es invitado (solo lectura)
    const isGuest = user?.role === "guest";

    // Para empresa: user.company, para invitado: user.belongsToCompany
    const companyData =
        typeof user?.company === "object" && user?.company
            ? (user.company as Company)
            : typeof user?.belongsToCompany === "object" && user?.belongsToCompany
            ? (user.belongsToCompany as Company)
            : null;

    const [activeTab, setActiveTab] = useState<
        "info" | "notifications" | "account"
    >("info");
    const [successMessage, setSuccessMessage] = useState("");
    const [showDeleteLogoModal, setShowDeleteLogoModal] = useState(false);

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
        newProcesses: user?.notificationPreferences?.newProcesses ?? true,
        applicationUpdates:
            user?.notificationPreferences?.applicationUpdates ?? true,
        testReminders: user?.notificationPreferences?.testReminders ?? true,
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

    // Sincronizar formulario de notificaciones cuando cambia el usuario
    useEffect(() => {
        if (user?.notificationPreferences) {
            setNotificationsForm({
                emailNotifications:
                    user.notificationPreferences.emailNotifications ?? true,
                newProcesses: user.notificationPreferences.newProcesses ?? true,
                applicationUpdates:
                    user.notificationPreferences.applicationUpdates ?? true,
                testReminders: user.notificationPreferences.testReminders ?? true,
                newEvaluations:
                    user.notificationPreferences.newEvaluations ?? true,
                candidateUpdates:
                    user.notificationPreferences.candidateUpdates ?? true,
                processReminders:
                    user.notificationPreferences.processReminders ?? true,
            });
        }
    }, [user?.notificationPreferences]);

    const handleSaveCompanyInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyData?.id) return;

        try {
            const updatedCompany = await updateCompanyMutation.mutateAsync({
                id: companyData.id,
                data: companyForm,
            });

            // Actualizar el usuario en el store con la información actualizada
            if (user) {
                const updatedUser = { ...user };
                if (user.role === "company" && typeof user.company === "object") {
                    updatedUser.company = updatedCompany;
                } else if (
                    user.role === "guest" &&
                    typeof user.belongsToCompany === "object"
                ) {
                    updatedUser.belongsToCompany = updatedCompany;
                }
                setUser(updatedUser);
                // Actualizar también el localStorage para persistir el cambio
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }

            setSuccessMessage("Información guardada correctamente");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch {
            // Error handled silently or by mutation error handler
        }
    };

    const handleSaveNotifications = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const updatedUser = await updateNotificationsMutation.mutateAsync(notificationsForm);
            
            // Actualizar el usuario en el store (automáticamente persiste en localStorage)
            if (updatedUser) {
                setUser(updatedUser);
            }

            setSuccessMessage("Preferencias de notificaciones guardadas");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch {
            // Error handled silently or by mutation error handler
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (accountForm.newPassword !== accountForm.confirmPassword) {
            setSuccessMessage("");
            // Passwords don't match - handled by UI validation
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
        } catch {
            // Error handled silently or by mutation error handler
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !companyData?.id) return;

        try {
            const updatedCompany = await uploadLogoMutation.mutateAsync({
                id: companyData.id,
                file,
            });

            // Actualizar el usuario en el store con el logo actualizado
            if (user) {
                const updatedUser = { ...user };
                if (user.role === "company" && typeof user.company === "object") {
                    updatedUser.company = updatedCompany;
                } else if (
                    user.role === "guest" &&
                    typeof user.belongsToCompany === "object"
                ) {
                    updatedUser.belongsToCompany = updatedCompany;
                }
                setUser(updatedUser);
                // Actualizar también el localStorage para persistir el cambio
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }

            setSuccessMessage("Logo actualizado correctamente");
            setTimeout(() => setSuccessMessage(""), 3000);

            // Limpiar input para permitir cargar el mismo archivo de nuevo
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDeleteLogo = async () => {
        if (!companyData?.id || !companyData.logo) return;

        try {
            const updatedCompany = await deleteLogoMutation.mutateAsync(
                companyData.id
            );

            // Actualizar el usuario en el store con el logo eliminado
            if (user) {
                const updatedUser = { ...user };
                if (user.role === "company" && typeof user.company === "object") {
                    updatedUser.company = updatedCompany;
                } else if (
                    user.role === "guest" &&
                    typeof user.belongsToCompany === "object"
                ) {
                    updatedUser.belongsToCompany = updatedCompany;
                }
                setUser(updatedUser);
                // Actualizar también el localStorage para persistir el cambio
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }

            setSuccessMessage("Logo eliminado correctamente");
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowDeleteLogoModal(false);
        } catch {
            setShowDeleteLogoModal(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Configuración
                </h1>
                <p className="text-gray-600 mt-1">
                    {isGuest
                        ? "Información de la empresa (solo lectura)"
                        : "Administra la información de tu empresa y preferencias"}
                </p>
            </div>

            {successMessage && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium">{successMessage}</span>
                    </div>
                </div>
            )}

            {!isGuest && (
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
            )}

            {(activeTab === "info" || isGuest) && (
                <form
                    onSubmit={handleSaveCompanyInfo}
                    className="bg-white rounded-lg shadow p-6 space-y-6"
                >
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Información de la Empresa
                        </h2>
                        {isGuest && (
                            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                                ℹ️ Como invitado, solo puedes ver la información de la empresa, no editarla.
                            </div>
                        )}

                        {/* Logo Upload Section */}
                        <div className="mb-6 pb-6 border-b">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Logo de la Empresa
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="w-24 h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                    {companyData?.logo ? (
                                        <img
                                            src={companyData.logo}
                                            alt="Logo empresa"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <svg
                                            className="w-12 h-12 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        disabled={isGuest}
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={
                                                isGuest || uploadLogoMutation.isPending
                                            }
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploadLogoMutation.isPending
                                                ? "Subiendo..."
                                                : companyData?.logo
                                                ? "Cambiar Logo"
                                                : "Subir Logo"}
                                        </button>
                                        {companyData?.logo && !isGuest && (
                                            <button
                                                type="button"
                                                onClick={() => setShowDeleteLogoModal(true)}
                                                disabled={deleteLogoMutation.isPending}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deleteLogoMutation.isPending
                                                    ? "Eliminando..."
                                                    : "Eliminar"}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Formatos: JPG, PNG, GIF, WEBP, SVG (máx. 5MB)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la Empresa *
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={isGuest}
                                    value={companyForm.name}
                                    onChange={(e) =>
                                        setCompanyForm({
                                            ...companyForm,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    RUT *
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={isGuest}
                                    value={companyForm.rut}
                                    onChange={(e) =>
                                        setCompanyForm({
                                            ...companyForm,
                                            rut: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                    disabled={isGuest}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                    disabled={isGuest}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                    disabled={isGuest}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                    disabled={isGuest}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                    disabled={isGuest}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Describe tu empresa..."
                                />
                            </div>
                        </div>
                    </div>
                    {!isGuest && (
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
                    )}
                </form>
            )}

            {!isGuest && activeTab === "notifications" && (
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
                                        Nuevos Procesos
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Cuando se crean nuevos procesos de selección
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={
                                            notificationsForm.newProcesses
                                        }
                                        onChange={(e) =>
                                            setNotificationsForm({
                                                ...notificationsForm,
                                                newProcesses:
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
                                        Actualizaciones de Aplicaciones
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Cuando hay cambios en las postulaciones
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={
                                            notificationsForm.applicationUpdates
                                        }
                                        onChange={(e) =>
                                            setNotificationsForm({
                                                ...notificationsForm,
                                                applicationUpdates:
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
                                        Recordatorios de Pruebas
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Recordatorios sobre pruebas pendientes
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={
                                            notificationsForm.testReminders
                                        }
                                        onChange={(e) =>
                                            setNotificationsForm({
                                                ...notificationsForm,
                                                testReminders:
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

            {!isGuest && activeTab === "account" && (
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
                                    disabled={isGuest}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                    disabled={isGuest}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                    disabled={isGuest}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

            {/* Modal de confirmación para eliminar logo */}
            <ConfirmModal
                isOpen={showDeleteLogoModal}
                onClose={() => setShowDeleteLogoModal(false)}
                onConfirm={handleDeleteLogo}
                title="Eliminar Logo"
                message="¿Estás seguro de que deseas eliminar el logo de la empresa? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
                isLoading={deleteLogoMutation.isPending}
            />
        </div>
    );
};
