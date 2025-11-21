import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useWorkerProcess } from "../../hooks/useWorkers";
import { useProcessTests } from "../../hooks/useProcesses";
import { useStartTest } from "../../hooks/useTestResponses";
import { useAuthStore } from "../../store/authStore";
import {
    WorkerStatusColors,
    WorkerStatusLabels,
} from "../../types/worker.types";
import { VideoRequirementGate } from "../../components/worker/VideoRequirementGate";
import { Test, FixedTest } from "../../types/test.types";
import { TestResponse } from "../../types/test-response.types";
import { toast } from "../../utils/toast";
import { Clock, FileText, Target } from "lucide-react";

interface ProcessTestsData {
    tests?: Test[];
    fixedTests?: FixedTest[];
}

export const WorkerApplicationDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [startingTestId, setStartingTestId] = useState<string | null>(null);
    const { user } = useAuthStore();

    const { data: application, isLoading } = useWorkerProcess(id || "");
    const { data: processTests } = useProcessTests(
        application?.process.id || ""
    );
    const startTestMutation = useStartTest();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando detalles...</p>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Postulación no encontrada
                    </h2>
                    <p className="text-gray-600 mb-6">
                        No pudimos encontrar esta postulación
                    </p>
                    <button
                        onClick={() => navigate("/trabajador/postulaciones")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver a Mis Aplicaciones
                    </button>
                </div>
            </div>
        );
    }

    const process = application.process;

    const handleStartTest = async (testId: string, isFixedTest: boolean = false) => {
        if (!application?.id) return;

        setStartingTestId(testId);
        try {
            const response = await startTestMutation.mutateAsync({
                testId,
                workerProcessId: application.id,
                isFixedTest,
            });

            // Navigate to test taking page with the response ID
            navigate(`/trabajador/test/${response.id}`);
        } catch {
            toast.error("Error al iniciar el test. Por favor intenta nuevamente.");
        } finally {
            setStartingTestId(null);
        }
    };

    const formatDate = (dateString: string | Date | null | undefined) => {
        if (!dateString) return "No especificada";
        return new Date(dateString).toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/trabajador/postulaciones")}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Volver a Mis Aplicaciones
                </button>
            </div>

            {/* Page Title - Process Name */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-4xl font-black text-gray-900 mb-2">
                            {process.name}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {process.position}
                        </p>
                    </div>
                    <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            WorkerStatusColors[application.status]
                        }`}
                    >
                        {WorkerStatusLabels[application.status]}
                    </span>
                </div>
            </div>

            {/* Available Tests Section - Wrapped with Video Gate */}
            {processTests && (((processTests as ProcessTestsData).tests?.length ?? 0) > 0 || ((processTests as ProcessTestsData).fixedTests?.length ?? 0) > 0) && (
                <div className="w-full">
                    <VideoRequirementGate
                        processId={process.id}
                        workerId={user?.worker?.id || ""}
                        workerProcessId={application.id}
                        onVideoCompleted={() => {
                            // Reload page or invalidate queries
                            window.location.reload();
                        }}
                    >
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Tests Disponibles
                            </h2>

                        <div className="space-y-4">
                        {/* Custom Tests */}
                        {(processTests as ProcessTestsData).tests?.map((test) => (
                            <div
                                key={test.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {test.name}
                                        </h3>
                                        {test.description && (
                                            <p className="text-gray-600 text-sm mb-3">
                                                {test.description}
                                            </p>
                                        )}
                                        <div className="flex gap-4 text-sm text-gray-500">
                                            {test.duration && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {test.duration} minutos
                                                </span>
                                            )}
                                            {test.questions && (
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-4 h-4" />
                                                    {test.questions.length} preguntas
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {(() => {
                                        const status = test.testStatus || 'available';
                                        if (status === 'completed') {
                                            return (
                                                <div className="ml-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Completado
                                                </div>
                                            );
                                        } else if (status === 'incomplete') {
                                            return (
                                                <div className="ml-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Incompleto
                                                </div>
                                            );
                                        } else if (status === 'in_progress') {
                                            // Find the test response to get the ID for navigation
                                            const response = application.testResponses?.find((r: TestResponse) =>
                                                r.test?.id === test.id
                                            );
                                            return (
                                                <div className="ml-4 flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                                                        En Progreso
                                                    </span>
                                                    {response && (
                                                        <button
                                                            onClick={() => navigate(`/trabajador/test/${response.id}`)}
                                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                                                        >
                                                            Continuar Test
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <button
                                                    onClick={() => handleStartTest(test.id)}
                                                    disabled={startingTestId === test.id}
                                                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {startingTestId === test.id
                                                        ? "Iniciando..."
                                                        : "Iniciar Test"}
                                                </button>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        ))}

                        {/* Fixed Tests */}
                        {(processTests as ProcessTestsData).fixedTests?.map((fixedTest) => (
                            <div
                                key={fixedTest.id}
                                className="border border-indigo-200 bg-indigo-50 rounded-lg p-4 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {fixedTest.name}
                                            </h3>
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                                                Test Psicométrico
                                            </span>
                                        </div>
                                        {fixedTest.description && (
                                            <p className="text-gray-700 text-sm mb-3">
                                                {fixedTest.description}
                                            </p>
                                        )}
                                        <div className="flex gap-4 text-sm text-gray-600">
                                            {fixedTest.duration && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {fixedTest.duration} minutos
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Target className="w-4 h-4" />
                                                {fixedTest.code}
                                            </span>
                                        </div>
                                    </div>
                                    {(() => {
                                        const status = fixedTest.testStatus || 'available';
                                        if (status === 'completed') {
                                            return (
                                                <div className="ml-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Completado
                                                </div>
                                            );
                                        } else if (status === 'incomplete') {
                                            return (
                                                <div className="ml-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Incompleto
                                                </div>
                                            );
                                        } else if (status === 'in_progress') {
                                            // Find the test response to get the ID for navigation
                                            const response = application.testResponses?.find((r: TestResponse) =>
                                                r.fixedTest?.id === fixedTest.id
                                            );
                                            return (
                                                <div className="ml-4 flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                                                        En Progreso
                                                    </span>
                                                    {response && (
                                                        <button
                                                            onClick={() => navigate(`/trabajador/test/${response.id}`)}
                                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                                                        >
                                                            Continuar Test
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <button
                                                    onClick={() => handleStartTest(fixedTest.id, true)}
                                                    disabled={startingTestId === fixedTest.id}
                                                    className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {startingTestId === fixedTest.id
                                                        ? "Iniciando..."
                                                        : "Iniciar Test"}
                                                </button>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    </VideoRequirementGate>
                </div>
            )}

            {/* Grid: Process Info/Application Status and Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Process Info and Application Status Combined Card */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Detalle de la Oportunidad
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                                Empresa
                            </h3>
                            <p className="text-lg text-gray-900">
                                {process.company?.name || "No especificada"}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                                Código del Proceso
                            </h3>
                            <p className="text-lg text-gray-900">{process.code}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                                Ubicación
                            </h3>
                            <p className="text-lg text-gray-900">
                                {process.location || "No especificada"}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                                Departamento
                            </h3>
                            <p className="text-lg text-gray-900">
                                {process.department || "No especificado"}
                            </p>
                        </div>
                    </div>

                    {process.description && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                                Descripción del Proceso
                            </h3>
                            <p className="text-gray-700 whitespace-pre-line">
                                {process.description}
                            </p>
                        </div>
                    )}

                    {/* Application Status Section */}
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Estado de tu Postulación
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Fecha de Postulación
                                </h3>
                                <p className="text-lg text-gray-900">
                                    {formatDate(application.appliedAt)}
                                </p>
                            </div>

                            {application.evaluatedAt && (
                                <div className="border-l-4 border-green-500 pl-4">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                                        Fecha de Evaluación
                                    </h3>
                                    <p className="text-lg text-gray-900">
                                        {formatDate(application.evaluatedAt)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {application.notes && (
                            <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">
                                    Notas del Evaluador
                                </h3>
                                <p className="text-gray-600">{application.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Timeline del Proceso
                    </h2>

                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                        <div className="space-y-6">
                            {/* Postulación */}
                            <div className="relative flex items-start">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white z-10">
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Postulación Enviada
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {formatDate(application.appliedAt)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tu postulación fue registrada exitosamente
                                </p>
                            </div>
                        </div>

                        {/* Evaluación */}
                        {application.evaluatedAt && (
                            <div className="relative flex items-start">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white z-10">
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Evaluación Completada
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(application.evaluatedAt)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Tu postulación fue evaluada
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Estado actual */}
                        <div className="relative flex items-start">
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full z-10 ${
                                    application.status === "pending"
                                        ? "bg-yellow-500"
                                        : application.status === "in_process"
                                        ? "bg-blue-500"
                                        : application.status === "approved" ||
                                          application.status === "hired"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                }`}
                            >
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Estado Actual
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {WorkerStatusLabels[application.status]}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {application.status === "pending" &&
                                        "Tu postulación está siendo revisada"}
                                    {application.status === "in_process" &&
                                        "Tu postulación está en proceso de evaluación"}
                                    {application.status === "approved" &&
                                        "¡Felicitaciones! Has sido aprobado"}
                                    {application.status === "rejected" &&
                                        "Tu postulación no fue seleccionada"}
                                    {application.status === "hired" &&
                                        "¡Felicitaciones! Has sido contratado"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Close Timeline Section */}
                </div>
            {/* Close grid container */}
            </div>
        </div>
    );
};
