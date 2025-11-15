import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
    useChangePassword,
    useUpdateNotificationPreferences,
    useUpdateUser,
} from "../../hooks/useUsers";
import { useWorker, useUploadCV, useDeleteCV, useUpdateWorker } from "../../hooks/useWorkers";
import { FileUpload } from "../../components/common/FileUpload";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { workersService } from "../../services/workers.service";
import usersService from "../../services/users.service";

export const WorkerProfilePage = () => {
    const { user, setUser } = useAuthStore();
    const changePasswordMutation = useChangePassword();
    const updateNotificationsMutation = useUpdateNotificationPreferences();
    const updateUserMutation = useUpdateUser();
    const updateWorkerMutation = useUpdateWorker();
    const uploadCVMutation = useUploadCV();
    const deleteCVMutation = useDeleteCV();

    // Recargar usuario si no tiene la relación worker cargada
    useEffect(() => {
        if (user?.id && !user?.worker?.id && user?.role === "worker") {
            // Recargar usuario completo con relaciones
            usersService.getOne(user.id).then((updatedUser) => {
                if (updatedUser) {
                    setUser(updatedUser);
                }
            });
        }
    }, [user?.id, user?.worker?.id, user?.role, setUser]);

    // Obtener worker por ID desde la relación del usuario
    // El usuario debería tener la relación worker cargada desde el login
    const workerId = user?.worker?.id;
    const { data: worker } = useWorker(workerId || "");
    
    // Usar el worker obtenido
    const currentWorker = worker;

    const [activeTab, setActiveTab] = useState<
        "profile" | "cv" | "notifications" | "account"
    >("profile");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [showDeleteCVModal, setShowDeleteCVModal] = useState(false);

    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        rut: "",
        email: user?.email || "",
        phone: user?.phone || "",
        birthDate: "",
    });

    const [cvForm, setCvForm] = useState({
        cvFile: null as File | null,
        summary: "",
        skills: "",
        experience: "",
        education: "",
    });

    const [notificationsForm, setNotificationsForm] = useState({
        emailNotifications:
            user?.notificationPreferences?.emailNotifications ?? true,
        newProcesses: user?.notificationPreferences?.newProcesses ?? true,
        applicationUpdates: user?.notificationPreferences?.applicationUpdates ?? true,
        testReminders: user?.notificationPreferences?.testReminders ?? true,
    });

    // Sincronizar formularios cuando cambia el usuario o el worker
    useEffect(() => {
        if (user) {
            // Sincronizar formulario de perfil
            // RUT y birthDate vienen del Worker, no del User
            setProfileForm({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                rut: currentWorker?.rut || "",
                email: user.email || "",
                phone: user.phone || "",
                birthDate: currentWorker?.birthDate
                    ? typeof currentWorker.birthDate === "string"
                        ? currentWorker.birthDate
                        : new Date(currentWorker.birthDate).toISOString().split("T")[0]
                    : "",
            });

            // Sincronizar formulario de notificaciones
            if (user.notificationPreferences) {
                setNotificationsForm({
                    emailNotifications:
                        user.notificationPreferences.emailNotifications ?? true,
                    newProcesses: user.notificationPreferences.newProcesses ?? true,
                    applicationUpdates: user.notificationPreferences.applicationUpdates ?? true,
                    testReminders: user.notificationPreferences.testReminders ?? true,
                });
            }
        }
    }, [user, currentWorker]);

    // Sincronizar formulario de CV cuando cambia el worker
    useEffect(() => {
        if (currentWorker) {
            setCvForm({
                cvFile: null,
                summary: "", // No hay campo summary en Worker
                skills: currentWorker.skills?.join(", ") || "",
                experience: currentWorker.experience || "",
                education: currentWorker.education || "",
            });
        }
    }, [currentWorker]);

    const [accountForm, setAccountForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id) {
            setErrorMessage("No se encontró el usuario");
            setTimeout(() => setErrorMessage(""), 5000);
            return;
        }

        try {
            // Actualizar User (firstName, lastName, phone)
            await updateUserMutation.mutateAsync({
                id: user.id,
                data: {
                    firstName: profileForm.firstName,
                    lastName: profileForm.lastName,
                    phone: profileForm.phone || undefined,
                },
            });

            // Actualizar Worker (rut, birthDate) si existe
            const workerIdToUpdate = user?.worker?.id || currentWorker?.id;
            if (workerIdToUpdate) {
                await updateWorkerMutation.mutateAsync({
                    id: workerIdToUpdate,
                    data: {
                        rut: profileForm.rut || undefined,
                        birthDate: profileForm.birthDate || undefined,
                    },
                });
            }

            // Recargar el usuario completo con relaciones para actualizar el store
            const updatedUser = await usersService.getOne(user.id);
            if (updatedUser) {
                setUser(updatedUser);
            }

            setSuccessMessage("Perfil actualizado correctamente");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch {
            setErrorMessage("Error al actualizar el perfil");
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleSaveCV = async (e: React.FormEvent) => {
        e.preventDefault();

        const workerIdToUse = user?.worker?.id || currentWorker?.id;
        if (!workerIdToUse || !user?.id) {
            setErrorMessage("No se encontró el perfil de trabajador");
            setTimeout(() => setErrorMessage(""), 5000);
            return;
        }

        try {
            // Si hay archivo, subirlo primero
            if (cvFile) {
                await uploadCVMutation.mutateAsync({
                    workerId: workerIdToUse,
                    file: cvFile,
                });
            }

            // Guardar los campos de texto del CV (summary, skills, experience, education)
            // Convertir skills de string a array
            const skillsArray = cvForm.skills
                ? cvForm.skills.split(",").map((s) => s.trim()).filter(Boolean)
                : undefined;

            await updateWorkerMutation.mutateAsync({
                id: workerIdToUse,
                data: {
                    education: cvForm.education || undefined,
                    experience: cvForm.experience || undefined,
                    skills: skillsArray,
                },
            });

            // Recargar el usuario completo con relaciones para actualizar el store
            const updatedUser = await usersService.getOne(user.id);
            if (updatedUser) {
                setUser(updatedUser);
            }

            setSuccessMessage("CV actualizado correctamente");
            setCvFile(null);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : "Error al subir el CV";
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleDownloadCV = async () => {
        const workerIdToUse = user?.worker?.id || currentWorker?.id;
        if (!workerIdToUse) {
            setErrorMessage("No se encontró el perfil de trabajador");
            setTimeout(() => setErrorMessage(""), 5000);
            return;
        }

        try {
            const blob = await workersService.downloadCV(workerIdToUse);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `CV_${user?.firstName || "user"}_${user?.lastName || ""}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            const errorMsg =
                error instanceof Error
                    ? error.message
                    : "Error al descargar el CV";
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleDeleteCV = () => {
        const workerIdToUse = user?.worker?.id || currentWorker?.id;
        if (!workerIdToUse) {
            setErrorMessage("No se encontró el perfil de trabajador");
            setTimeout(() => setErrorMessage(""), 5000);
            return;
        }

        setShowDeleteCVModal(true);
    };

    const handleConfirmDeleteCV = async () => {
        const workerIdToUse = user?.worker?.id || currentWorker?.id;
        if (!workerIdToUse) {
            setShowDeleteCVModal(false);
            setErrorMessage("No se encontró el perfil de trabajador");
            setTimeout(() => setErrorMessage(""), 5000);
            return;
        }

        try {
            await deleteCVMutation.mutateAsync(workerIdToUse);
            setShowDeleteCVModal(false);
            setSuccessMessage("CV eliminado correctamente");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            const errorMsg =
                error instanceof Error
                    ? error.message
                    : "Error al eliminar el CV";
            setShowDeleteCVModal(false);
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(""), 5000);
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

            setSuccessMessage("Preferencias guardadas");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch {
            setErrorMessage("Error al guardar las preferencias");
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (accountForm.newPassword !== accountForm.confirmPassword) {
            setErrorMessage("Las contraseñas no coinciden");
            setTimeout(() => setErrorMessage(""), 5000);
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
        } catch {
            setErrorMessage("Error al cambiar la contraseña");
            setTimeout(() => setErrorMessage(""), 5000);
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

            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {errorMessage}
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
                        onClick={() => setActiveTab("cv")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "cv"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        CV y Habilidades
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                RUT *
                            </label>
                            <input
                                type="text"
                                required
                                value={profileForm.rut}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        rut: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        phone: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Nacimiento
                            </label>
                            <input
                                type="date"
                                value={profileForm.birthDate}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        birthDate: e.target.value,
                                    })
                                }
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

            {activeTab === "cv" && (
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Curriculum Vitae
                    </h2>

                    {/* CV actual si existe */}
                    {currentWorker?.cvUrl && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <svg
                                        className="w-10 h-10 text-blue-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            CV actual
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Archivo PDF
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadCV}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Descargar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteCV}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload de nuevo CV */}
                    <form onSubmit={handleSaveCV} className="space-y-6">
                        <FileUpload
                            label="Subir nuevo CV"
                            accept=".pdf,application/pdf"
                            maxSize={5}
                            multiple={false}
                            onFileSelect={(files) =>
                                setCvFile(files[0] || null)
                            }
                            helperText="Sube tu CV en formato PDF (máx. 5MB)"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Resumen Profesional
                            </label>
                            <textarea
                                rows={4}
                                value={cvForm.summary}
                                onChange={(e) =>
                                    setCvForm({
                                        ...cvForm,
                                        summary: e.target.value,
                                    })
                                }
                                placeholder="Describe brevemente tu perfil profesional..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Habilidades
                            </label>
                            <input
                                type="text"
                                value={cvForm.skills}
                                onChange={(e) =>
                                    setCvForm({
                                        ...cvForm,
                                        skills: e.target.value,
                                    })
                                }
                                placeholder="Ej: JavaScript, React, SQL, Liderazgo"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Separa las habilidades con comas
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Experiencia Laboral
                            </label>
                            <textarea
                                rows={5}
                                value={cvForm.experience}
                                onChange={(e) =>
                                    setCvForm({
                                        ...cvForm,
                                        experience: e.target.value,
                                    })
                                }
                                placeholder="Lista tu experiencia laboral relevante..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Educación
                            </label>
                            <textarea
                                rows={4}
                                value={cvForm.education}
                                onChange={(e) =>
                                    setCvForm({
                                        ...cvForm,
                                        education: e.target.value,
                                    })
                                }
                                placeholder="Detalla tu formación académica..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={
                                    (!cvFile && 
                                     !cvForm.skills && 
                                     !cvForm.experience && 
                                     !cvForm.education) || 
                                    uploadCVMutation.isPending || 
                                    updateWorkerMutation.isPending
                                }
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {(uploadCVMutation.isPending || updateWorkerMutation.isPending)
                                    ? "Guardando..."
                                    : "Guardar CV"}
                            </button>
                        </div>
                    </form>
                </div>
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
                                    Nuevos Procesos
                                </p>
                                <p className="text-sm text-gray-600">
                                    Notificarme sobre nuevas ofertas laborales
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationsForm.newProcesses}
                                    onChange={(e) =>
                                        setNotificationsForm({
                                            ...notificationsForm,
                                            newProcesses: e.target.checked,
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
                                    Actualizaciones de Aplicaciones
                                </p>
                                <p className="text-sm text-gray-600">
                                    Cambios en el estado de tus postulaciones
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
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium text-gray-800">
                                    Recordatorios de Tests
                                </p>
                                <p className="text-sm text-gray-600">
                                    Recordatorios de tests pendientes
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationsForm.testReminders}
                                    onChange={(e) =>
                                        setNotificationsForm({
                                            ...notificationsForm,
                                            testReminders: e.target.checked,
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

            {/* Modal de confirmación para eliminar CV */}
            <ConfirmModal
                isOpen={showDeleteCVModal}
                onClose={() => setShowDeleteCVModal(false)}
                onConfirm={handleConfirmDeleteCV}
                title="Eliminar CV"
                message="¿Estás seguro de que deseas eliminar tu CV? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
                isLoading={deleteCVMutation.isPending}
            />
        </div>
    );
};
