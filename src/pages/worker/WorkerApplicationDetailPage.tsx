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
    const hasTests =
        application.testResponses && application.testResponses.length > 0;

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
        } catch (error) {
            console.error("Error starting test:", error);
            alert("Error al iniciar el test. Por favor intenta nuevamente.");
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
            {/* Header */}
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

            {/* Process Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            Descripción del Proceso
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">
                            {process.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Application Status Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Estado de tu Postulación
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                    {application.totalScore !== null &&
                        application.totalScore !== undefined && (
                            <div className="border-l-4 border-purple-500 pl-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Puntaje Total
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {application.totalScore}%
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

            {/* Available Tests Section - Wrapped with Video Gate */}
            {processTests && ((processTests as any).tests?.length > 0 || (processTests as any).fixedTests?.length > 0) && (
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
                        {(processTests as any).tests?.map((test: any) => (
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
                                                <span>⏱️ {test.duration} minutos</span>
                                            )}
                                            {test.questions && (
                                                <span>📝 {test.questions.length} preguntas</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleStartTest(test.id, false)}
                                        disabled={startingTestId === test.id}
                                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {startingTestId === test.id
                                            ? "Iniciando..."
                                            : "Iniciar Test"}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Fixed Tests */}
                        {(processTests as any).fixedTests?.map((fixedTest: any) => (
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
                                                <span>⏱️ {fixedTest.duration} minutos</span>
                                            )}
                                            <span>🎯 {fixedTest.code}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleStartTest(fixedTest.id, true)}
                                        disabled={startingTestId === fixedTest.id}
                                        className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {startingTestId === fixedTest.id
                                            ? "Iniciando..."
                                            : "Iniciar Test"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                </VideoRequirementGate>
            )}


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
            </div>
        </div>
    );
};
