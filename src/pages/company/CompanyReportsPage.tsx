import { useReports, useDownloadReportFile } from "../../hooks/useReports";
import {
    Report,
    ReportTypeLabels,
    ReportTypeColors,
    ReportStatus,
} from "../../types/report.types";

export default function CompanyReportsPage() {
    const { data: reports, isLoading } = useReports();
    const downloadMutation = useDownloadReportFile();

    const handleView = async (report: Report) => {
        try {
            // Company views PDF online
            const format = report.pdfFileUrl ? 'pdf' : undefined;
            const blob = await downloadMutation.mutateAsync({ id: report.id, format });
            const url = window.URL.createObjectURL(blob);

            // Open in new tab
            window.open(url, '_blank');

            // Clean up after a delay to ensure the PDF loads
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch (error) {
            console.error("View error:", error);
        }
    };

    const handleDownload = async (report: Report) => {
        try {
            // Company always downloads PDF
            const format = report.pdfFileUrl ? 'pdf' : undefined; // undefined for backward compatibility
            const blob = await downloadMutation.mutateAsync({ id: report.id, format });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = report.pdfFileName || report.fileName || `reporte-${report.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    const getTypeBadge = (type: string) => {
        const color = ReportTypeColors[type as keyof typeof ReportTypeColors];
        const label = ReportTypeLabels[type as keyof typeof ReportTypeLabels];
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
                <div className="text-gray-500">Cargando reportes...</div>
            </div>
        );
    }

    // Filter only approved reports with PDF files for company users
    const isPDF = (fileName: string | null | undefined) => {
        if (!fileName) return false;
        return fileName.toLowerCase().endsWith('.pdf');
    };

    const approvedReports = reports?.filter(
        (r) => r.status === ReportStatus.APPROVED && (r.pdfFileUrl || (r.fileUrl && isPDF(r.fileName)))
    );

    const stats = {
        total: approvedReports?.length || 0,
        withFiles: approvedReports?.filter((r) => r.pdfFileUrl || (r.fileUrl && isPDF(r.fileName))).length || 0,
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Reportes Aprobados
                </h1>
                <p className="text-gray-600 mt-1">
                    Visualice online o descargue los reportes PDF aprobados de sus candidatos
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total Aprobados</p>
                    <p className="text-2xl font-bold text-green-600">
                        {stats.total}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Con Archivos</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.withFiles}
                    </p>
                </div>
            </div>

            {approvedReports?.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="text-gray-400 text-lg mb-2">
                        No hay reportes PDF aprobados disponibles
                    </div>
                    <div className="text-gray-500 text-sm">
                        Los reportes en formato PDF aparecerán aquí una vez que sean aprobados por el administrador
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
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
                                    Trabajador
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Aprobación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {approvedReports?.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {report.fileUrl && (
                                                <svg
                                                    className="w-5 h-5 text-blue-500 mr-2"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                                </svg>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {report.title}
                                                </div>
                                                {report.description && (
                                                    <div className="text-sm text-gray-500">
                                                        {report.description.substring(
                                                            0,
                                                            50
                                                        )}
                                                        {report.description
                                                            .length > 50 && "..."}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getTypeBadge(report.type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.process?.name || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.worker
                                            ? `${report.worker.firstName} ${report.worker.lastName}`
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.approvedAt
                                            ? new Date(
                                                  report.approvedAt
                                              ).toLocaleDateString("es-ES")
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2 items-center">
                                            {(report.pdfFileUrl || (report.fileUrl && isPDF(report.fileName))) ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleView(report)}
                                                        disabled={downloadMutation.isPending}
                                                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded disabled:opacity-50"
                                                        title="Ver PDF online"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDownload(report)
                                                        }
                                                        disabled={
                                                            downloadMutation.isPending
                                                        }
                                                        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded disabled:opacity-50"
                                                        title="Descargar PDF"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </button>
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                                        PDF
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">
                                                    Sin PDF disponible
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
        </div>
    );
}
