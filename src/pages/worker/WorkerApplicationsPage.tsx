import { useWorkerProcesses } from "../../hooks/useWorkers";
import { useAuthStore } from "../../store/authStore";
import {
    WorkerStatusLabels,
    WorkerStatusColors,
} from "../../types/worker.types";
import { useNavigate } from "react-router-dom";

export const WorkerApplicationsPage = () => {
    const { user } = useAuthStore();
    const workerId = user?.worker?.id;
    const navigate = useNavigate();

    const { data: applications, isLoading } = useWorkerProcesses(
        workerId || ""
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando postulaciones...</div>
            </div>
        );
    }

    const stats = {
        total: applications?.length || 0,
        pending:
            applications?.filter((app) => app.status === "pending").length || 0,
        inProcess:
            applications?.filter((app) => app.status === "in_process").length ||
            0,
        approved:
            applications?.filter((app) => app.status === "approved").length ||
            0,
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">
                Mis Postulaciones
            </h1>

            <div className="grid grid-cols-4 gap-4">
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
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Aprobadas</p>
                    <p className="text-2xl font-bold text-green-600">
                        {stats.approved}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Puntaje
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications && applications.length > 0 ? (
                            applications.map((app) => (
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {app.totalScore !== null &&
                                        app.totalScore !== undefined
                                            ? `${app.totalScore}%`
                                            : "-"}
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
                                    colSpan={7}
                                    className="px-6 py-12 text-center text-gray-500"
                                >
                                    No tienes postulaciones activas.{" "}
                                    <button
                                        onClick={() =>
                                            navigate("/trabajador/procesos")
                                        }
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Ver procesos disponibles
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
