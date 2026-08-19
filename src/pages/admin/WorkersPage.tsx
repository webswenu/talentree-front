import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkers, useDeleteWorker } from "../../hooks/useWorkers";
import {
    Worker,
    WorkerStatus,
    WorkerStatusLabels,
    WorkerStatusColors,
} from "../../types/worker.types";
import { WorkerFilters } from "../../services/workers.service";
import WorkerModal from "../../components/admin/WorkerModal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { Pagination } from "../../components/common/Pagination";
import { useAuthStore } from "../../store/authStore";
import { Permission, hasPermission } from "../../utils/permissions";
import { UserRole } from "../../types/user.types";
import { EyeIcon, EditIcon, TrashIcon } from "../../components/common/ActionIcons";
import { ListError } from "../../components/common/ListError";
import { useDebounce } from "../../hooks/useDebounce";
import { toast } from "../../utils/toast";
import { getApiErrorMessage } from "../../utils/apiError";

export default function WorkersPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    // P-36: sin esto se consultaba al servidor en cada tecla.
    const busqueda = useDebounce(search, 300);
    const [statusFilter, setStatusFilter] = useState<string>("");

    // Detectar si estamos en admin o evaluador para usar la ruta correcta
    const isEvaluator = location.pathname.includes("/evaluador");
    const processBaseRoute = isEvaluator ? "/evaluador/procesos" : "/admin/procesos";

    // Obtener el companyId si el usuario es de tipo COMPANY o GUEST
    const companyId =
        (user?.role === UserRole.COMPANY || user?.role === UserRole.GUEST)
            ? (user?.companyId || user?.company?.id || user?.belongsToCompany?.id)
            : undefined;

    // Memoizar filtros para evitar re-fetches innecesarios
    const filters = useMemo<WorkerFilters>(
        () => ({
            page,
            limit,
            ...(busqueda && { search: busqueda }),
            ...(statusFilter && { status: statusFilter }),
            ...(companyId && { companyId }),
        }),
        [page, limit, busqueda, statusFilter, companyId]
    );

    const {
        data: workersData,
        isLoading,
        error,
        refetch,
    } = useWorkers(filters);
    const deleteMutation = useDeleteWorker();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>();
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

    const handleEdit = (worker: Worker) => {
        setSelectedWorker(worker);
        setIsModalOpen(true);
    };

    const handleDelete = (worker: Worker) => {
        setWorkerToDelete(worker);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!workerToDelete) return;

        try {
            await deleteMutation.mutateAsync(workerToDelete.id);
            setIsConfirmDeleteOpen(false);
            setWorkerToDelete(null);
        } catch (err) {
            console.error(err);
            // El modal de confirmación queda abierto y el trabajador sigue en
            // la lista: sin este aviso parecía que el botón no hacía nada.
            // El backend suele explicar el motivo (por ejemplo, que el
            // candidato está asociado a un proceso).
            toast.error(
                getApiErrorMessage(
                    err,
                    "No pudimos eliminar al trabajador. Intenta nuevamente."
                )
            );
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmDeleteOpen(false);
        setWorkerToDelete(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorker(undefined);
    };

    const canCreate =
        user && hasPermission(user.role, Permission.WORKERS_CREATE);
    const canEdit = user && hasPermission(user.role, Permission.WORKERS_EDIT);
    const canDelete =
        user && hasPermission(user.role, Permission.WORKERS_DELETE);

    const pageTitle =
        user?.role === UserRole.ADMIN_TALENTREE ? "Trabajadores" : "Candidatos";

    const getBaseRoute = () => {
        switch (user?.role) {
            case UserRole.ADMIN_TALENTREE:
                return "/admin/trabajadores";
            case UserRole.COMPANY:
                return "/empresa/trabajadores";
            case UserRole.EVALUATOR:
                return "/evaluador/trabajadores";
            case UserRole.GUEST:
                return "/invitado/trabajadores";
            default:
                return "/admin/trabajadores";
        }
    };

    const baseRoute = getBaseRoute();

    const handleViewDetail = (workerId: string) => {
        navigate(`${baseRoute}/${workerId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">
                    Cargando {pageTitle.toLowerCase()}...
                </div>
            </div>
        );
    }

    // P-61: un fallo de red se veía como una lista vacía. Va DESPUÉS del
    // estado de carga y ANTES del vacío, para no confundirlos.
    if (error) {
        return (
            <ListError
                error={error}
                recurso="los candidatos"
                onReintentar={() => refetch()}
            />
        );
    }

    const workers = workersData?.data || [];
    const meta = workersData?.meta;

    const stats = {
        total: meta?.total || 0,
        withUser: workers.filter((w) => w.user).length,
        withCV: workers.filter((w) => w.cvUrl).length,
        inProcesses: workers.filter(
            (w) => w.workerProcesses && w.workerProcesses.length > 0
        ).length,
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 md:pr-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {pageTitle}
                        </h1>
                        <p className="text-gray-500 text-sm mt-2">
                            Visualiza y administra todos los candidatos registrados. Accede a su información personal, revisa sus postulaciones a procesos, consulta tests realizados y descarga reportes generados. Utiliza los filtros para buscar por nombre, email, RUT o estado.
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary w-full md:w-auto md:flex-shrink-0"
                        >
                            + Nuevo Trabajador
                        </button>
                    )}
                </div>
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
                            placeholder="Buscar por nombre, RUT, email..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        {/*
                            P-67. El desplegable ofrecía Activo/Inactivo/Pendiente
                            y filtraba por `worker.status`, un campo que no existe
                            en la tabla: la consulta fallaba con un error de base
                            de datos que llegaba como un 400 sin explicación.

                            El estado de un candidato es su situación EN UN
                            PROCESO (worker_processes.status), no un atributo
                            suyo: la misma persona puede estar aprobada en un
                            proceso y rechazada en otro. La etiqueta y las
                            opciones ahora dicen eso.
                        */}
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado en el proceso
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
                            <option value="pending">Postulado</option>
                            <option value="in_process">En evaluación</option>
                            <option value="completed">Tests completados</option>
                            <option value="approved">Aprobado</option>
                            <option value="rejected">Rechazado</option>
                            <option value="hired">Contratado</option>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total Trabajadores</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {stats.total}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Con Usuario Activo</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.withUser}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Con CV Cargado</p>
                    <p className="text-2xl font-bold text-green-600">
                        {stats.withCV}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">En Procesos</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {stats.inProcesses}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                RUT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Procesos
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ciudad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Habilidades
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {workers?.map((worker) => (
                            <tr key={worker.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div
                                                    className="text-sm font-medium text-gray-900 max-w-[18rem] truncate"
                                                    title={worker.firstName}
                                                >
                                                    {worker.firstName}{" "}
                                                {worker.lastName}
                                            </div>
                                            {worker.education && (
                                                <div className="text-sm text-gray-500">
                                                    {worker.education}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {worker.rut}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {worker.email}
                                </td>
                                <td className="px-6 py-4">
                                    {worker.workerProcesses &&
                                    worker.workerProcesses.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {worker.workerProcesses
                                                .filter((wp) => wp.process)
                                                .slice(0, 2)
                                                .map((wp) => (
                                                    <div
                                                        key={wp.id}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span
                                                            className="text-xs text-blue-600 hover:underline cursor-pointer"
                                                            onClick={() =>
                                                                navigate(
                                                                    `${processBaseRoute}/${wp.process.id}`
                                                                )
                                                            }
                                                        >
                                                            {wp.process.name}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                                                WorkerStatusColors[
                                                                    wp.status as WorkerStatus
                                                                ] || "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {
                                                                WorkerStatusLabels[
                                                                    wp.status as WorkerStatus
                                                                ] || wp.status
                                                            }
                                                        </span>
                                                    </div>
                                                ))}
                                            {worker.workerProcesses.filter((wp) => wp.process).length >
                                                2 && (
                                                <span className="text-xs text-gray-500">
                                                    +
                                                    {worker.workerProcesses.filter((wp) => wp.process)
                                                        .length - 2}{" "}
                                                    más
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">
                                            Sin procesos
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {worker.city || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {worker.skills &&
                                    worker.skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {worker.skills
                                                .slice(0, 2)
                                                .map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            {worker.skills.length > 2 && (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    +{worker.skills.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">
                                            -
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() =>
                                            handleViewDetail(worker.id)
                                        }
                                        className="text-blue-600 hover:text-blue-900 mr-4 p-2 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                        title="Ver detalle"
                                    >
                                        <EyeIcon />
                                    </button>
                                    {canEdit && (
                                        <button
                                            onClick={() => handleEdit(worker)}
                                            className="text-orange-600 hover:text-orange-900 mr-4 p-2 hover:bg-orange-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                            title="Editar"
                                        >
                                            <EditIcon />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(worker)}
                                            disabled={deleteMutation.isPending}
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
                </div>

                {/* Mostrar mensaje si no hay resultados */}
                {!isLoading && workers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {search || statusFilter
                            ? "No se encontraron trabajadores con los filtros aplicados"
                            : "No hay trabajadores registrados"}
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
                <WorkerModal
                    worker={selectedWorker}
                    onClose={handleCloseModal}
                />
            )}

            {canDelete && (
                <ConfirmModal
                    isOpen={isConfirmDeleteOpen}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    title="Eliminar Trabajador"
                    message={`¿Estás seguro de eliminar al trabajador "${workerToDelete?.firstName} ${workerToDelete?.lastName}"? Esta acción no se puede deshacer.`}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    isLoading={deleteMutation.isPending}
                />
            )}
        </div>
    );
}
