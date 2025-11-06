import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCompanies, useDeleteCompany } from "../../hooks/useCompanies";
import { Company } from "../../types/company.types";
import { CompanyModal } from "../../components/admin/CompanyModal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { useAuthStore } from "../../store/authStore";
import { Permission, hasPermission } from "../../utils/permissions";
import { toast } from "../../utils/toast";

export const CompaniesPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: companiesData, isLoading, error } = useCompanies();

    // Detect if in admin or evaluador
    const baseRoute = location.pathname.includes("/evaluador") ? "/evaluador" : "/admin";
    const companies = companiesData?.data || [];
    const deleteMutation = useDeleteCompany();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(
        null
    );
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(
        null
    );

    const canCreate =
        user && hasPermission(user.role, Permission.COMPANIES_CREATE);
    const canEdit = user && hasPermission(user.role, Permission.COMPANIES_EDIT);
    const canDelete =
        user && hasPermission(user.role, Permission.COMPANIES_DELETE);

    const handleEdit = (company: Company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCompany(null);
        setIsModalOpen(true);
    };

    const handleDelete = (company: Company) => {
        setCompanyToDelete(company);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!companyToDelete) return;

        try {
            await deleteMutation.mutateAsync(companyToDelete.id);
            toast.success("Empresa eliminada correctamente");
            setIsConfirmDeleteOpen(false);
            setCompanyToDelete(null);
        } catch (err: unknown) {
            // Extraer mensaje de error del backend
            let errorMessage = "Error al eliminar la empresa";
            
            if (err && typeof err === "object" && "response" in err) {
                const axiosError = err as { 
                    response?: { 
                        data?: { 
                            message?: string | string[];
                        } 
                    } 
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMessage = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMessage = message[0];
                } else if (typeof axiosError.response?.data === "string") {
                    errorMessage = axiosError.response.data;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            
            toast.error(errorMessage, { duration: 5000 });
            // No cerramos el modal para que el usuario pueda ver el error
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmDeleteOpen(false);
        setCompanyToDelete(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCompany(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando empresas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                Error al cargar las empresas
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Empresas
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Gestión de empresas clientes
                    </p>
                </div>
                {canCreate && (
                    <button onClick={handleCreate} className="btn-primary">
                        + Nueva Empresa
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="card">
                    <p className="text-sm text-gray-600">Total Empresas</p>
                    <p className="text-3xl font-bold text-primary-600">
                        {companies?.length || 0}
                    </p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Empresas Activas</p>
                    <p className="text-3xl font-bold text-green-600">
                        {companies?.filter((c) => c.isActive).length || 0}
                    </p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Empresas Inactivas</p>
                    <p className="text-3xl font-bold text-gray-600">
                        {companies?.filter((c) => !c.isActive).length || 0}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empresa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    RUT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Industria
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ciudad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {companies?.map((company) => (
                                <tr
                                    key={company.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {company.logo ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={company.logo}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <span className="text-primary-600 font-medium">
                                                            {company.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {company.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {company.user?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {company.rut}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {company.industry || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {company.city || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                company.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {company.isActive
                                                ? "Activa"
                                                : "Inactiva"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `${baseRoute}/procesos?companyId=${company.id}`
                                                )
                                            }
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Procesos
                                        </button>
                                        {canEdit && (
                                            <button
                                                onClick={() =>
                                                    handleEdit(company)
                                                }
                                                className="text-primary-600 hover:text-primary-900 mr-4"
                                            >
                                                Editar
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() =>
                                                    handleDelete(company)
                                                }
                                                disabled={
                                                    deleteMutation.isPending
                                                }
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {companies?.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">
                                No hay empresas registradas
                            </p>
                            {canCreate && (
                                <button
                                    onClick={handleCreate}
                                    className="btn-primary mt-4"
                                >
                                    Crear primera empresa
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <CompanyModal
                    company={selectedCompany}
                    onClose={handleCloseModal}
                />
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={isConfirmDeleteOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Eliminar Empresa"
                message={`¿Estás seguro de eliminar la empresa "${companyToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};
