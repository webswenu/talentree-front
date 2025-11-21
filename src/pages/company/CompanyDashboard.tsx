import { useAuthStore } from "../../store/authStore";
import { useProcessesByCompany } from "../../hooks/useProcesses";
import { useCompanyDashboardStats } from "../../hooks/useCompanies";
import {
    ProcessStatus,
    SelectionProcess,
    WorkerStatus,
} from "../../types/process.types";
import { useNavigate } from "react-router-dom";
import { QuickStats } from "../../components/widgets/QuickStats";

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
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="rounded-2xl p-8">
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary-600/70 via-secondary-600/70 to-primary-600/70 bg-clip-text">
                    Dashboard de {companyName}
                </h1>
                <p className="text-gray-800 mt-3 text-lg font-bold">
                    Bienvenido, <span className="text-primary-600/80">{user?.firstName}</span>
                </p>
            </div>

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-4 text-sm font-semibold text-gray-500">Resumen</span>
                </div>
            </div>

            {/* Stats Cards */}
            {isLoadingStats ? (
                <div className="flex items-center justify-center py-12">
                    <div className="glass-white rounded-2xl p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
                        <div className="text-gray-700 font-bold">Cargando estadísticas...</div>
                    </div>
                </div>
            ) : (
                <QuickStats
                    stats={[
                        {
                            title: "Procesos Activos",
                            value: stats.activos,
                            color: "orange" as const,
                            icon: (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            ),
                        },
                        {
                            title: "Aplicaciones en Procesos",
                            value: stats.candidatos,
                            color: "turquoise" as const,
                            icon: (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            ),
                        },
                        {
                            title: "Candidatos Aprobados",
                            value: stats.aprobados,
                            color: "orange" as const,
                            icon: (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ),
                        },
                        {
                            title: "Procesos Completados",
                            value: stats.completados,
                            color: "turquoise" as const,
                            icon: (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            ),
                        },
                    ]}
                />
            )}

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-4 text-sm font-semibold text-orange-600">Procesos Activos</span>
                </div>
            </div>

            {/* Procesos Activos */}
            <div className="glass-white rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        Procesos Activos
                    </h2>
                    <button
                        onClick={() => navigate(`${getBaseUrl()}/procesos`)}
                        className="text-sm font-bold text-gray-900 hover:scale-110 transition-transform duration-300"
                    >
                        Ver Todos →
                    </button>
                </div>
                <div className="space-y-3">
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
                            className="p-3 sm:p-4 rounded-xl border border-white/15 bg-white/8 transition-all duration-300 hover:bg-white/12"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                        {proceso.titulo}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2 text-xs sm:text-sm">
                                        <span className="font-bold text-gray-800">
                                            {proceso.postulantes} postulantes
                                        </span>
                                        <span className="font-bold text-yellow-600">
                                            • {proceso.enEvaluacion} en evaluación
                                        </span>
                                        <span className="font-bold text-green-600">
                                            • {proceso.aprobados} aprobados
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                                        Vence: {proceso.fechaVencimiento}
                                    </p>
                                </div>
                                <div className="flex flex-row sm:flex-col lg:flex-row items-start sm:items-end lg:items-center gap-2 self-start lg:self-center">
                                    <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-800 text-xs font-bold rounded-xl shadow-md">
                                        ACTIVO
                                    </span>
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `${getBaseUrl()}/procesos/${proceso.id}`
                                            )
                                        }
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-900 hover:scale-110 transition-transform duration-300 whitespace-nowrap"
                                    >
                                        Ver Detalle →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-teal-200 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-4 text-sm font-semibold text-teal-600">Actividad Reciente</span>
                </div>
            </div>

            {/* Actividad Reciente */}
            <div className="glass-white rounded-2xl p-4 sm:p-6">
                <div className="space-y-3">
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
                                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/8 hover:bg-white/12 transition-all duration-300 border border-white/15"
                            >
                                <span className="text-2xl self-start sm:self-center">
                                    {getIconoActividad(actividad.tipo)}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-gray-900 break-words">
                                        {getTextoActividad(actividad)}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500 font-medium self-start sm:self-center">
                                    {actividad.fecha}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500 font-medium text-sm">
                            No hay actividad reciente para mostrar
                        </div>
                    )}
                </div>
                {actividadReciente.length > 0 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate(`${getBaseUrl()}/trabajadores`)}
                            className="text-sm font-bold text-gray-900 hover:scale-110 transition-transform duration-300"
                        >
                            Ver todos los candidatos →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
