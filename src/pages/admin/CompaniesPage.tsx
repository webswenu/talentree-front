import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    useCompanies,
    useCompaniesStats,
    useDeleteCompany,
    useUpdateCompany,
} from "../../hooks/useCompanies";
import { Company } from "../../types/company.types";
import { CompanyModal } from "../../components/admin/CompanyModal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { useAuthStore } from "../../store/authStore";
import { Permission, hasPermission } from "../../utils/permissions";
import { toast } from "../../utils/toast";
import { getApiErrorMessage } from "../../utils/apiError";
import { EditIcon, TrashIcon } from "../../components/common/ActionIcons";
import { ClipboardList, PowerOff, Power } from "lucide-react";
import { ListError } from "../../components/common/ListError";
import { AvisoBorrado } from "../../components/common/AvisoBorrado";
import companiesService from "../../services/companies.service";
import type { ImpactoBorrado } from "../../services/companies.service";

const PAGE_SIZE = 10;

export const CompaniesPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [page, setPage] = useState(1);

    // La búsqueda se resuelve en el backend sobre TODAS las empresas, no solo
    // sobre la página cargada. Se espera a que el usuario deje de escribir.
    useEffect(() => {
        const timer = setTimeout(() => {
            setAppliedSearch(searchTerm.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const {
        data: companiesData,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useCompanies({
        page,
        limit: PAGE_SIZE,
        search: appliedSearch || undefined,
    });

    // Los totales salen del endpoint de estadísticas: cuentan sobre toda la
    // base, no sobre la página que se está mostrando.
    const { data: stats } = useCompaniesStats();

    // Detect if in admin or evaluador
    const baseRoute = location.pathname.includes("/evaluador") ? "/evaluador" : "/admin";
    const companies = companiesData?.data || [];
    const meta = companiesData?.meta;
    const totalPages = meta?.totalPages || 1;
    const deleteMutation = useDeleteCompany();
    const updateMutation = useUpdateCompany();
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

    // Eliminar una empresa ahora SÍ es posible aunque tenga procesos, pero se
    // lleva todo lo que cuelga de ellos. Se consulta antes de confirmar.
    const [impacto, setImpacto] = useState<ImpactoBorrado | undefined>();
    const [cargandoImpacto, setCargandoImpacto] = useState(false);

    const handleDelete = async (company: Company) => {
        setCompanyToDelete(company);
        setImpacto(undefined);
        setIsConfirmDeleteOpen(true);
        setCargandoImpacto(true);
        try {
            setImpacto(await companiesService.getImpactoBorrado(company.id));
        } catch {
            // Si no se puede consultar, la confirmación cae al texto genérico.
        } finally {
            setCargandoImpacto(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!companyToDelete) return;

        try {
            await deleteMutation.mutateAsync(companyToDelete.id);
            toast.success("Empresa eliminada correctamente");
            setIsConfirmDeleteOpen(false);
            setCompanyToDelete(null);
        } catch (err: unknown) {
            toast.error(
                getApiErrorMessage(err, "Error al eliminar la empresa"),
                { duration: 5000 }
            );
            // No cerramos el modal para que el usuario pueda ver el error
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmDeleteOpen(false);
        setCompanyToDelete(null);
    };

    const handleToggleActive = async (company: Company) => {
        try {
            await updateMutation.mutateAsync({
                id: company.id,
                data: { isActive: !company.isActive },
            });
            toast.success(
                `Empresa ${!company.isActive ? "activada" : "desactivada"} correctamente`
            );
        } catch (err: unknown) {
            toast.error(
                getApiErrorMessage(
                    err,
                    "Error al cambiar el estado de la empresa"
                )
            );
        }
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

    // P-61: había mensaje, pero sin motivo y sin salida: la única forma de
    // recuperarse era recargar la página a mano.
    if (error) {
        return (
            <ListError
                error={error}
                recurso="las empresas"
                onReintentar={() => refetch()}
            />
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 md:pr-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Empresas
                        </h1>
                        
                        <p className="text-gray-500 text-sm mt-2">
                            Administra las empresas registradas en el sistema. Puedes crear nuevas empresas, editar su información, ver sus procesos asociados y eliminarlas cuando sea necesario. Usa la barra de búsqueda para filtrar por nombre, RUT, industria, ciudad o email.
                        </p>
                    </div>
                    {canCreate && (
                        <button onClick={handleCreate} className="btn-primary w-full md:w-auto md:flex-shrink-0">
                            + Nueva Empresa
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="card">
                    <p className="text-sm text-gray-600">Total Empresas</p>
                    <p className="text-3xl font-bold text-primary-600">
                        {stats?.total ?? "-"}
                    </p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Empresas Activas</p>
                    <p className="text-3xl font-bold text-green-600">
                        {stats?.active ?? "-"}
                    </p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Empresas Inactivas</p>
                    <p className="text-3xl font-bold text-gray-600">
                        {stats?.inactive ?? "-"}
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar empresas
                </label>
                <input
                    type="text"
                    placeholder="Buscar por nombre, RUT, industria, ciudad o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-full"
                />
                {appliedSearch && (
                    <p className="text-sm text-gray-500 mt-2">
                        {meta?.total ?? 0} empresa
                        {(meta?.total ?? 0) === 1 ? "" : "s"} coinciden con "
                        {appliedSearch}"
                        {isFetching && " · buscando..."}
                    </p>
                )}
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
                                                <div
                                                    className="text-sm font-medium text-gray-900 max-w-[18rem] truncate"
                                                    title={company.name}
                                                >
                                                    {company.name}
                                                </div>
                                                {/* La empresa puede no tener
                                                    representante todavia: se
                                                    dice, en vez de dejar la
                                                    celda vacia como si faltara
                                                    cargar el dato. */}
                                                <div
                                                    className="text-sm text-gray-500 max-w-[18rem] truncate"
                                                    title={company.user?.email}
                                                >
                                                    {company.user?.email || (
                                                        <span className="italic text-gray-400">
                                                            Sin representante
                                                        </span>
                                                    )}
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
                                            className="text-blue-600 hover:text-blue-900 mr-4 p-2 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                            title="Ver procesos"
                                        >
                                            <ClipboardList size={20} />
                                        </button>
                                        {canEdit && (
                                            <button
                                                onClick={() =>
                                                    handleToggleActive(company)
                                                }
                                                disabled={
                                                    updateMutation.isPending
                                                }
                                                className={`mr-4 p-2 rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-50 ${
                                                    company.isActive
                                                        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                                        : "text-green-600 hover:text-green-900 hover:bg-green-50"
                                                }`}
                                                title={
                                                    company.isActive
                                                        ? "Desactivar empresa"
                                                        : "Activar empresa"
                                                }
                                            >
                                                {company.isActive ? (
                                                    <PowerOff size={20} />
                                                ) : (
                                                    <Power size={20} />
                                                )}
                                            </button>
                                        )}
                                        {canEdit && (
                                            <button
                                                onClick={() =>
                                                    handleEdit(company)
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
                                                    handleDelete(company)
                                                }
                                                disabled={
                                                    deleteMutation.isPending
                                                }
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50 p-2 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                                title="Eliminar"
                                            >
                                                <TrashIcon />
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
                                {appliedSearch
                                    ? `No se encontraron empresas para "${appliedSearch}"`
                                    : "No hay empresas registradas"}
                            </p>
                            {!appliedSearch && canCreate && (
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

                {/* Paginación */}
                {meta && meta.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t">
                        <p className="text-sm text-gray-600">
                            Mostrando{" "}
                            <span className="font-medium">
                                {(meta.page - 1) * meta.limit + 1}
                            </span>
                            {" - "}
                            <span className="font-medium">
                                {Math.min(meta.page * meta.limit, meta.total)}
                            </span>{" "}
                            de <span className="font-medium">{meta.total}</span>{" "}
                            empresas
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1 || isFetching}
                                className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-gray-600 px-2">
                                Página {meta.page} de {totalPages}
                            </span>
                            <button
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page >= totalPages || isFetching}
                                className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
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
                message={
                    <AvisoBorrado
                        queSeElimina={`la empresa "${companyToDelete?.name}"`}
                        impacto={impacto}
                        cargando={cargandoImpacto}
                    />
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};
