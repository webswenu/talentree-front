import { useState, useRef } from "react";
import {
    useReports,
    useDeleteReport,
    useUploadReportFile,
    useDownloadReportFile,
    useApproveReport,
} from "../../hooks/useReports";
import {
    Report,
    ReportTypeLabels,
    ReportTypeColors,
    ReportStatus,
    ReportStatusLabels,
    ReportStatusColors,
} from "../../types/report.types";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { AlertModal } from "../../components/common/AlertModal";
import { ApproveRejectModal } from "../../components/common/ApproveRejectModal";
import { FormatSelectionModal } from "../../components/common/FormatSelectionModal";
import { useAuthStore } from "../../store/authStore";
import { Permission, hasPermission } from "../../utils/permissions";

export default function ReportsPage() {
    const { user } = useAuthStore();
    const { data: reports, isLoading } = useReports();
    const deleteMutation = useDeleteReport();
    const uploadMutation = useUploadReportFile();
    const downloadMutation = useDownloadReportFile();
    const approveMutation = useApproveReport();

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
    const [uploadingReportId, setUploadingReportId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    const [approveRejectModal, setApproveRejectModal] = useState<{
        isOpen: boolean;
        report: Report | null;
    }>({
        isOpen: false,
        report: null,
    });

    const [formatSelectionModal, setFormatSelectionModal] = useState<{
        isOpen: boolean;
        report: Report | null;
    }>({
        isOpen: false,
        report: null,
    });

    const canEdit = user && hasPermission(user.role, Permission.REPORTS_EDIT);
    const canApprove = user && hasPermission(user.role, Permission.REPORTS_APPROVE);
    const canDelete = user && hasPermission(user.role, Permission.REPORTS_DELETE);

    const handleDelete = (report: Report) => {
        setReportToDelete(report);
        setIsConfirmDeleteOpen(true);
    };

    const handleCancelDelete = () => {
        setIsConfirmDeleteOpen(false);
        setReportToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (reportToDelete) {
            await deleteMutation.mutateAsync(reportToDelete.id);
            setIsConfirmDeleteOpen(false);
            setReportToDelete(null);
        }
    };

    const handleUploadClick = (reportId: string) => {
        setUploadingReportId(reportId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file && uploadingReportId) {
            try {
                await uploadMutation.mutateAsync({
                    id: uploadingReportId,
                    file,
                });
                setAlertModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Archivo subido',
                    message: 'El archivo se ha subido exitosamente. Ya puedes aprobar el reporte si es PDF.'
                });
            } catch {
                setAlertModal({
                    isOpen: true,
                    type: 'error',
                    title: 'Error',
                    message: 'No se pudo subir el archivo. Por favor, intenta nuevamente.'
                });
            }
            setUploadingReportId(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDownloadClick = (report: Report) => {
        const hasPdf = !!report.pdfFileUrl;
        const hasDocx = !!report.docxFileUrl;

        // Handle old reports with fileUrl (backward compatibility)
        if (!hasPdf && !hasDocx && report.fileUrl) {
            // Old format - download directly
            handleDownload(report, undefined);
            return;
        }

        // If admin/evaluator and has both files, show modal to choose
        if (canEdit && hasPdf && hasDocx) {
            setFormatSelectionModal({ isOpen: true, report });
        } else if (hasPdf) {
            // If only PDF, download PDF
            handleDownload(report, 'pdf');
        } else if (hasDocx) {
            // If only DOCX, download DOCX
            handleDownload(report, 'docx');
        }
    };

    const handleDownload = async (report: Report, format?: 'pdf' | 'docx') => {
        try {
            const blob = await downloadMutation.mutateAsync({ id: report.id, format });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            let fileName: string;
            if (format === 'pdf') {
                fileName = report.pdfFileName || `reporte-${report.id}.pdf`;
            } else if (format === 'docx') {
                fileName = report.docxFileName || `reporte-${report.id}.docx`;
            } else {
                // Backward compatibility with old fileUrl/fileName
                fileName = report.fileName || `reporte-${report.id}.pdf`;
            }

            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Error de descarga',
                message: 'No se pudo descargar el archivo. Por favor, intenta nuevamente.'
            });
        }
    };

    const handleApproveRejectClick = (report: Report) => {
        setApproveRejectModal({ isOpen: true, report });
    };

    const handleApprove = async () => {
        if (!approveRejectModal.report) return;

        try {
            await approveMutation.mutateAsync({
                id: approveRejectModal.report.id,
                data: { status: ReportStatus.APPROVED },
            });
            setAlertModal({
                isOpen: true,
                type: 'success',
                title: 'Reporte aprobado',
                message: 'El reporte ha sido aprobado exitosamente. La empresa ya puede verlo.'
            });
        } catch {
            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'No se pudo aprobar el reporte. Por favor, intenta nuevamente.'
            });
        }
    };

    const handleReject = async (rejectionReason: string) => {
        if (!approveRejectModal.report) return;

        try {
            await approveMutation.mutateAsync({
                id: approveRejectModal.report.id,
                data: {
                    status: ReportStatus.REJECTED,
                    rejectionReason: rejectionReason,
                },
            });
            setAlertModal({
                isOpen: true,
                type: 'success',
                title: 'Reporte rechazado',
                message: 'El reporte ha sido rechazado exitosamente.'
            });
        } catch {
            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'No se pudo rechazar el reporte. Por favor, intenta nuevamente.'
            });
        }
    };

    const isPDF = (fileName: string | null | undefined) => {
        if (!fileName) return false;
        return fileName.toLowerCase().endsWith('.pdf');
    };

    const isDOCX = (fileName: string | null | undefined) => {
        if (!fileName) return false;
        const lower = fileName.toLowerCase();
        return lower.endsWith('.docx') || lower.endsWith('.doc');
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

    const getStatusBadge = (status: ReportStatus) => {
        const color = ReportStatusColors[status];
        const label = ReportStatusLabels[status];
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

    // Filter reports based on search and status
    const filteredReports = reports?.filter((report) => {
        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            const matchesTitle = report.title?.toLowerCase().includes(searchLower);
            const matchesWorker = report.worker
                ? `${report.worker.firstName} ${report.worker.lastName}`
                      .toLowerCase()
                      .includes(searchLower)
                : false;
            const matchesProcess = report.process?.name
                ?.toLowerCase()
                .includes(searchLower);

            if (!matchesTitle && !matchesWorker && !matchesProcess) {
                return false;
            }
        }

        // Filter by status
        if (statusFilter && report.status !== statusFilter) {
            return false;
        }

        return true;
    });

    const stats = {
        total: reports?.length || 0,
        pending: reports?.filter((r) => r.status === ReportStatus.PENDING_APPROVAL).length || 0,
        revisionEvaluador: reports?.filter((r) => r.status === ReportStatus.REVISION_EVALUADOR).length || 0,
        revisionAdmin: reports?.filter((r) => r.status === ReportStatus.REVISION_ADMIN).length || 0,
        approved: reports?.filter((r) => r.status === ReportStatus.APPROVED).length || 0,
    };

    return (
        <div className="p-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc"
                style={{ display: "none" }}
            />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {stats.total}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-600">
                        {stats.pending}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Revisión Evaluador</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.revisionEvaluador}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Revisión Admin</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {stats.revisionAdmin}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Aprobados</p>
                    <p className="text-2xl font-bold text-green-600">
                        {stats.approved}
                    </p>
                </div>
            </div>

            {/* Info de aprobación */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">Información importante</p>
                        <p className="text-sm text-blue-700 mt-1">
                            Solo se pueden aprobar reportes en formato PDF. Los archivos DOCX generados automáticamente deben ser convertidos a PDF antes de poder aprobarlos.
                        </p>
                    </div>
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
                            placeholder="Buscar por título, trabajador, proceso..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos los estados</option>
                            <option value={ReportStatus.PENDING_APPROVAL}>Pendientes</option>
                            <option value={ReportStatus.REVISION_EVALUADOR}>Revisión Evaluador</option>
                            <option value={ReportStatus.REVISION_ADMIN}>Revisión Admin</option>
                            <option value={ReportStatus.APPROVED}>Aprobados</option>
                            <option value={ReportStatus.REJECTED}>Rechazados</option>
                        </select>
                    </div>
                </div>
                {(search || statusFilter) && (
                    <div className="mt-3">
                        <button
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>

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
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Proceso
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trabajador
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Archivos
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aprobar Informe de Selección (PDF)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReports && filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                    No hay reportes con el filtro seleccionado
                                </td>
                            </tr>
                        ) : (
                            filteredReports?.map((report) => (
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
                                                        40
                                                    )}
                                                    ...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getTypeBadge(report.type)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(report.status)}
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
                                    {report.createdAt
                                        ? new Date(report.createdAt).toLocaleDateString('es-CL', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })
                                        : "-"}
                                </td>
                                {/* Columna Archivos */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2 items-center">
                                        {(report.pdfFileUrl || report.docxFileUrl || report.fileUrl) && (
                                            <div className="flex items-center gap-1">
                                                {report.docxFileUrl && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                                        DOCX
                                                    </span>
                                                )}
                                                {report.pdfFileUrl && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                                        PDF
                                                    </span>
                                                )}
                                                {!report.pdfFileUrl && !report.docxFileUrl && report.fileUrl && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                                        {isDOCX(report.fileName) ? 'DOCX' : 'PDF'}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                {/* Columna Acciones */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2 items-center">
                                        {(report.pdfFileUrl || report.docxFileUrl || report.fileUrl) && (
                                            <button
                                                onClick={() =>
                                                    handleDownloadClick(report)
                                                }
                                                disabled={downloadMutation.isPending}
                                                className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded disabled:opacity-50"
                                                title="Descargar"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </button>
                                        )}
                                        {canEdit && (
                                            <button
                                                onClick={() =>
                                                    handleUploadClick(report.id)
                                                }
                                                disabled={uploadMutation.isPending}
                                                className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded disabled:opacity-50"
                                                title="Subir PDF"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(report)}
                                                className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                                title="Eliminar"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                                {/* Columna Aprobar Informe de Selección (PDF) */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2 items-center">
                                        {canApprove &&
                                            (report.status === ReportStatus.PENDING_APPROVAL ||
                                             report.status === ReportStatus.REVISION_EVALUADOR ||
                                             report.status === ReportStatus.REVISION_ADMIN) &&
                                            (report.pdfFileUrl || (report.fileUrl && isPDF(report.fileName))) && (
                                                <button
                                                    onClick={() =>
                                                        handleApproveRejectClick(report)
                                                    }
                                                    disabled={
                                                        approveMutation.isPending
                                                    }
                                                    className="p-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded disabled:opacity-50"
                                                    title="Aprobar/Rechazar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            )}
                                        {canApprove &&
                                            (report.status === ReportStatus.PENDING_APPROVAL ||
                                             report.status === ReportStatus.REVISION_EVALUADOR ||
                                             report.status === ReportStatus.REVISION_ADMIN) &&
                                            !report.pdfFileUrl &&
                                            !(report.fileUrl && isPDF(report.fileName)) &&
                                            (report.docxFileUrl || report.fileUrl) && (
                                                <span className="text-xs text-gray-500 italic">
                                                    Subir PDF para aprobar
                                                </span>
                                            )}
                                    </div>
                                </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={isConfirmDeleteOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Eliminar Reporte"
                message={`¿Estás seguro de eliminar el reporte "${reportToDelete?.title}"? Esta acción no se puede deshacer.`}
                isLoading={deleteMutation.isPending}
            />

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />

            <ApproveRejectModal
                isOpen={approveRejectModal.isOpen}
                onClose={() => setApproveRejectModal({ isOpen: false, report: null })}
                onApprove={handleApprove}
                onReject={handleReject}
                reportTitle={approveRejectModal.report?.title || ''}
            />

            <FormatSelectionModal
                isOpen={formatSelectionModal.isOpen}
                onClose={() => setFormatSelectionModal({ isOpen: false, report: null })}
                onSelectFormat={(format) => {
                    if (formatSelectionModal.report) {
                        handleDownload(formatSelectionModal.report, format);
                    }
                }}
                hasPdf={!!formatSelectionModal.report?.pdfFileUrl}
                hasDocx={!!formatSelectionModal.report?.docxFileUrl}
            />
        </div>
    );
}
