import { useState, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import {
    useWorkerProcesses,
    useApplyToProcess,
    useWorkerDashboardStats,
} from "../../hooks/useWorkers";
import { useProcesses } from "../../hooks/useProcesses";
import { WorkerStatus } from "../../types/worker.types";
import { ProcessStatus } from "../../types/process.types";
import { useNavigate } from "react-router-dom";
import { ApplyProcessModal } from "../../components/worker/ApplyProcessModal";
import { SearchInput } from "../../components/common/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";
import { useFilter } from "../../hooks/useFilter";
import { Modal } from "../../components/common/Modal";
import { toast } from "../../utils/toast";

export const WorkerDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const workerId = user?.worker?.id;

    const [selectedProcessId, setSelectedProcessId] = useState<string | null>(
        null
    );
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const applyMutation = useApplyToProcess();

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [showFilters, setShowFilters] = useState(false);

    const { filters, setFilter, clearFilters } = useFilter({
        ubicacion: "all",
        empresa: "all",
    });

    const {
        data: stats,
        isLoading: loadingStats,
    } = useWorkerDashboardStats(workerId);

    const { data: myApplications } = useWorkerProcesses(workerId || "");

    const { data: processesData } = useProcesses();
    const availableProcesses = useMemo(
        () => processesData?.data || [],
        [processesData]
    );

    const misAplicacionesCompletas =
        myApplications?.map((app) => {
            const testsTotal = app.process?.tests?.length || 0;
            const testsCompletados =
                app.testResponses?.filter((tr) => tr.isCompleted).length || 0;

            return {
                id: app.id,
                titulo: app.process?.name || "Proceso sin nombre",
                empresa: app.process?.company?.name || "Empresa",
                estado: app.status,
                estadoLabel: getStatusLabel(app.status),
                estadoColor: getStatusColor(app.status),
                fechaAplicacion: app.appliedAt
                    ? new Date(app.appliedAt).toLocaleDateString("es-CL")
                    : "N/A",
                fechaAplicacionRaw: app.appliedAt
                    ? new Date(app.appliedAt).getTime()
                    : app.createdAt
                    ? new Date(app.createdAt).getTime()
                    : 0,
                testsCompletados,
                testsTotal,
                mensaje: getStatusMessage(app.status),
                puntaje: app.totalScore,
            };
        }) || [];

    // Ordenar por fecha de aplicación (más reciente primero) y tomar las últimas 3
    const misAplicaciones = misAplicacionesCompletas
        .sort((a, b) => b.fechaAplicacionRaw - a.fechaAplicacionRaw)
        .slice(0, 3);

    const appliedProcessIds = useMemo(
        () => new Set(myApplications?.map((app) => app.process?.id) || []),
        [myApplications]
    );

    const empresasUnicas = useMemo(() => {
        const empresas = new Set(
            availableProcesses
                ?.filter(
                    (p) =>
                        p.status === ProcessStatus.ACTIVE &&
                        !appliedProcessIds.has(p.id)
                )
                .map((p) => p.company?.name)
                .filter(Boolean)
        );
        return ["all", ...Array.from(empresas)];
    }, [availableProcesses, appliedProcessIds]);

    const ubicacionesUnicas = useMemo(() => {
        const ubicaciones = new Set(
            availableProcesses
                ?.filter(
                    (p) =>
                        p.status === ProcessStatus.ACTIVE &&
                        !appliedProcessIds.has(p.id)
                )
                .map((p) => p.location)
                .filter(Boolean)
        );
        return ["all", ...Array.from(ubicaciones)];
    }, [availableProcesses, appliedProcessIds]);

    const ofertasDisponiblesFiltradas = useMemo(() => {
        return (
            availableProcesses
                ?.filter((process) => {
                    if (
                        process.status !== ProcessStatus.ACTIVE ||
                        appliedProcessIds.has(process.id)
                    ) {
                        return false;
                    }

                    const matchesSearch =
                        debouncedSearch === "" ||
                        process.name
                            ?.toLowerCase()
                            .includes(debouncedSearch.toLowerCase()) ||
                        process.company?.name
                            ?.toLowerCase()
                            .includes(debouncedSearch.toLowerCase()) ||
                        process.location
                            ?.toLowerCase()
                            .includes(debouncedSearch.toLowerCase()) ||
                        process.position
                            ?.toLowerCase()
                            .includes(debouncedSearch.toLowerCase());

                    const matchesUbicacion =
                        filters.ubicacion === "all" ||
                        process.location === filters.ubicacion;

                    const matchesEmpresa =
                        filters.empresa === "all" ||
                        process.company?.name === filters.empresa;

                    return matchesSearch && matchesUbicacion && matchesEmpresa;
                })
                .map((process) => ({
                    id: process.id,
                    titulo: process.name,
                    empresa: process.company?.name || "Empresa",
                    modalidad: "Tiempo completo",
                    ubicacion: process.location || "No especificado",
                    salario: "A convenir",
                    vacantes: process.vacancies || 1,
                    vence: process.endDate
                        ? new Date(process.endDate).toLocaleDateString("es-CL")
                        : "Sin fecha límite",
                    nuevo: false,
                    createdAt: process.createdAt
                        ? new Date(process.createdAt).getTime()
                        : 0,
                })) || []
        );
    }, [availableProcesses, appliedProcessIds, debouncedSearch, filters]);

    // Ordenar por fecha de creación (más reciente primero) y tomar las últimas 3
    const ofertasDisponibles = ofertasDisponiblesFiltradas
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 3);

    function getStatusLabel(status: WorkerStatus): string {
        const labels: Record<WorkerStatus, string> = {
            [WorkerStatus.PENDING]: "PENDIENTE",
            [WorkerStatus.IN_PROCESS]: "EN PROCESO",
            [WorkerStatus.APPROVED]: "APROBADO",
            [WorkerStatus.REJECTED]: "RECHAZADO",
            [WorkerStatus.HIRED]: "CONTRATADO",
            [WorkerStatus.COMPLETED]: "COMPLETADO",
        };
        return labels[status] || "DESCONOCIDO";
    }

    function getStatusColor(status: WorkerStatus): string {
        const colors: Record<WorkerStatus, string> = {
            [WorkerStatus.PENDING]: "blue",
            [WorkerStatus.IN_PROCESS]: "yellow",
            [WorkerStatus.APPROVED]: "green",
            [WorkerStatus.REJECTED]: "red",
            [WorkerStatus.HIRED]: "green",
            [WorkerStatus.COMPLETED]: "gray",
        };
        return colors[status] || "gray";
    }

    function getStatusMessage(status: WorkerStatus): string {
        const messages: Record<WorkerStatus, string> = {
            [WorkerStatus.PENDING]: "Esperando revisión",
            [WorkerStatus.IN_PROCESS]: "En evaluación",
            [WorkerStatus.APPROVED]: "Aprobado para siguiente etapa",
            [WorkerStatus.REJECTED]: "No seleccionado",
            [WorkerStatus.HIRED]: "Felicitaciones!",
            [WorkerStatus.COMPLETED]: "Completado",
        };
        return messages[status] || "";
    }

    const getEstadoColorClass = (color: string) => {
        switch (color) {
            case "yellow":
                return "bg-yellow-100 text-yellow-800";
            case "green":
                return "bg-green-100 text-green-800";
            case "blue":
                return "bg-blue-100 text-blue-800";
            case "red":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleApplyClick = (processId: string) => {
        setSelectedProcessId(processId);
        setIsConfirmOpen(true);
    };

    const handleConfirmApply = async () => {
        if (!selectedProcessId) {
            toast.error("No hay proceso seleccionado");
            return;
        }

        if (!workerId) {
            toast.error("Error: No tienes un perfil de trabajador asociado. Por favor contacta al administrador.");
            return;
        }

        try {
            await applyMutation.mutateAsync({
                workerId,
                processId: selectedProcessId,
            });
            setIsConfirmOpen(false);
            setSelectedProcessId(null);
            setIsSuccessModalOpen(true);
        } catch {
            toast.error("Error al postular. Por favor intenta nuevamente.");
        }
    };

    const handleCancelApply = () => {
        setIsConfirmOpen(false);
        setSelectedProcessId(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600 mt-1">
                    Encuentra tu próxima oportunidad laboral
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Aplicaciones
                            </p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {loadingStats ? "..." : stats?.aplicadas || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Postulaciones activas
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                En Proceso
                            </p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">
                                {loadingStats ? "..." : stats?.enProceso || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">⏳</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">En evaluación</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Finalizadas
                            </p>
                            <p className="text-3xl font-bold text-gray-600 mt-2">
                                {loadingStats ? "..." : stats?.finalizadas || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">✅</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Procesos completados
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Ofertas Nuevas
                            </p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {loadingStats ? "..." : stats?.disponibles || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🔍</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Disponibles para aplicar
                    </p>
                </div>
            </div>

            {/* Mis Aplicaciones */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Mis Aplicaciones
                    </h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {misAplicaciones.map((app) => (
                        <div
                            key={app.id}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {app.titulo}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoColorClass(
                                                app.estadoColor
                                            )}`}
                                        >
                                            {app.estadoLabel}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {app.empresa}
                                    </p>
                                    <div className="flex items-center gap-6 mt-2 text-sm">
                                        <span className="text-gray-600">
                                            Aplicado: {app.fechaAplicacion}
                                        </span>
                                        <span className="text-gray-600">
                                            • Tests: {app.testsCompletados}/
                                            {app.testsTotal} completados
                                        </span>
                                        {app.puntaje && (
                                            <span className="text-green-600 font-medium">
                                                • Puntaje: {app.puntaje}/100
                                            </span>
                                        )}
                                    </div>
                                    {app.mensaje && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Estado: {app.mensaje}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/trabajador/postulaciones/${app.id}`
                                        )
                                    }
                                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Ver Detalle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Footer - Ver todas las aplicaciones */}
                {misAplicacionesCompletas.length > 3 && (
                    <div className="px-6 py-3 border-t border-gray-200 text-center">
                        <button
                            onClick={() => navigate("/trabajador/postulaciones")}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Ver todas las aplicaciones (
                            {misAplicacionesCompletas.length}) →
                        </button>
                    </div>
                )}
            </div>

            {/* Ofertas Disponibles */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Ofertas Disponibles
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {ofertasDisponiblesFiltradas.length}{" "}
                                {ofertasDisponiblesFiltradas.length === 1
                                    ? "oportunidad"
                                    : "oportunidades"}{" "}
                                encontradas
                            </p>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2 border rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                                showFilters ||
                                filters.ubicacion !== "all" ||
                                filters.empresa !== "all"
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                />
                            </svg>
                            Filtros
                            {(filters.ubicacion !== "all" ||
                                filters.empresa !== "all") && (
                                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                    {(filters.ubicacion !== "all" ? 1 : 0) +
                                        (filters.empresa !== "all" ? 1 : 0)}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Barra de búsqueda */}
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar por nombre, empresa, ubicación o cargo..."
                        className="mb-4"
                    />

                    {/* Panel de filtros */}
                    {showFilters && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">
                                    Filtros
                                </h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ubicación
                                    </label>
                                    <select
                                        value={filters.ubicacion}
                                        onChange={(e) =>
                                            setFilter(
                                                "ubicacion",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">
                                            Todas las ubicaciones
                                        </option>
                                        {ubicacionesUnicas
                                            .filter((u) => u !== "all")
                                            .map((ubicacion) => (
                                                <option
                                                    key={ubicacion}
                                                    value={ubicacion}
                                                >
                                                    {ubicacion}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Empresa
                                    </label>
                                    <select
                                        value={filters.empresa}
                                        onChange={(e) =>
                                            setFilter("empresa", e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">
                                            Todas las empresas
                                        </option>
                                        {empresasUnicas
                                            .filter((e) => e !== "all")
                                            .map((empresa) => (
                                                <option
                                                    key={empresa}
                                                    value={empresa}
                                                >
                                                    {empresa}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="divide-y divide-gray-200">
                    {ofertasDisponibles.map((oferta) => (
                        <div
                            key={oferta.id}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {oferta.titulo}
                                        </h3>
                                        {oferta.nuevo && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                                                🆕 NUEVA
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {oferta.empresa}
                                    </p>
                                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                                        <span>{oferta.modalidad}</span>
                                        <span>• {oferta.ubicacion}</span>
                                        <span className="text-green-600 font-medium">
                                            • {oferta.salario}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span>{oferta.vacantes} vacantes</span>
                                        <span>• Vence: {oferta.vence}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleApplyClick(oferta.id)}
                                    disabled={applyMutation.isPending}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Postular
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Mensaje cuando no hay ofertas */}
                    {ofertasDisponibles.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-600 mb-2">
                                {debouncedSearch ||
                                filters.ubicacion !== "all" ||
                                filters.empresa !== "all"
                                    ? "No se encontraron ofertas con los criterios seleccionados"
                                    : "No hay ofertas disponibles en este momento"}
                            </p>
                            {(debouncedSearch ||
                                filters.ubicacion !== "all" ||
                                filters.empresa !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        clearFilters();
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Limpiar búsqueda y filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer - Ver todas las ofertas */}
                {ofertasDisponibles.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-200 text-center">
                        <button
                            onClick={() => navigate("/trabajador/procesos")}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Ver todas las ofertas (
                            {ofertasDisponiblesFiltradas.length}) →
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de confirmación */}
            <ApplyProcessModal
                isOpen={isConfirmOpen}
                onClose={handleCancelApply}
                onConfirm={handleConfirmApply}
                process={
                    availableProcesses?.find(
                        (p) => p.id === selectedProcessId
                    ) || null
                }
                isLoading={applyMutation.isPending}
            />

            {/* Modal de éxito */}
            <Modal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="¡Postulación Exitosa!"
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg
                            className="h-10 w-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Tu postulación ha sido registrada
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Puedes revisar el estado de tu postulación en la sección
                        "Mis Aplicaciones"
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => {
                                setIsSuccessModalOpen(false);
                                navigate("/trabajador/postulaciones");
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ver Mis Aplicaciones
                        </button>
                        <button
                            onClick={() => setIsSuccessModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Continuar Navegando
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
