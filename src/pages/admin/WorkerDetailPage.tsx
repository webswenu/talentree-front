import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { workersService } from "../../services/workers.service";
import { reportsService } from "../../services/reports.service";
import { videoService } from "../../services/video.service";
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
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { toast } from "../../utils/toast";
import {
    useDownloadReportFile,
    useApproveReport,
    useUploadReportFile,
    reportKeys,
} from "../../hooks/useReports";

export const WorkerDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; processName: string; videoUrl: string } | null>(null);
    const [downloadingVideo, setDownloadingVideo] = useState(false);
    const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; reportId: string | null }>({ isOpen: false, reportId: null });
    const [rejectionReason, setRejectionReason] = useState("");
    const [approveModal, setApproveModal] = useState<{ isOpen: boolean; reportId: string | null }>({ isOpen: false, reportId: null });
    const [uploadingReportId, setUploadingReportId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Detect user role and route
    const { user } = useAuthStore();
    const isEvaluator = location.pathname.includes("/evaluador");
    const isCompany = location.pathname.includes("/empresa");
    const isGuest = location.pathname.includes("/invitado");
    const baseRoute = isEvaluator ? "/evaluador" : isCompany ? "/empresa" : isGuest ? "/invitado" : "/admin";
    const isAdmin = !isEvaluator && !isCompany && !isGuest;

    // Get company ID if user is company or guest
    const userCompanyId = user?.company?.id || user?.belongsToCompany?.id;

    const { data: worker, isLoading } = useQuery({
        queryKey: ["worker", id],
        queryFn: () => workersService.getById(id!),
        enabled: !!id,
    });

    const { data: allReports = [] } = useQuery({
        queryKey: reportKeys.byWorker(id!),
        queryFn: () => reportsService.findByWorker(id!),
        enabled: !!id,
    });

    // Filter processes and reports by company if user is company/guest
    const filteredWorkerProcesses = (isCompany || isGuest) && userCompanyId
        ? worker?.workerProcesses?.filter(wp => wp.process?.company?.id === userCompanyId)
        : worker?.workerProcesses;

    const reports = (isCompany || isGuest) && userCompanyId
        ? allReports.filter(report => report.process?.company?.id === userCompanyId)
        : allReports;

    // Get videos for each process
    const { data: videos = {} } = useQuery({
        queryKey: ["worker-videos", id, filteredWorkerProcesses?.map(wp => wp.process?.id)],
        queryFn: async () => {
            if (!filteredWorkerProcesses || !id) return {};
            const videoPromises = filteredWorkerProcesses.map(async (wp) => {
                if (!wp.process?.id) return null;
                const video = await videoService.getWorkerVideoForProcess(id, wp.process.id);
                return { processId: wp.process.id, video };
            });
            const results = await Promise.all(videoPromises);
            return results.reduce((acc, result) => {
                if (result && result.video) {
                    acc[result.processId] = result.video;
                }
                return acc;
            }, {} as Record<string, { id: string; videoUrl: string }>);
        },
        enabled: !!filteredWorkerProcesses && !!id,
    });

    const downloadMutation = useDownloadReportFile();
    const uploadMutation = useUploadReportFile();
    const approveMutation = useApproveReport();

    const isPDF = (fileName: string | null | undefined) => {
        if (!fileName) return false;
        return fileName.toLowerCase().endsWith('.pdf');
    };

    const handleUploadClick = (reportId: string) => {
        setUploadingReportId(reportId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && uploadingReportId) {
            try {
                await uploadMutation.mutateAsync({
                    id: uploadingReportId,
                    file,
                });
                toast.success('Archivo subido exitosamente. Ya puedes aprobar el reporte si es PDF.');
            } catch {
                toast.error('No se pudo subir el archivo. Por favor, intenta nuevamente.');
            }
            setUploadingReportId(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">
                    Cargando información del trabajador...
                </div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Trabajador no encontrado</p>
                <button
                    onClick={() => navigate(`${baseRoute}/trabajadores`)}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                >
                    Volver a trabajadores
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc"
                style={{ display: "none" }}
            />
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
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredWorkerProcesses.map((wp) => {
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-3">
                                                    {wp.process && (
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `${baseRoute}/procesos/${wp.process.id}`
                                                                )
                                                            }
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Ver Proceso
                                                        </button>
                                                    )}
                                                    {wp.process?.id && videos[wp.process.id] && (
                                                        <button
                                                            onClick={() =>
                                                                setSelectedVideo({
                                                                    videoId: videos[wp.process.id].id,
                                                                    processName: wp.process.name || "Proceso",
                                                                    videoUrl: videos[wp.process.id].videoUrl
                                                                })
                                                            }
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            🎥 Ver Video
                                                        </button>
                                                    )}
                                                </div>
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
                                                        navigate(`/admin/procesos/${report.process?.id}`)
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
                                                {(report.pdfFileUrl || report.docxFileUrl) && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                // Prefer PDF over DOCX
                                                                const format = report.pdfFileUrl ? 'pdf' : 'docx';
                                                                const fileName = report.pdfFileUrl
                                                                    ? (report.pdfFileName || `reporte-${report.id}.pdf`)
                                                                    : (report.docxFileName || `reporte-${report.id}.docx`);

                                                                const blob = await downloadMutation.mutateAsync({
                                                                    id: report.id,
                                                                    format
                                                                });
                                                                const url = window.URL.createObjectURL(blob);
                                                                const a = document.createElement("a");
                                                                a.href = url;
                                                                a.download = fileName;
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
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleUploadClick(report.id)}
                                                        disabled={uploadMutation.isPending}
                                                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                                        title="Subir PDF"
                                                    >
                                                        Subir
                                                    </button>
                                                )}
                                                {isAdmin &&
                                                 (report.status === ReportStatus.PENDING_APPROVAL ||
                                                  report.status === ReportStatus.REVISION_EVALUADOR ||
                                                  report.status === ReportStatus.REVISION_ADMIN) &&
                                                 (report.pdfFileUrl || (report.fileUrl && isPDF(report.fileName))) && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setApproveModal({ isOpen: true, reportId: report.id });
                                                            }}
                                                            disabled={approveMutation.isPending}
                                                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                        >
                                                            Aprobar
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRejectModal({ isOpen: true, reportId: report.id });
                                                                setRejectionReason("");
                                                            }}
                                                            disabled={approveMutation.isPending}
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                        >
                                                            Rechazar
                                                        </button>
                                                    </>
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

            {/* Video Modal */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 bg-black/25 bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedVideo(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Video - {selectedVideo.processName}
                                </h3>
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-100 rounded-lg overflow-hidden">
                                    <video
                                        controls
                                        className="w-full"
                                        src={selectedVideo.videoUrl}
                                        style={{ maxHeight: '500px' }}
                                    >
                                        Tu navegador no soporta el elemento de video.
                                    </video>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={async () => {
                                            setDownloadingVideo(true);
                                            try {
                                                await videoService.downloadVideo(
                                                    selectedVideo.videoId,
                                                    `video-${selectedVideo.processName.replace(/\s+/g, '-')}.webm`
                                                );
                                            } catch {
                                                toast.error('Error al descargar el video');
                                            } finally {
                                                setDownloadingVideo(false);
                                            }
                                        }}
                                        disabled={downloadingVideo}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                            downloadingVideo
                                                ? 'bg-blue-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        } text-white`}
                                    >
                                        {downloadingVideo ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Descargando...
                                            </span>
                                        ) : (
                                            '📥 Descargar Video'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setSelectedVideo(null)}
                                        disabled={downloadingVideo}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                            downloadingVideo
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Rechazo de Reporte */}
            {rejectModal.isOpen && (
                <div
                    className="fixed inset-0 bg-black/25 bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setRejectModal({ isOpen: false, reportId: null });
                        setRejectionReason("");
                    }}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Rechazar Reporte
                                </h3>
                                <button
                                    onClick={() => {
                                        setRejectModal({ isOpen: false, reportId: null });
                                        setRejectionReason("");
                                    }}
                                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo del rechazo (opcional):
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Explica el motivo del rechazo del reporte..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setRejectModal({ isOpen: false, reportId: null });
                                        setRejectionReason("");
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!rejectModal.reportId) return;

                                        try {
                                            await approveMutation.mutateAsync({
                                                id: rejectModal.reportId,
                                                data: {
                                                    status: ReportStatus.REJECTED,
                                                    rejectionReason: rejectionReason || undefined,
                                                },
                                            });
                                            setRejectModal({ isOpen: false, reportId: null });
                                            setRejectionReason("");
                                            toast.success("Reporte rechazado exitosamente");
                                        } catch {
                                            toast.error("Error al rechazar el reporte");
                                        }
                                    }}
                                    disabled={approveMutation.isPending}
                                    className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                                        approveMutation.isPending
                                            ? 'bg-red-400 cursor-not-allowed'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {approveMutation.isPending ? 'Rechazando...' : 'Rechazar Reporte'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Aprobación */}
            <ConfirmModal
                isOpen={approveModal.isOpen}
                onClose={() => setApproveModal({ isOpen: false, reportId: null })}
                onConfirm={async () => {
                    if (!approveModal.reportId) return;
                    try {
                        await approveMutation.mutateAsync({
                            id: approveModal.reportId,
                            data: { status: ReportStatus.APPROVED },
                        });
                        setApproveModal({ isOpen: false, reportId: null });
                        toast.success("Reporte aprobado exitosamente");
                    } catch {
                        toast.error("Error al aprobar reporte");
                    }
                }}
                title="Aprobar Reporte"
                message="¿Estás seguro de aprobar este reporte? La empresa podrá verlo."
                confirmText="Aprobar"
                cancelText="Cancelar"
                isLoading={approveMutation.isPending}
            />
        </div>
    );
};
