import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegisterWorker } from "../../hooks/useAuth";
import { RegisterWorkerDto } from "../../types/user.types";

const STEPS = [
    { id: 1, title: "Cuenta", description: "Datos de acceso" },
    { id: 2, title: "Personales", description: "Información básica" },
    { id: 3, title: "Adicionales", description: "Datos opcionales" },
];

export const RegisterWorkerPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const registerMutation = useRegisterWorker();

    const [formData, setFormData] = useState<RegisterWorkerDto>({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        rut: "",
        phone: "",
        birthDate: "",
        address: "",
        city: "",
        region: "",
        education: "",
        experience: "",
    });

    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState("");

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = "El email es requerido";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email inválido";
        }

        if (!formData.password) {
            newErrors.password = "La contraseña es requerida";
        } else if (formData.password.length < 6) {
            newErrors.password =
                "La contraseña debe tener al menos 6 caracteres";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirma tu contraseña";
        } else if (formData.password !== confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName) newErrors.firstName = "El nombre es requerido";
        if (!formData.lastName) newErrors.lastName = "El apellido es requerido";

        if (!formData.rut) {
            newErrors.rut = "El RUT es requerido";
        } else if (!/^[0-9]{7,8}-[0-9Kk]{1}$/.test(formData.rut)) {
            newErrors.rut = "Formato de RUT inválido (ej: 12345678-9)";
        }

        if (
            formData.phone &&
            !/^\+?[0-9]{8,15}$/.test(formData.phone.replace(/\s/g, ""))
        ) {
            newErrors.phone = "Formato de teléfono inválido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = false;

        if (currentStep === 1) {
            isValid = validateStep1();
        } else if (currentStep === 2) {
            isValid = validateStep2();
        } else {
            isValid = true;
        }

        if (isValid) {
            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
                setErrors({});
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setErrors({});
        }
    };

    const handleSubmit = async () => {
        setServerError("");
        try {
            await registerMutation.mutateAsync(formData);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al registrar. Intenta nuevamente.";
            setServerError(Array.isArray(message) ? message[0] : message);
        }
    };

    const handleChange = (field: keyof RegisterWorkerDto, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const handleRutChange = (value: string) => {
        const cleaned = value.replace(/[^0-9kK-]/g, "").toUpperCase();
        handleChange("rut", cleaned);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900">
                        Registro de Trabajador
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Crea tu cuenta para acceder a oportunidades laborales
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center w-full">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                                        currentStep > step.id
                                            ? "bg-green-500 text-white"
                                            : currentStep === step.id
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-300 text-gray-600"
                                    }`}
                                >
                                    {currentStep > step.id ? "✓" : step.id}
                                </div>
                                <div className="text-xs mt-2 text-center">
                                    <div className="font-medium">
                                        {step.title}
                                    </div>
                                    <div className="text-gray-500">
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`flex-1 h-1 mx-2 transition-all ${
                                        currentStep > step.id
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white shadow-xl rounded-lg p-8">
                    {serverError && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {serverError}
                        </div>
                    )}

                    {/* Step 1: Account Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Datos de Acceso
                            </h3>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Email *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleChange("email", e.target.value)
                                    }
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.email
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="tu@email.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Contraseña *
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        handleChange("password", e.target.value)
                                    }
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.password
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Mínimo 6 caracteres"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Confirmar Contraseña *
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) {
                                            setErrors({
                                                ...errors,
                                                confirmPassword: "",
                                            });
                                        }
                                    }}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.confirmPassword
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Repite tu contraseña"
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Personal Info */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Información Personal
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Nombre *
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            handleChange(
                                                "firstName",
                                                e.target.value
                                            )
                                        }
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.firstName
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.firstName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Apellido *
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            handleChange(
                                                "lastName",
                                                e.target.value
                                            )
                                        }
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.lastName
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.lastName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="rut"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    RUT *
                                </label>
                                <input
                                    id="rut"
                                    type="text"
                                    value={formData.rut}
                                    onChange={(e) =>
                                        handleRutChange(e.target.value)
                                    }
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.rut
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="12345678-9"
                                />
                                {errors.rut && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.rut}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Formato: 12345678-9 (sin puntos)
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Teléfono (opcional)
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        handleChange("phone", e.target.value)
                                    }
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.phone
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="+56912345678"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Additional Info */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Información Adicional
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Estos campos son opcionales
                            </p>

                            <div>
                                <label
                                    htmlFor="birthDate"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Fecha de Nacimiento
                                </label>
                                <input
                                    id="birthDate"
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) =>
                                        handleChange(
                                            "birthDate",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="address"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Dirección
                                </label>
                                <input
                                    id="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) =>
                                        handleChange("address", e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="city"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Ciudad
                                    </label>
                                    <input
                                        id="city"
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) =>
                                            handleChange("city", e.target.value)
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="region"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Región
                                    </label>
                                    <input
                                        id="region"
                                        type="text"
                                        value={formData.region}
                                        onChange={(e) =>
                                            handleChange(
                                                "region",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="education"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Nivel de Educación
                                </label>
                                <select
                                    id="education"
                                    value={formData.education}
                                    onChange={(e) =>
                                        handleChange(
                                            "education",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">
                                        Selecciona una opción
                                    </option>
                                    <option value="Básica">
                                        Educación Básica
                                    </option>
                                    <option value="Media">
                                        Educación Media
                                    </option>
                                    <option value="Técnica">
                                        Educación Técnica
                                    </option>
                                    <option value="Universitaria">
                                        Educación Universitaria
                                    </option>
                                    <option value="Postgrado">Postgrado</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="experience"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Experiencia Laboral
                                </label>
                                <textarea
                                    id="experience"
                                    value={formData.experience}
                                    onChange={(e) =>
                                        handleChange(
                                            "experience",
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe brevemente tu experiencia laboral..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                currentStep === 1
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Anterior
                        </button>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={registerMutation.isPending}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {registerMutation.isPending
                                ? "Registrando..."
                                : currentStep === 3
                                ? "Finalizar Registro"
                                : "Siguiente"}
                        </button>
                    </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        ¿Ya tienes una cuenta?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Inicia Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
