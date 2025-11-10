import { useAuthStore } from "../../store/authStore";
import { useProcessesByCompany } from "../../hooks/useProcesses";
import { useCompanyDashboardStats } from "../../hooks/useCompanies";
import {
    ProcessStatus,
    SelectionProcess,
    WorkerStatus,
} from "../../types/process.types";
import { useNavigate } from "react-router-dom";

// Tipo para workers en el contexto de este componente
type WorkerInProcess = {
    id: string;
    status: WorkerStatus;
    appliedAt?: Date;
    worker?: {
        firstName: string;
        lastName: string;
    };
};

export const CompanyDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Para empresa: user.company.id (cuando el user ES dueño de la empresa)
    // Para invitado: user.belongsToCompany.id (cuando el user pertenece a una empresa)
    const companyId = user?.company?.id || user?.belongsToCompany?.id;

    const getBaseUrl = () => {
        if (user?.role === "guest") return "/invitado";
        return "/empresa";
    };

    const { data: processes } = useProcessesByCompany(companyId || "");

    const { data: dashboardStats, isLoading: isLoadingStats } =
        useCompanyDashboardStats(companyId);

    if (!companyId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Error</h2>
                    <p className="text-gray-600 mt-2">
                        No se encontró información de la empresa
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Por favor, cierre sesión e inicie sesión nuevamente
                    </p>
                </div>
            </div>
        );
    }

    const stats = {
        activos: dashboardStats?.procesosActivos.total || 0,
        candidatos: dashboardStats?.candidatos.total || 0,
        aprobados: dashboardStats?.candidatosAprobados.total || 0,
        completados: dashboardStats?.procesosCompletados.total || 0,
    };

    const procesosActivos =
        processes?.data
            ?.filter(
                (p: SelectionProcess) => p.status === ProcessStatus.ACTIVE
            )
            .map((proceso: SelectionProcess) => {
                const workers =
                    (proceso.workers as unknown as WorkerInProcess[]) || [];
                const postulantes = workers.length;
                const enEvaluacion = workers.filter(
                    (w) => w.status === WorkerStatus.IN_PROCESS
                ).length;
                const aprobados = workers.filter(
                    (w) => w.status === WorkerStatus.APPROVED
                ).length;

                return {
                    id: proceso.id,
                    titulo: proceso.name,
                    postulantes,
                    enEvaluacion,
                    aprobados,
                    fechaVencimiento: proceso.endDate
                        ? new Date(proceso.endDate).toLocaleDateString("es-CL")
                        : "Sin fecha límite",
                };
            }) || [];

    const actividadReciente =
        processes?.data
            ?.flatMap((proceso: SelectionProcess) => {
                const workers =
                    (proceso.workers as unknown as WorkerInProcess[]) || [];
                return workers.map((worker: WorkerInProcess) => ({
                    id: worker.id,
                    tipo: "nuevo_postulante",
                    nombre: `${worker.worker?.firstName || ''} ${worker.worker?.lastName || ''}`.trim() || 'Candidato',
                    proceso: proceso.name,
                    fecha: worker.appliedAt
                        ? getRelativeTime(new Date(worker.appliedAt))
                        : "Recientemente",
                    appliedAt: worker.appliedAt ? new Date(worker.appliedAt).getTime() : 0,
                }));
            })
            .filter(Boolean)
            .sort((a, b) => b.appliedAt - a.appliedAt)
            .slice(0, 5) || [];

    function getRelativeTime(date: Date): string {
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) return "Hace menos de 1h";
        if (diffInHours < 24) return `Hace ${diffInHours}h`;
        if (diffInDays === 1) return "Hace 1 día";
        return `Hace ${diffInDays} días`;
    }

    const getIconoActividad = (tipo: string) => {
        switch (tipo) {
            case "nuevo_postulante":
                return "👤";
            case "test_completado":
                return "✅";
            case "evaluacion_aprobada":
                return "🎉";
            default:
                return "📋";
        }
    };

    const getTextoActividad = (actividad: {
        tipo: string;
        nombre: string;
        proceso: string;
    }) => {
        switch (actividad.tipo) {
            case "nuevo_postulante":
                return `Nuevo postulante: ${actividad.nombre} → ${actividad.proceso}`;
            case "test_completado":
                return `Test completado: ${actividad.nombre} → ${actividad.proceso}`;
            case "evaluacion_aprobada":
                return `Evaluación aprobada: ${actividad.nombre} → ${actividad.proceso}`;
            default:
                return actividad.nombre;
        }
    };

    const companyName = user?.company?.name || user?.belongsToCompany?.name || "Empresa";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, {companyName}
                </h1>
                <p className="text-gray-600 mt-1">
                    Gestiona tus procesos de selección y candidatos
                </p>
            </div>

            {/* Stats Cards */}
            {isLoadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-lg shadow p-6 animate-pulse"
                        >
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Procesos Activos
                                </p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {stats.activos}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📋</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            {dashboardStats?.procesosActivos.texto ||
                                "Cargando..."}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Aplicaciones en Procesos
                                </p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {stats.candidatos}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">👥</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            {dashboardStats?.candidatos.texto || "Cargando..."}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Candidatos Aprobados
                                </p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">
                                    {stats.aprobados}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✨</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            {dashboardStats?.candidatosAprobados
                                .tasaAprobacion || "Cargando..."}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Procesos Completados
                                </p>
                                <p className="text-3xl font-bold text-gray-600 mt-2">
                                    {stats.completados}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🏆</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            {dashboardStats?.procesosCompletados.texto ||
                                "Cargando..."}
                        </p>
                    </div>
                </div>
            )}

            {/* Procesos Activos */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Procesos Activos
                    </h2>
                    <button
                        onClick={() => navigate(`${getBaseUrl()}/procesos`)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        Ver Todos →
                    </button>
                </div>
                <div className="divide-y divide-gray-200">
                    {procesosActivos.map(
                        (proceso: {
                            id: string;
                            titulo: string;
                            postulantes: number;
                            enEvaluacion: number;
                            aprobados: number;
                            fechaVencimiento: string;
                        }) => (
                        <div
                            key={proceso.id}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {proceso.titulo}
                                    </h3>
                                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                                        <span>
                                            {proceso.postulantes} postulantes
                                        </span>
                                        <span className="text-yellow-600">
                                            • {proceso.enEvaluacion} en
                                            evaluación
                                        </span>
                                        <span className="text-green-600">
                                            • {proceso.aprobados} aprobados
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Vence: {proceso.fechaVencimiento}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                        ACTIVO
                                    </span>
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `${getBaseUrl()}/procesos/${proceso.id}`
                                            )
                                        }
                                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Ver Detalle
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Actividad Reciente
                    </h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {actividadReciente.length > 0 ? (
                        actividadReciente.map(
                            (actividad: {
                                id: string;
                                tipo: string;
                                nombre: string;
                                proceso: string;
                                fecha: string;
                            }) => (
                            <div
                                key={actividad.id}
                                className="px-6 py-3 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {getIconoActividad(actividad.tipo)}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">
                                            {getTextoActividad(actividad)}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {actividad.fecha}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-gray-500">
                            No hay actividad reciente para mostrar
                        </div>
                    )}
                </div>
                <div className="px-6 py-3 border-t border-gray-200 text-center">
                    <button
                        onClick={() => navigate(`${getBaseUrl()}/trabajadores`)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Ver todos los candidatos →
                    </button>
                </div>
            </div>
        </div>
    );
};
