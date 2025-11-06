import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProcess, useProcessTests } from "../../hooks/useProcesses";
import { useProcessWorkers } from "../../hooks/useWorkers";
import {
    useReportsByProcess,
    useCreateReport,
    useUploadReportFile,
    useDownloadReportFile,
    useApproveReport,
    useDeleteReport,
} from "../../hooks/useReports";
import { useRemoveTest, useRemoveFixedTest } from "../../hooks/useProcesses";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types/user.types";
import {
    ProcessStatusLabels,
    ProcessStatusColors,
} from "../../types/process.types";
import {
    Report,
    ReportType,
    ReportTypeLabels,
    ReportTypeColors,
    ReportStatus,
    ReportStatusLabels,
    ReportStatusColors,
} from "../../types/report.types";
import {
    WorkerStatus,
    WorkerStatusLabels,
    WorkerStatusColors,
} from "../../types/worker.types";
import { ApproveRejectModal } from "../../components/common/ApproveRejectModal";
import { FormatSelectionModal } from "../../components/common/FormatSelectionModal";
import { AssignTestsModal } from "../../components/common/AssignTestsModal";
import ProcessModal from "../../components/admin/ProcessModal";

type TabType = "info" | "tests" | "candidates" | "approved" | "reports" | "timeline";

export const ProcessDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabType>("info");
    const [approveRejectModal, setApproveRejectModal] = useState<{
        isOpen: boolean;
        report: Report | null;
    }>({ isOpen: false, report: null });
    const [formatSelectionModal, setFormatSelectionModal] = useState<{
        isOpen: boolean;
        report: Report | null;
    }>({ isOpen: false, report: null });
    const [assignTestsModal, setAssignTestsModal] = useState(false);
    const [editProcessModal, setEditProcessModal] = useState(false);

    const { data: process, isLoading, error } = useProcess(id!);
    const { data: testsData } = useProcessTests(id!);
    const { data: workersData } = useProcessWorkers(id!);
    const { data: reportsData } = useReportsByProcess(id!);
    const createReportMutation = useCreateReport();
    const uploadMutation = useUploadReportFile();
    const downloadMutation = useDownloadReportFile();
    const approveMutation = useApproveReport();
    const deleteMutation = useDeleteReport();
    const removeTestMutation = useRemoveTest();
    const removeFixedTestMutation = useRemoveFixedTest();
    const { user } = useAuthStore();
    const isAdmin = user?.role === UserRole.ADMIN_TALENTREE;
    const isEvaluator = location.pathname.includes("/evaluador");
    const isCompany = location.pathname.includes("/empresa");
    const baseRoute = isEvaluator ? "/evaluador" : isCompany ? "/empresa" : "/admin";

    // Solo admin puede editar/asignar/eliminar
    const canEdit = isAdmin && !isEvaluator && !isCompany;

    // Helper functions
    const isPDF = (fileName: string | null | undefined) => {
        if (!fileName) return false;
        return fileName.toLowerCase().endsWith('.pdf');
    };

    const isDOCX = (fileName: string | null | undefined) => {
        if (!fileName) return false;
        return fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc');
    };

    // Download handler with format selection
    const handleDownloadClick = (report: Report) => {
        const hasPdf = !!report.pdfFileUrl;
        const hasDocx = !!report.docxFileUrl;

        // Handle old reports with fileUrl (backward compatibility)
        if (!hasPdf && !hasDocx && report.fileUrl) {
            handleDownload(report, undefined);
            return;
        }

        // If has both files, show modal to choose
        if (hasPdf && hasDocx) {
            setFormatSelectionModal({ isOpen: true, report });
        } else if (hasPdf) {
            handleDownload(report, 'pdf');
        } else if (hasDocx) {
            handleDownload(report, 'docx');
        }
    };

    const handleDownload = async (report: Report, format?: 'pdf' | 'docx') => {
        try {
            const blob = await downloadMutation.mutateAsync({ id: report.id, format });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            // Determine filename based on format
            let filename = `reporte-${report.id}.pdf`;
            if (format === 'pdf' && report.pdfFileName) {
                filename = report.pdfFileName;
            } else if (format === 'docx' && report.docxFileName) {
                filename = report.docxFileName;
            } else if (report.fileName) {
                filename = report.fileName;
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Close modal if open
            setFormatSelectionModal({ isOpen: false, report: null });
        } catch (error) {
            console.error("Download error:", error);
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
            setApproveRejectModal({ isOpen: false, report: null });
        } catch (error) {
            console.error("Approve error:", error);
        }
    };

    const handleReject = async (reason: string) => {
        if (!approveRejectModal.report) return;

        try {
            await approveMutation.mutateAsync({
                id: approveRejectModal.report.id,
                data: {
                    status: ReportStatus.REJECTED,
                    rejectionReason: reason,
                },
            });
            setApproveRejectModal({ isOpen: false, report: null });
        } catch (error) {
            console.error("Reject error:", error);
        }
    };

    const handleDelete = async (reportId: string) => {
        try {
            await deleteMutation.mutateAsync(reportId);
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleRemoveTest = async (testId: string) => {
        if (!id) return;
        try {
            await removeTestMutation.mutateAsync({ processId: id, testId });
        } catch (error) {
            console.error("Remove test error:", error);
        }
    };

    const handleRemoveFixedTest = async (fixedTestId: string) => {
        if (!id) return;
        try {
            await removeFixedTestMutation.mutateAsync({ processId: id, fixedTestId });
        } catch (error) {
            console.error("Remove fixed test error:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Cargando...</div>
            </div>
        );
    }

    if (error || !process) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-600">Error al cargar el proceso</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate(`${baseRoute}/procesos`)}
                        className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
                    >
                        ← Volver a procesos
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {process.name}
                    </h1>
                    <p className="text-gray-600">{process.description}</p>
                </div>
                {canEdit && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAssignTestsModal(true)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Asignar Tests
                        </button>
                        <button
                            onClick={() => setEditProcessModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Editar Proceso
                        </button>
                    </div>
                )}
            </div>

            {/* Status Banner */}
            <div
                className={`p-4 rounded-lg ${
                    process.status === "active"
                        ? "bg-green-50 border border-green-200"
                        : process.status === "draft"
                        ? "bg-gray-50 border border-gray-200"
                        : "bg-red-50 border border-red-200"
                }`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-gray-900">
                            Estado del Proceso
                        </h3>
                        <p className="text-sm text-gray-600">
                            {process.status === "active" &&
                                "El proceso está activo y recibiendo postulaciones"}
                            {process.status === "draft" &&
                                "El proceso está en borrador"}
                            {process.status === "completed" &&
                                "El proceso ha finalizado"}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                            process.status === "active"
                                ? "bg-green-100 text-green-800"
                                : process.status === "draft"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                        }`}
                    >
                        {process.status === "active" && "Activo"}
                        {process.status === "draft" && "Borrador"}
                        {process.status === "completed" && "Completado"}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("info")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "info"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Información
                    </button>
                    <button
                        onClick={() => setActiveTab("tests")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "tests"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Tests ({testsData?.tests?.length || 0} + {testsData?.fixedTests?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("candidates")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "candidates"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Candidatos ({workersData?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("approved")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "approved"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Aprobados (
                        {workersData?.filter(
                            (wp: any) => wp.status === WorkerStatus.APPROVED || wp.status === WorkerStatus.HIRED
                        ).length || 0}
                        )
                    </button>
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "reports"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Reportes
                    </button>
                    <button
                        onClick={() => setActiveTab("timeline")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "timeline"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Timeline
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "info" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Información del Proceso
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Empresa
                                    </label>
                                    <p className="text-gray-900">
                                        {process.company?.name || "No asignada"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Fecha de Inicio
                                    </label>
                                    <p className="text-gray-900">
                                        {process.startDate
                                            ? new Date(
                                                  process.startDate
                                              ).toLocaleDateString("es-CL")
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Fecha de Fin
                                </label>
                                <p className="text-gray-900">
                                    {process.endDate
                                        ? new Date(
                                              process.endDate
                                          ).toLocaleDateString("es-CL")
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Vacantes
                                </label>
                                <p className="text-gray-900">
                                    {process.vacancies}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-gray-500">
                                    Descripción
                                </label>
                                <p className="text-gray-900">
                                    {process.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    {process.requirements && (
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Requisitos
                            </h2>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700">
                                    {process.requirements}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-4">
                            Estadísticas
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-600">
                                        Postulantes
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {workersData?.length || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${workersData?.length ? 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-600">
                                        En Evaluación
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {workersData?.filter((w: any) => w.status === "in_process").length || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{
                                            width: `${workersData?.length > 0
                                                ? ((workersData.filter((w: any) => w.status === "in_process").length / workersData.length) * 100)
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-600">
                                        Aprobados
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {workersData?.filter((w: any) => w.status === "approved").length || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{
                                            width: `${workersData?.length > 0
                                                ? ((workersData.filter((w: any) => w.status === "approved").length / workersData.length) * 100)
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Tab Tests */}
            {activeTab === "tests" && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Tests Asignados
                        </h2>
                        <div className="space-y-4">
                            {testsData?.tests && testsData.tests.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        Tests Personalizados
                                    </h3>
                                    <div className="grid gap-3">
                                        {testsData.tests.map((test: any) => (
                                            <div
                                                key={test.id}
                                                className="border rounded-lg p-4 hover:bg-gray-50"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">
                                                            {test.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {test.description}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            {test.questions?.length || 0} preguntas • {test.duration} minutos
                                                        </p>
                                                    </div>
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => handleRemoveTest(test.id)}
                                                            disabled={removeTestMutation.isPending}
                                                            className="ml-4 p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                            title="Remover test"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {testsData?.fixedTests && testsData.fixedTests.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        Tests Fijos (Psicométricos)
                                    </h3>
                                    <div className="grid gap-3">
                                        {testsData.fixedTests.map((test: any) => (
                                            <div
                                                key={test.id}
                                                className="border rounded-lg p-4 bg-indigo-50 border-indigo-200"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium text-gray-900">
                                                                {test.name}
                                                            </h4>
                                                            <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">
                                                                Test Fijo
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {test.description}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            {test.code} • {test.duration} minutos
                                                        </p>
                                                    </div>
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => handleRemoveFixedTest(test.id)}
                                                            disabled={removeFixedTestMutation.isPending}
                                                            className="ml-4 p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                            title="Remover test fijo"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!testsData?.tests || testsData.tests.length === 0) &&
                                (!testsData?.fixedTests || testsData.fixedTests.length === 0) && (
                                    <p className="text-center text-gray-500 py-8">
                                        No hay tests asignados a este proceso
                                    </p>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Candidatos */}
            {activeTab === "candidates" && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Candidatos del Proceso
                        </h2>
                        {workersData && workersData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Candidato
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Fecha Postulación
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Puntaje
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Reportes
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {workersData.map((workerProcess: any) => {
                                            const workerReports = reportsData?.filter(
                                                (r: any) => r.workerId === workerProcess.worker.id && r.processId === id
                                            ) || [];

                                            return (
                                            <tr key={workerProcess.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {workerProcess.worker.firstName}{" "}
                                                            {workerProcess.worker.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {workerProcess.worker.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                            WorkerStatusColors[workerProcess.status as WorkerStatus] ||
                                                            "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {WorkerStatusLabels[workerProcess.status as WorkerStatus] ||
                                                            workerProcess.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {workerProcess.appliedAt
                                                        ? new Date(workerProcess.appliedAt).toLocaleDateString()
                                                        : "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {workerProcess.totalScore || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {workerReports.length > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-green-600 font-medium">
                                                                {workerReports.length} {workerReports.length === 1 ? "reporte" : "reportes"}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Sin reportes</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() =>
                                                            navigate(`${baseRoute}/trabajadores/${workerProcess.worker.id}`)
                                                        }
                                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                                    >
                                                        Ver Detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">
                                No hay candidatos en este proceso
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Tab Aprobados */}
            {activeTab === "approved" && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Candidatos Aprobados
                        </h2>
                        {(() => {
                            const approvedWorkers = workersData?.filter(
                                (wp: any) => wp.status === WorkerStatus.APPROVED || wp.status === WorkerStatus.HIRED
                            ) || [];

                            return approvedWorkers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Candidato
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Estado
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Fecha Evaluación
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Puntaje Final
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Reportes
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {approvedWorkers.map((workerProcess: any) => {
                                                const workerReports = reportsData?.filter(
                                                    (r: any) => r.workerId === workerProcess.worker.id && r.processId === id
                                                ) || [];

                                                return (
                                                <tr key={workerProcess.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {workerProcess.worker.firstName}{" "}
                                                                {workerProcess.worker.lastName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {workerProcess.worker.email}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                WorkerStatusColors[workerProcess.status as WorkerStatus]
                                                            }`}
                                                        >
                                                            {WorkerStatusLabels[workerProcess.status as WorkerStatus]}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {workerProcess.evaluatedAt
                                                            ? new Date(workerProcess.evaluatedAt).toLocaleDateString()
                                                            : "-"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-green-600">
                                                            {workerProcess.totalScore || "-"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {workerReports.length > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-green-600 font-medium">
                                                                    {workerReports.length} {workerReports.length === 1 ? "reporte" : "reportes"}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Sin reportes</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() =>
                                                                navigate(`${baseRoute}/trabajadores/${workerProcess.worker.id}`)
                                                            }
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Ver Detalle
                                                        </button>
                                                    </td>
                                                </tr>
                                            )})}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No hay candidatos aprobados en este proceso
                                </p>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Tab Reportes */}
            {activeTab === "reports" && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Reportes del Proceso
                        </h2>

                        {/* Info message */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-blue-900">Información importante</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Solo se pueden aprobar reportes en formato PDF. Los archivos DOCX generados automáticamente deben ser convertidos a PDF antes de poder aprobarlos.
                                </p>
                            </div>
                        </div>

                        {reportsData && reportsData.length > 0 ? (
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
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Proceso
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trabajador
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reportsData.map((report: any) => (
                                            <tr key={report.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        {(report.pdfFileUrl || report.docxFileUrl || report.fileUrl) && (
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
                                                                    {report.description.substring(0, 50)}
                                                                    {report.description.length > 50 && "..."}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                            ReportTypeColors[report.type]
                                                        }`}
                                                    >
                                                        {ReportTypeLabels[report.type]}
                                                    </span>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {report.process?.name || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {report.worker
                                                        ? `${report.worker.firstName} ${report.worker.lastName}`
                                                        : "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2 items-center">
                                                        {/* Download button */}
                                                        {(report.pdfFileUrl || report.docxFileUrl || report.fileUrl) && (
                                                            <button
                                                                onClick={() => handleDownloadClick(report)}
                                                                disabled={downloadMutation.isPending}
                                                                className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded disabled:opacity-50"
                                                                title="Descargar"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        {/* File type badges */}
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
                                                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                                isDOCX(report.fileName)
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }`}>
                                                                {isDOCX(report.fileName) ? 'DOCX' : 'PDF'}
                                                            </span>
                                                        )}

                                                        {/* Approve/Reject button - only for reports with PDF */}
                                                        {(report.status === ReportStatus.PENDING_APPROVAL ||
                                                          report.status === ReportStatus.REVISION_EVALUADOR ||
                                                          report.status === ReportStatus.REVISION_ADMIN) &&
                                                          (report.pdfFileUrl || (report.fileUrl && isPDF(report.fileName))) && (
                                                            <button
                                                                onClick={() => handleApproveRejectClick(report)}
                                                                disabled={approveMutation.isPending}
                                                                className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded disabled:opacity-50"
                                                                title="Aprobar/Rechazar"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        {/* Delete button */}
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => handleDelete(report.id)}
                                                                disabled={deleteMutation.isPending}
                                                                className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded disabled:opacity-50"
                                                                title="Eliminar"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
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
                                No hay reportes generados para este proceso.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Tab Timeline */}
            {activeTab === "timeline" && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Línea de Tiempo del Proceso
                    </h2>
                    <div className="space-y-4">
                        {/* Timeline de eventos */}
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                            {/* Evento: Proceso creado */}
                            <div className="relative flex items-start mb-6">
                                <div className="absolute left-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                                    </svg>
                                </div>
                                <div className="ml-12">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Proceso Creado
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        El proceso de selección fue creado
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {process?.createdAt
                                            ? new Date(process.createdAt).toLocaleDateString("es-CL", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              })
                                            : "Fecha no disponible"}
                                    </p>
                                </div>
                            </div>

                            {/* Evento: Tests asignados */}
                            {testsData &&
                                (testsData.tests?.length > 0 || testsData.fixedTests?.length > 0) && (
                                    <div className="relative flex items-start mb-6">
                                        <div className="absolute left-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-4 h-4 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-12">
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Tests Asignados
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {(testsData.tests?.length || 0) +
                                                    (testsData.fixedTests?.length || 0)}{" "}
                                                tests asignados al proceso
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {testsData.tests?.length || 0} personalizados +{" "}
                                                {testsData.fixedTests?.length || 0} fijos
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* Evento: Primer candidato */}
                            {workersData && workersData.length > 0 && (
                                <div className="relative flex items-start mb-6">
                                    <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-4 h-4 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                        </svg>
                                    </div>
                                    <div className="ml-12">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Candidatos Postulados
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {workersData.length} candidatos se han postulado al proceso
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Primera postulación:{" "}
                                            {workersData[0]?.appliedAt
                                                ? new Date(workersData[0].appliedAt).toLocaleDateString()
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Evento: Candidatos aprobados */}
                            {workersData &&
                                workersData.filter(
                                    (wp: any) =>
                                        wp.status === WorkerStatus.APPROVED ||
                                        wp.status === WorkerStatus.HIRED
                                                ).length > 0 && (
                                    <div className="relative flex items-start mb-6">
                                        <div className="absolute left-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-4 h-4 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-12">
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Candidatos Aprobados
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {
                                                    workersData.filter(
                                                        (wp: any) =>
                                                            wp.status === WorkerStatus.APPROVED ||
                                                            wp.status === WorkerStatus.HIRED
                                                    ).length
                                                }{" "}
                                                candidatos han sido aprobados
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* Evento: Estado actual */}
                            <div className="relative flex items-start">
                                <div className="absolute left-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-12">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Estado Actual
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        El proceso está{" "}
                                        <span
                                            className={`font-semibold ${
                                                process?.status === "active"
                                                    ? "text-green-600"
                                                    : process?.status === "completed"
                                                    ? "text-blue-600"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {ProcessStatusLabels[process?.status || "draft"]}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Última actualización:{" "}
                                        {process?.updatedAt
                                            ? new Date(process.updatedAt).toLocaleDateString("es-CL")
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
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

            <AssignTestsModal
                isOpen={assignTestsModal}
                onClose={() => setAssignTestsModal(false)}
                processId={id!}
                assignedTestIds={testsData?.fixedTests?.map((t: any) => t.id) || []}
            />

            {editProcessModal && (
                <ProcessModal
                    process={process}
                    onClose={() => setEditProcessModal(false)}
                />
            )}
        </div>
    );
};
