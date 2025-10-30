import { useAuthStore } from "../../store/authStore";
import { useReports } from "../../hooks/useReports";
import { useProcessesByCompany } from "../../hooks/useProcesses";
import { SelectionProcess } from "../../types/process.types";
import { Report } from "../../types/report.types";

export const CompanyReportsPage = () => {
    const { user } = useAuthStore();
    const companyId = user?.company?.id;

    const { data: processes } = useProcessesByCompany(companyId || "");
    const { data: allReports, isLoading } = useReports();

    const companyReports =
        allReports?.filter((report: Report) => {
            return processes?.data?.some(
                (process: SelectionProcess) =>
                    process.id === report.process?.id
            );
        }) || [];

    const getReportTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            evaluation: "Evaluación",
            selection: "Selección",
            progress: "Progreso",
            final: "Final",
        };
        return types[type] || type;
    };

    const getReportTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            evaluation: "bg-blue-100 text-blue-800",
            selection: "bg-green-100 text-green-800",
            progress: "bg-yellow-100 text-yellow-800",
            final: "bg-purple-100 text-purple-800",
        };
        return colors[type] || "bg-gray-100 text-gray-800";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando reportes...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
                <div className="text-sm text-gray-600">
                    {companyReports.length}{" "}
                    {companyReports.length === 1 ? "reporte" : "reportes"}
                </div>
            </div>

            {companyReports.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12">
                    <div className="text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay reportes disponibles
                        </h3>
                        <p className="text-gray-600">
                            Los reportes de evaluación serán cargados por el
                            administrador
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Título
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Proceso
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
                            {companyReports.map((report: Report) => {
                                const process = processes?.data?.find(
                                    (p: SelectionProcess) =>
                                        p.id === report.process?.id
                                );
                                return (
                                    <tr
                                        key={report.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {report.title}
                                            </div>
                                            {report.description && (
                                                <div className="text-sm text-gray-500">
                                                    {report.description.substring(
                                                        0,
                                                        60
                                                    )}
                                                    ...
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getReportTypeBadge(
                                                    report.type
                                                )}`}
                                            >
                                                {getReportTypeLabel(
                                                    report.type
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {process?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(
                                                report.createdAt
                                            ).toLocaleDateString("es-CL")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {report.fileUrl ? (
                                                <a
                                                    href={report.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Descargar
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        (window.location.href = `/empresa/reportes/${report.id}`)
                                                    }
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Ver Detalle
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
