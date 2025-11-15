import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { workersService } from "../../services/workers.service";
import { reportsService } from "../../services/reports.service";
import { useAuthStore } from "../../store/authStore";
import {
    WorkerStatus,
    WorkerStatusLabels,
    WorkerStatusColors,
} from "../../types/worker.types";
import {
    ReportStatus,
    ReportStatusLabels,
    ReportStatusColors,
    ReportType,
    ReportTypeLabels,
    ReportTypeColors,
} from "../../types/report.types";
import { toast } from "../../utils/toast";
import {
    useDownloadReportFile,
} from "../../hooks/useReports";

export const CompanyWorkerDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const getBaseUrl = () => {
        if (user?.role === "guest") return "/invitado";
        return "/empresa";
    };

    // Get company ID from user
    const userCompanyId = user?.company?.id || user?.belongsToCompany?.id;

    const { data: worker, isLoading } = useQuery({
        queryKey: ["worker", id],
        queryFn: () => workersService.getById(id!),
        enabled: !!id,
    });

    const { data: allReports = [] } = useQuery({
        queryKey: ["worker-reports", id],
        queryFn: () => reportsService.findByWorker(id!),
        enabled: !!id,
    });

    // Filter processes and reports by company
    const filteredWorkerProcesses = userCompanyId
        ? worker?.workerProcesses?.filter(wp => wp.process?.company?.id === userCompanyId)
        : worker?.workerProcesses;

    const reports = userCompanyId
        ? allReports.filter(report => report.process?.company?.id === userCompanyId)
        : allReports;

    const downloadMutation = useDownloadReportFile();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">
                    Cargando información del candidato...
                </div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Candidato no encontrado</p>
                <button
                    onClick={() => navigate(`${getBaseUrl()}/trabajadores`)}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                >
                    Volver a candidatos
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
                    >
                        ← Volver
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {worker.firstName} {worker.lastName}
                    </h1>
                    <p className="text-gray-600 mt-1">{worker.email}</p>
                </div>
                {worker.user?.isActive ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                    </span>
                ) : (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactivo
                    </span>
                )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium text-gray-600">
                        Postulaciones
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {filteredWorkerProcesses?.length || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium text-gray-600">
                        Tests Realizados
                    </p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                        {worker.testResponses?.length || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium text-gray-600">
                        Reportes Generados
                    </p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                        {reports.length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium text-gray-600">CV</p>
                    <div className="mt-2">
                        {worker.cvUrl ? (
                            <a
                                href={worker.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                            >
                                <span>📄</span>
                                Ver CV
                            </a>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                No disponible
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Información Personal */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-6">
                    Información Personal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            RUT
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.rut || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Email
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.email || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Teléfono
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.phone || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Fecha de Nacimiento
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.birthDate
                                ? new Date(worker.birthDate).toLocaleDateString(
                                      "es-CL"
                                  )
                                : "-"}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">
                            Dirección
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.address || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Ciudad
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.city || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Región
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.region || "-"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Educación y Experiencia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Educación</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {worker.education || "No especificada"}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Experiencia</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {worker.experience || "No especificada"}
                    </p>
                </div>
            </div>

            {/* Habilidades */}
            {worker.skills && worker.skills.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Habilidades</h2>
                    <div className="flex flex-wrap gap-2">
                        {worker.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Procesos */}
            {filteredWorkerProcesses && filteredWorkerProcesses.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-6">
                        Procesos de Selección
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Proceso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Fecha de Aplicación
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Reportes
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredWorkerProcesses.map((wp) => {
                                    const processReports = reports.filter(
                                        (r) => r.process?.id === wp.process?.id
                                    );
                                    return (
                                        <tr
                                            key={wp.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {wp.process?.name || "N/A"}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {wp.process?.code || ""}
                                                </div>
                                                {wp.process?.position && (
                                                    <div className="text-xs text-gray-400">
                                                        {wp.process.position}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        WorkerStatusColors[
                                                            wp.status as WorkerStatus
                                                        ] ||
                                                        "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {WorkerStatusLabels[
                                                        wp.status as WorkerStatus
                                                    ] || wp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {wp.appliedAt
                                                    ? new Date(
                                                          wp.appliedAt
                                                      ).toLocaleDateString(
                                                          "es-CL"
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {processReports.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        {processReports.map(
                                                            (report) => (
                                                                <a
                                                                    key={
                                                                        report.id
                                                                    }
                                                                    href={
                                                                        report.fileUrl ||
                                                                        "#"
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                                >
                                                                    <span>
                                                                        📄
                                                                    </span>
                                                                    {
                                                                        report.title
                                                                    }
                                                                </a>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        Sin reportes
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {wp.process && (
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `${getBaseUrl()}/procesos/${wp.process.id}`
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Ver Proceso
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reportes */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Reportes Generados</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Los reportes se generan automáticamente cuando el trabajador completa todos los tests de un proceso.
                </p>

                {reports.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Título
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Proceso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {report.title}
                                            </div>
                                            {report.description && (
                                                <div className="text-sm text-gray-500">
                                                    {report.description.substring(0, 40)}...
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {report.process ? (
                                                <button
                                                    onClick={() =>
                                                        navigate(`${getBaseUrl()}/procesos/${report.process?.id || ''}`)
                                                    }
                                                    className="text-sm text-blue-600 hover:text-blue-900"
                                                >
                                                    {report.process.name}
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    ReportStatusColors[report.status as ReportStatus]
                                                }`}
                                            >
                                                {ReportStatusLabels[report.status as ReportStatus]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    ReportTypeColors[report.type as ReportType]
                                                }`}
                                            >
                                                {ReportTypeLabels[report.type as ReportType]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(report.generatedDate || report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                {report.fileUrl && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const blob = await downloadMutation.mutateAsync({ id: report.id });
                                                                const url = window.URL.createObjectURL(blob);
                                                                const a = document.createElement("a");
                                                                a.href = url;
                                                                a.download = report.fileName || `reporte-${report.id}.pdf`;
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                window.URL.revokeObjectURL(url);
                                                                document.body.removeChild(a);
                                                            } catch {
                                                                toast.error("Error al descargar archivo");
                                                            }
                                                        }}
                                                        disabled={downloadMutation.isPending}
                                                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                    >
                                                        Descargar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">
                        No hay reportes generados para este trabajador.
                    </p>
                )}
            </div>
        </div>
    );
};
