import { useState } from "react";
import { useProcesses, useDeleteProcess } from "../../hooks/useProcesses";
import {
    SelectionProcess,
    ProcessStatusLabels,
    ProcessStatusColors,
} from "../../types/process.types";
import { ProcessFilters } from "../../services/processes.service";
import ProcessModal from "../../components/admin/ProcessModal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { Pagination } from "../../components/common/Pagination";
import { useAuthStore } from "../../store/authStore";
import { Permission, hasPermission } from "../../utils/permissions";
import { UserRole } from "../../types/user.types";

export default function ProcessesPage() {
    const { user } = useAuthStore();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const filters: ProcessFilters = {
        page,
        limit,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
    };

    const { data: processesData, isLoading } = useProcesses(filters);
    const deleteMutation = useDeleteProcess();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<
        SelectionProcess | undefined
    >();
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [processToDelete, setProcessToDelete] =
        useState<SelectionProcess | null>(null);

    const handleEdit = (process: SelectionProcess) => {
        setSelectedProcess(process);
        setIsModalOpen(true);
    };

    const handleDelete = (process: SelectionProcess) => {
        setProcessToDelete(process);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!processToDelete) return;

        try {
            await deleteMutation.mutateAsync(processToDelete.id);
            setIsConfirmDeleteOpen(false);
            setProcessToDelete(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmDeleteOpen(false);
        setProcessToDelete(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProcess(undefined);
    };

    const getStatusBadge = (status: string) => {
        const color =
            ProcessStatusColors[status as keyof typeof ProcessStatusColors];
        const label =
            ProcessStatusLabels[status as keyof typeof ProcessStatusLabels];
        return (
            <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}
            >
                {label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando procesos...</div>
            </div>
        );
    }

    const canCreate =
        user && hasPermission(user.role, Permission.PROCESSES_CREATE);
    const canEdit = user && hasPermission(user.role, Permission.PROCESSES_EDIT);
    const canDelete =
        user && hasPermission(user.role, Permission.PROCESSES_DELETE);

    const getBaseUrl = () => {
        if (user?.role === UserRole.COMPANY) return "/empresa/procesos";
        if (user?.role === UserRole.GUEST) return "/invitado/procesos";
        if (user?.role === UserRole.EVALUATOR) return "/evaluador/procesos";
        return "/admin/procesos";
    };

    const processes = processesData?.data || [];
    const meta = processesData?.meta;

    const stats = {
        total: meta?.total || 0,
        draft: processes.filter((p) => p.status === "draft").length,
        active: processes.filter((p) => p.status === "active").length,
        completed: processes.filter((p) => p.status === "completed").length,
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Procesos de Selección
                </h1>
                {canCreate && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + Nuevo Proceso
                    </button>
                )}
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buscar
                        </label>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, posición, código..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos los estados</option>
                            <option value="draft">Borrador</option>
                            <option value="active">Activo</option>
                            <option value="completed">Completado</option>
                            <option value="archived">Archivado</option>
                        </select>
                    </div>
                </div>
                {(search || statusFilter) && (
                    <div className="mt-3">
                        <button
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("");
                                setPage(1);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {stats.total}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Borradores</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {stats.draft}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Activos</p>
                    <p className="text-2xl font-bold text-green-600">
                        {stats.active}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Completados</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.completed}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Empresa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Inicio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Fin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Máx. Trabajadores
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {processes?.map((process) => (
                            <tr key={process.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {process.name}
                                    </div>
                                    {process.description && (
                                        <div className="text-sm text-gray-500">
                                            {process.description.substring(
                                                0,
                                                50
                                            )}
                                            ...
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {process.company?.name || "N/A"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(process.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {process.startDate
                                        ? new Date(
                                              process.startDate
                                          ).toLocaleDateString()
                                        : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {process.endDate
                                        ? new Date(
                                              process.endDate
                                          ).toLocaleDateString()
                                        : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {process.maxWorkers || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() =>
                                            (window.location.href = `${getBaseUrl()}/${
                                                process.id
                                            }`)
                                        }
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Ver Detalle
                                    </button>
                                    {canEdit && (
                                        <button
                                            onClick={() => handleEdit(process)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Editar
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={() =>
                                                handleDelete(process)
                                            }
                                            disabled={deleteMutation.isPending}
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

                {/* Mostrar mensaje si no hay resultados */}
                {!isLoading && processes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {search || statusFilter
                            ? "No se encontraron procesos con los filtros aplicados"
                            : "No hay procesos registrados"}
                    </div>
                )}
            </div>

            {/* Paginación */}
            {meta && meta.totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}

            {canCreate && isModalOpen && (
                <ProcessModal
                    process={selectedProcess}
                    onClose={handleCloseModal}
                />
            )}

            {canDelete && (
                <ConfirmModal
                    isOpen={isConfirmDeleteOpen}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    title="Eliminar Proceso"
                    message={`¿Estás seguro de eliminar el proceso "${processToDelete?.name}"? Esta acción no se puede deshacer.`}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    isLoading={deleteMutation.isPending}
                />
            )}
        </div>
    );
}
