import { useAuthStore } from "../../store/authStore";
import { useProcessesByCompany } from "../../hooks/useProcesses";
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

export const GuestDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const companyId = user?.belongsToCompany?.id;

    const { data: processes } = useProcessesByCompany(companyId || "");

    const stats = {
        activos:
            processes?.data?.filter(
                (p: SelectionProcess) => p.status === ProcessStatus.ACTIVE
            ).length || 0,
        candidatos:
            processes?.data?.reduce((acc: number, p: SelectionProcess) => {
                return acc + (p.workers?.length || 0);
            }, 0) || 0,
        aprobados:
            processes?.data?.reduce((acc: number, p: SelectionProcess) => {
                const workers =
                    (p.workers as unknown as WorkerInProcess[]) || [];
                return (
                    acc +
                    workers.filter((w) => w.status === WorkerStatus.APPROVED)
                        .length
                );
            }, 0) || 0,
        completados:
            processes?.data?.filter(
                (p: SelectionProcess) => p.status === ProcessStatus.COMPLETED
            ).length || 0,
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
                return workers.slice(0, 5).map((worker: WorkerInProcess) => ({
                    id: worker.id,
                    tipo: "nuevo_postulante",
                    nombre: `${worker.worker?.firstName} ${worker.worker?.lastName}`,
                    proceso: proceso.name,
                    fecha: worker.appliedAt
                        ? getRelativeTime(new Date(worker.appliedAt))
                        : "Recientemente",
                }));
            })
            .filter(Boolean)
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
            default:
                return "📋";
        }
    };

    const getTextoActividad = (actividad: {
        nombre: string;
        proceso: string;
    }) => {
        return `Nuevo postulante: ${actividad.nombre} → ${actividad.proceso}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600 mt-1">
                    Vista de invitado -{" "}
                    {user?.belongsToCompany?.name || "Empresa"} (Solo lectura)
                </p>
            </div>

            {/* Stats Cards */}
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
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Candidatos Totales
                            </p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {stats.candidatos}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👥</span>
                        </div>
                    </div>
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
                </div>
            </div>

            {/* Procesos Activos */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Procesos Activos
                    </h2>
                    <button
                        onClick={() => navigate("/invitado/procesos")}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        Ver Todos →
                    </button>
                </div>
                <div className="divide-y divide-gray-200">
                    {procesosActivos.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                            No hay procesos activos
                        </div>
                    ) : (
                        procesosActivos.map(
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
                                                {proceso.postulantes}{" "}
                                                postulantes
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
                                                    `/invitado/procesos/${proceso.id}`
                                                )
                                            }
                                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Ver Detalle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
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
                    {actividadReciente.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                            No hay actividad reciente
                        </div>
                    ) : (
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
                    )}
                </div>
                <div className="px-6 py-3 border-t border-gray-200 text-center">
                    <button
                        onClick={() => navigate("/invitado/trabajadores")}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Ver toda la actividad →
                    </button>
                </div>
            </div>
        </div>
    );
};
