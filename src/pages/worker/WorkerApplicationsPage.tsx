import { useState, useMemo } from "react";
import { useWorkerProcesses } from "../../hooks/useWorkers";
import { useAuthStore } from "../../store/authStore";
import {
    WorkerStatusLabels,
    WorkerStatusColors,
    WorkerStatus,
} from "../../types/worker.types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchInput } from "../../components/common/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";

export const WorkerApplicationsPage = () => {
    const { user } = useAuthStore();
    const workerId = user?.worker?.id;
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    // Si viene con results=true, mostrar solo resultados finales
    const showResults = searchParams.get("results") === "true";
    const initialStatus = showResults ? "" : (searchParams.get("status") || "");
    const [statusFilter, setStatusFilter] = useState(initialStatus);

    const { data: applications, isLoading } = useWorkerProcesses(
        workerId || ""
    );

    const filteredApplications = useMemo(() => {
        if (!applications) return [];

        return applications.filter((app) => {
            const matchesSearch =
                debouncedSearch === "" ||
                app.process?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                app.process?.company?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                app.process?.position?.toLowerCase().includes(debouncedSearch.toLowerCase());

            // Si estamos en modo resultados, solo mostrar estados finales
            if (showResults) {
                const isFinalStatus = [
                    WorkerStatus.APPROVED,
                    WorkerStatus.REJECTED,
                    WorkerStatus.HIRED
                ].includes(app.status);
                return matchesSearch && isFinalStatus;
            }

            const matchesStatus = statusFilter === "" || app.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [applications, debouncedSearch, statusFilter, showResults]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando postulaciones...</div>
            </div>
        );
    }

    const stats = {
        total: filteredApplications?.length || 0,
        pending:
            filteredApplications?.filter((app) => app.status === WorkerStatus.PENDING).length || 0,
        inProcess:
            filteredApplications?.filter((app) => app.status === WorkerStatus.IN_PROCESS).length || 0,
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        if (status) {
            setSearchParams({ status });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    {showResults ? "Mis Resultados" : "Mis Postulaciones"}
                </h1>
                <p className="text-gray-600 mt-1">
                    {showResults
                        ? "Consulta los resultados finales de tus postulaciones (Aprobado, Rechazado, Contratado)"
                        : "Visualiza y gestiona todas tus postulaciones a procesos de selección"
                    }
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Buscar por proceso, empresa o cargo..."
                        />
                    </div>
                    <div>
                        {showResults ? (
                            <button
                                onClick={() => navigate("/trabajador/postulaciones")}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Ver Todas las Postulaciones
                            </button>
                        ) : (
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Todos los estados</option>
                                <option value={WorkerStatus.PENDING}>Pendiente</option>
                                <option value={WorkerStatus.IN_PROCESS}>En Proceso</option>
                                <option value={WorkerStatus.COMPLETED}>Completado</option>
                                <option value={WorkerStatus.APPROVED}>Aprobado</option>
                                <option value={WorkerStatus.REJECTED}>Rechazado</option>
                                <option value={WorkerStatus.HIRED}>Contratado</option>
                            </select>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {stats.total}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {stats.pending}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">En Proceso</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.inProcess}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Proceso
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Empresa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cargo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Postulación
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
                        {filteredApplications && filteredApplications.length > 0 ? (
                            filteredApplications.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {app.process.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {app.process.code}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {app.process.company?.name || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {app.process.position}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {app.appliedAt
                                            ? new Date(
                                                  app.appliedAt
                                              ).toLocaleDateString("es-CL")
                                            : new Date(
                                                  app.createdAt
                                              ).toLocaleDateString("es-CL")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                WorkerStatusColors[app.status]
                                            }`}
                                        >
                                            {WorkerStatusLabels[app.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/trabajador/postulaciones/${app.id}`
                                                )
                                            }
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-12 text-center text-gray-500"
                                >
                                    {applications && applications.length > 0 ? (
                                        <>
                                            No se encontraron postulaciones con los filtros aplicados.{" "}
                                            <button
                                                onClick={() => {
                                                    setSearchTerm("");
                                                    setStatusFilter("");
                                                    setSearchParams({});
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Limpiar filtros
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            No tienes postulaciones activas.{" "}
                                            <button
                                                onClick={() =>
                                                    navigate("/trabajador/procesos")
                                                }
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Ver procesos disponibles
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
};
