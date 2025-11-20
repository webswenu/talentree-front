import { Modal } from "../common/Modal";
import { useForm } from "../../hooks/useForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/user.service";
import { User, CreateUserDto, UpdateUserDto, UserRole } from "../../types/user.types";
import { useCompanies } from "../../hooks/useCompanies";
import { useCreateCompany } from "../../hooks/useCompanies";
import { toast } from "../../utils/toast";
import { useState } from "react";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User;
}

export const UserModal = ({ isOpen, onClose, user }: UserModalProps) => {
    const queryClient = useQueryClient();
    const isEditMode = !!user;
    const { data: companiesData } = useCompanies();
    const companies = companiesData?.data || [];
    const createCompanyMutation = useCreateCompany();

    const [selectedRole, setSelectedRole] = useState<string>(user?.role || "company");

    const { values, errors, handleChange, handleSubmit, isSubmitting, setValues } =
        useForm({
            initialValues: {
                firstName: user?.firstName || "",
                lastName: user?.lastName || "",
                email: user?.email || "",
                role: user?.role || "company",
                password: "",
                // Campos para empresa
                companyName: "",
                companyRut: "",
                companyIndustry: "",
                // Campo para evaluador y guest
                companyId: "",
            },
            onSubmit: async (values) => {
                console.log("🔵 onSubmit iniciado, values:", values);
                console.log("🔵 isEditMode:", isEditMode, "role:", values.role);
                if (isEditMode && user) {
                    const updateData: UpdateUserDto = {
                        firstName: values.firstName,
                        lastName: values.lastName,
                    };
                    await updateMutation.mutateAsync({
                        id: user.id,
                        data: updateData,
                    });
                } else {
                    // Crear empresa primero si es rol COMPANY
                    if (values.role === UserRole.COMPANY) {
                        try {
                            const company = await createCompanyMutation.mutateAsync({
                                name: values.companyName,
                                rut: values.companyRut || undefined,
                                industry: values.companyIndustry || undefined,
                                userId: "", // Se asignará después
                            });

                            const createData: CreateUserDto = {
                                email: values.email,
                                password: values.password,
                                firstName: values.firstName,
                                lastName: values.lastName,
                                role: values.role as UserRole,
                            };

                            const createdUser = await createMutation.mutateAsync(createData);

                            // Actualizar la empresa con el userId
                            await fetch(`/api/companies/${company.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: createdUser.id }),
                            });

                            toast.success("Usuario y empresa creados correctamente");
                        } catch (error) {
                            console.error(error);
                            toast.error("Error al crear usuario y empresa");
                        }
                    } else if (values.role === UserRole.GUEST) {
                        // TODO: Enviar invitación por email para GUEST
                        toast.info("Funcionalidad de invitación en desarrollo");
                    } else {
                        try {
                            const createData: CreateUserDto = {
                                email: values.email,
                                password: values.password,
                                firstName: values.firstName,
                                lastName: values.lastName,
                                role: values.role as UserRole,
                            };
                            await createMutation.mutateAsync(createData);
                            toast.success("Usuario creado correctamente");
                        } catch (error: any) {
                            console.log("❌ Error completo:", error);
                            console.log("❌ Error.response:", error?.response);
                            console.log("❌ Error.response.data:", error?.response?.data);
                            const errorMessage = error?.response?.data?.message || "Error al crear usuario";
                            toast.error(errorMessage);
                            throw error; // Re-throw to prevent onClose
                        }
                    }
                }
            },
            validate: (values) => {
                const errors: Record<string, string> = {};
                if (!values.firstName) errors.firstName = "Requerido";
                if (!values.lastName) errors.lastName = "Requerido";
                if (!values.email) errors.email = "Requerido";

                if (!isEditMode) {
                    // Validar según el rol
                    if (values.role === UserRole.COMPANY) {
                        if (!values.companyName) errors.companyName = "Requerido";
                    } else if (values.role === UserRole.EVALUATOR || values.role === UserRole.GUEST) {
                        if (!values.companyId) errors.companyId = "Requerido";
                    } else if (values.role !== UserRole.GUEST) {
                        if (!values.password) errors.password = "Requerido";
                    }
                }

                return errors;
            },
        });

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value;
        setSelectedRole(newRole);
        setValues({ ...values, role: newRole });
    };

    const createMutation = useMutation({
        mutationFn: userService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            onClose();
        },
        onError: (error: any) => {
            console.log("❌ createMutation.onError ejecutado");
            console.log("❌ Error:", error);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: UpdateUserDto;
        }) => userService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            onClose();
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? "Editar Usuario" : "Crear Usuario"}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.firstName && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.firstName}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apellido *
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={values.lastName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.lastName && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.lastName}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && (
                        <p className="text-red-600 text-sm mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol *
                    </label>
                    <select
                        name="role"
                        value={values.role}
                        onChange={handleRoleChange}
                        disabled={isEditMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                        <option value="admin_talentree">Admin Talentree</option>
                        <option value="company">Empresa</option>
                        <option value="evaluator">Evaluador</option>
                        <option value="worker">Trabajador</option>
                        <option value="guest">Invitado</option>
                    </select>
                </div>

                {/* Campos para COMPANY */}
                {!isEditMode && selectedRole === UserRole.COMPANY && (
                    <div className="border-t border-b border-blue-200 bg-blue-50 -mx-6 px-6 py-4 space-y-3">
                        <h3 className="text-sm font-semibold text-blue-800 mb-2">
                            Datos de la Empresa
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre de la Empresa *
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={values.companyName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.companyName && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.companyName}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    RUT
                                </label>
                                <input
                                    type="text"
                                    name="companyRut"
                                    value={values.companyRut}
                                    onChange={handleChange}
                                    placeholder="12345678-9"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Industria
                                </label>
                                <input
                                    type="text"
                                    name="companyIndustry"
                                    value={values.companyIndustry}
                                    onChange={handleChange}
                                    placeholder="ej: Minería"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Select de empresa para EVALUATOR y GUEST */}
                {!isEditMode && (selectedRole === UserRole.EVALUATOR || selectedRole === UserRole.GUEST) && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Empresa *
                        </label>
                        <select
                            name="companyId"
                            value={values.companyId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar empresa...</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                        {errors.companyId && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.companyId}
                            </p>
                        )}
                    </div>
                )}

                {/* Contraseña - Solo para roles que NO son GUEST */}
                {!isEditMode && selectedRole !== UserRole.GUEST && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.password && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>
                )}

                {/* Mensaje informativo para GUEST */}
                {!isEditMode && selectedRole === UserRole.GUEST && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Se enviará una invitación por correo electrónico al usuario invitado.
                        </p>
                    </div>
                )}

                <div className="flex gap-3 justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting
                            ? "Guardando..."
                            : isEditMode
                            ? "Actualizar"
                            : "Crear"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
