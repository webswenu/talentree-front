import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/user.service";
import companiesService from "../../services/companies.service";
import { Modal } from "../../components/common/Modal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { InputField, SelectField } from "../../components/common/FormField";
import { useForm } from "../../hooks/useForm";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";
import { useFilter } from "../../hooks/useFilter";
import { toast } from "../../utils/toast";
import { UserRole, User } from "../../types/user.types";
import { useAuthStore } from "../../store/authStore";
import { Permission, hasPermission } from "../../utils/permissions";
import { EditIcon, TrashIcon } from "../../components/common/ActionIcons";
import { useCompanies, useCreateCompany } from "../../hooks/useCompanies";
import { useCreateInvitation } from "../../hooks/useInvitations";

interface UserFormData extends Record<string, unknown> {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: UserRole;
    companyName?: string;
    companyRut?: string;
    companyIndustry?: string;
    companyId?: string;
}

const ROLE_OPTIONS = [
    { value: UserRole.ADMIN_TALENTREE, label: "Admin Talentree" },
    { value: UserRole.COMPANY, label: "Empresa" },
    { value: UserRole.EVALUATOR, label: "Evaluador" },
    { value: UserRole.WORKER, label: "Trabajador" },
    { value: UserRole.GUEST, label: "Invitado" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Activos" },
    { value: "inactive", label: "Inactivos" },
];

export const UsersPage = () => {
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.WORKER);
    const debouncedSearch = useDebounce(searchTerm, 300);

    const { data: companiesData } = useCompanies();
    const companies = companiesData?.data || [];
    const createCompanyMutation = useCreateCompany();
    const createInvitationMutation = useCreateInvitation();

    const canCreate =
        currentUser && hasPermission(currentUser.role, Permission.USERS_CREATE);
    const canEdit =
        currentUser && hasPermission(currentUser.role, Permission.USERS_EDIT);
    const canDelete =
        currentUser && hasPermission(currentUser.role, Permission.USERS_DELETE);

    const { filters, setFilter, clearFilters } = useFilter({
        role: "all",
        status: "all",
    });

    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => userService.getAll(),
    });

    const {
        currentPage,
        totalPages,
        paginatedData,
        goToPage,
        nextPage,
        prevPage,
    } = usePagination(
        useMemo(() => {
            if (!users) return [];

            return users.filter((user: User) => {
                const matchesSearch =
                    user.firstName
                        ?.toLowerCase()
                        .includes(debouncedSearch.toLowerCase()) ||
                    user.lastName
                        ?.toLowerCase()
                        .includes(debouncedSearch.toLowerCase()) ||
                    user.email
                        ?.toLowerCase()
                        .includes(debouncedSearch.toLowerCase());

                const matchesRole =
                    filters.role === "all" || user.role === filters.role;
                const matchesStatus =
                    filters.status === "all" ||
                    (filters.status === "active" && user.isActive) ||
                    (filters.status === "inactive" && !user.isActive);

                return matchesSearch && matchesRole && matchesStatus;
            });
        }, [users, debouncedSearch, filters]),
        10
    );

    const createMutation = useMutation({
        mutationFn: (data: Required<UserFormData>) => userService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Usuario creado exitosamente");
            setShowModal(false);
            resetForm();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Error al crear usuario");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Partial<UserFormData>;
        }) => userService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Usuario actualizado exitosamente");
            setShowModal(false);
            setEditingUser(null);
            resetForm();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Error al actualizar usuario");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => userService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Usuario eliminado exitosamente");
            setDeletingUser(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Error al eliminar usuario");
        },
    });

    const {
        values,
        errors,
        handleChange,
        handleSubmit,
        reset: resetForm,
        setValues,
    } = useForm<UserFormData>({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: UserRole.WORKER,
            companyName: "",
            companyRut: "",
            companyIndustry: "",
            companyId: "",
        },
        onSubmit: async (data) => {
            if (editingUser) {
                const updateData = { ...data };
                if (!updateData.password) {
                    delete updateData.password;
                }
                updateMutation.mutate({ id: editingUser.id, data: updateData });
            } else {
                // Si el rol es COMPANY, crear la empresa primero
                if (data.role === UserRole.COMPANY) {
                    try {
                        const company = await createCompanyMutation.mutateAsync({
                            name: data.companyName || "",
                            rut: data.companyRut || undefined,
                            industry: data.companyIndustry || undefined,
                        });

                        const createData: any = {
                            email: data.email,
                            password: data.password || "",
                            firstName: data.firstName,
                            lastName: data.lastName,
                            role: data.role,
                        };

                        const createdUser = await createMutation.mutateAsync(createData);

                        // Actualizar la empresa con el userId
                        await companiesService.update(company.id, { userId: createdUser.id });

                        queryClient.invalidateQueries({ queryKey: ["users"] });
                        queryClient.invalidateQueries({ queryKey: ["companies"] });
                        toast.success("Usuario y empresa creados correctamente");
                        setShowModal(false);
                        resetForm();
                    } catch (error) {
                        console.error(error);
                        toast.error("Error al crear usuario y empresa");
                    }
                } else if (data.role === UserRole.GUEST) {
                    // Crear invitación para GUEST
                    const invitationData = {
                        email: data.email,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        companyId: data.companyId,
                    };

                    console.log('Datos de invitación a enviar:', invitationData);
                    console.log('companyId:', data.companyId);

                    await createInvitationMutation.mutateAsync(invitationData);
                    setShowModal(false);
                    resetForm();
                } else {
                    // Para otros roles (EVALUATOR, ADMIN_TALENTREE, WORKER)
                    if (!data.password) {
                        toast.error("La contraseña es requerida");
                        return;
                    }
                    const createData: any = {
                        email: data.email,
                        password: data.password,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        role: data.role,
                    };
                    // EVALUATOR no lleva companyId - es un evaluador global de admin talentree
                    createMutation.mutate(createData);
                }
            }
        },
        validate: (values) => {
            const errors: Record<string, string> = {};

            if (!values.firstName?.trim()) {
                errors.firstName = "El nombre es requerido";
            }

            if (!values.lastName?.trim()) {
                errors.lastName = "El apellido es requerido";
            }

            if (!values.email?.trim()) {
                errors.email = "El email es requerido";
            } else if (!/\S+@\S+\.\S+/.test(values.email)) {
                errors.email = "Email inválido";
            }

            if (!editingUser) {
                // Validar según el rol
                if (values.role === UserRole.COMPANY) {
                    if (!values.companyName?.trim()) {
                        errors.companyName = "El nombre de la empresa es requerido";
                    }
                } else if (values.role === UserRole.GUEST) {
                    if (!values.companyId) {
                        errors.companyId = "Debes seleccionar una empresa";
                    }
                }

                // Validar contraseña solo para roles que NO sean GUEST
                if (values.role !== UserRole.GUEST) {
                    if (!values.password) {
                        errors.password = "La contraseña es requerida";
                    } else if (values.password.length < 6) {
                        errors.password = "La contraseña debe tener al menos 6 caracteres";
                    }
                }
            } else if (values.password && values.password.length < 6) {
                errors.password = "La contraseña debe tener al menos 6 caracteres";
            }

            return errors;
        },
    });

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setSelectedRole(user.role);
        setValues({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: "",
            role: user.role,
            companyName: "",
            companyRut: "",
            companyIndustry: "",
            companyId: "",
        });
        setShowModal(true);
    };

    const handleDelete = (user: User) => {
        setDeletingUser(user);
    };

    const confirmDelete = () => {
        if (deletingUser) {
            deleteMutation.mutate(deletingUser.id);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setSelectedRole(UserRole.WORKER);
        resetForm();
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as UserRole;
        setSelectedRole(newRole);
        handleChange(e);
    };

    const getRoleLabel = (role: string) => {
        const option = ROLE_OPTIONS.find((opt) => opt.value === role);
        return option?.label || role;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Usuarios del Sistema
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Gestiona los usuarios y sus permisos
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary w-full md:w-auto md:float-right md:-mt-16"
                    >
                        + Crear Usuario
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar por nombre o email..."
                    />

                    <select
                        value={filters.role}
                        onChange={(e) => setFilter("role", e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todos los roles</option>
                        {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilter("status", e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {(filters.role !== "all" ||
                    filters.status !== "all" ||
                    searchTerm) && (
                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            {paginatedData.length} resultado(s) encontrado(s)
                        </p>
                        <button
                            onClick={() => {
                                clearFilters();
                                setSearchTerm("");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Creación
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((user: User) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                                        {user.firstName?.charAt(
                                                            0
                                                        )}
                                                        {user.lastName?.charAt(
                                                            0
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">
                                                        {user.firstName}{" "}
                                                        {user.lastName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    user.isActive
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {user.isActive
                                                    ? "Activo"
                                                    : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {user.createdAt
                                                ? new Date(
                                                      user.createdAt
                                                  ).toLocaleDateString("es-CL")
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {canEdit && (
                                                <button
                                                    onClick={() =>
                                                        handleEdit(user)
                                                    }
                                                    className="text-orange-600 hover:text-orange-900 mr-4 p-2 hover:bg-orange-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                                    title="Editar"
                                                >
                                                    <EditIcon />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() =>
                                                        handleDelete(user)
                                                    }
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                                    title="Eliminar"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                            onPrevious={prevPage}
                            onNext={nextPage}
                        />
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Nombre"
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                            error={errors.firstName}
                            required
                        />

                        <InputField
                            label="Apellido"
                            name="lastName"
                            value={values.lastName}
                            onChange={handleChange}
                            error={errors.lastName}
                            required
                        />
                    </div>

                    <InputField
                        label="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />

                    <SelectField
                        label="Rol"
                        name="role"
                        value={values.role}
                        onChange={handleRoleChange}
                        error={errors.role}
                        options={ROLE_OPTIONS}
                        required
                        disabled={!!editingUser}
                    />

                    {/* Campos para COMPANY */}
                    {!editingUser && selectedRole === UserRole.COMPANY && (
                        <div className="border-t border-b border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-blue-800 mb-2">
                                Datos de la Empresa
                            </h3>
                            <InputField
                                label="Nombre de la Empresa"
                                name="companyName"
                                value={values.companyName || ""}
                                onChange={handleChange}
                                error={errors.companyName}
                                required
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <InputField
                                    label="RUT"
                                    name="companyRut"
                                    value={values.companyRut || ""}
                                    onChange={handleChange}
                                    placeholder="12345678-9"
                                />
                                <InputField
                                    label="Industria"
                                    name="companyIndustry"
                                    value={values.companyIndustry || ""}
                                    onChange={handleChange}
                                    placeholder="ej: Minería"
                                />
                            </div>
                        </div>
                    )}

                    {/* Select de empresa solo para GUEST */}
                    {!editingUser && selectedRole === UserRole.GUEST && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Empresa *
                            </label>
                            <select
                                name="companyId"
                                value={values.companyId || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccionar empresa...</option>
                                {companies.map((company: { id: string; name: string }) => (
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

                    {/* Contraseña - Solo para roles que NO son GUEST o en modo edición */}
                    {(editingUser || selectedRole !== UserRole.GUEST) && (
                        <InputField
                            label={
                                editingUser
                                    ? "Nueva Contraseña (dejar en blanco para mantener)"
                                    : "Contraseña"
                            }
                            name="password"
                            type="password"
                            value={values.password || ""}
                            onChange={handleChange}
                            error={errors.password}
                            required={!editingUser && selectedRole !== UserRole.GUEST}
                            helperText={
                                editingUser
                                    ? "Solo completa si deseas cambiar la contraseña"
                                    : "Mínimo 6 caracteres"
                            }
                        />
                    )}

                    {/* Mensaje informativo para GUEST */}
                    {!editingUser && selectedRole === UserRole.GUEST && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                                ℹ️ Se enviará una invitación por correo electrónico al usuario invitado.
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={
                                createMutation.isPending ||
                                updateMutation.isPending
                            }
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createMutation.isPending ||
                            updateMutation.isPending
                                ? "Guardando..."
                                : editingUser
                                ? "Actualizar Usuario"
                                : "Crear Usuario"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                onConfirm={confirmDelete}
                title="Eliminar Usuario"
                message={`¿Estás seguro de que deseas eliminar al usuario ${deletingUser?.firstName} ${deletingUser?.lastName}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};
