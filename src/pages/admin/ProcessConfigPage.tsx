import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProcess, useProcessTests, useRemoveTest, useRemoveFixedTest } from "../../hooks/useProcesses";
import { Test, FixedTest } from "../../types/test.types";
import { AssignTestsModal } from "../../components/common/AssignTestsModal";
import ProcessModal from "../../components/admin/ProcessModal";
import { VideoRequirementsConfig } from "../../components/admin/VideoRequirementsConfig";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types/user.types";

type TabType = "edit" | "tests" | "video";

interface ProcessTestsData {
    tests?: Test[];
    fixedTests?: FixedTest[];
}

export const ProcessConfigPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabType>("edit");
    const [assignTestsModal, setAssignTestsModal] = useState(false);
    const [editProcessModal, setEditProcessModal] = useState(false);

    const { data: process, isLoading, error } = useProcess(id!);
    const { data: testsData } = useProcessTests(id!) as { data?: ProcessTestsData };
    const removeTestMutation = useRemoveTest();
    const removeFixedTestMutation = useRemoveFixedTest();
    const { user } = useAuthStore();

    const isAdmin = user?.role === UserRole.ADMIN_TALENTREE;
    const isEvaluator = location.pathname.includes("/evaluador");
    const isCompany = location.pathname.includes("/empresa");
    const baseRoute = isEvaluator ? "/evaluador" : isCompany ? "/empresa" : "/admin";

    // Solo admin puede editar/asignar/eliminar
    const canEdit = isAdmin && !isEvaluator && !isCompany;

    const handleRemoveTest = async (testId: string) => {
        if (!id) return;
        try {
            await removeTestMutation.mutateAsync({ processId: id, testId });
        } catch {
            // Error handled silently or by mutation error handler
        }
    };

    const handleRemoveFixedTest = async (fixedTestId: string) => {
        if (!id) return;
        try {
            await removeFixedTestMutation.mutateAsync({ processId: id, fixedTestId });
        } catch {
            // Error handled silently or by mutation error handler
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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate(`${baseRoute}/procesos`)}
                    className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
                >
                    ← Volver a procesos
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    Configuración: {process.name}
                </h1>
                <p className="text-gray-600 mt-1">
                    Administra la configuración del proceso de selección
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("edit")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "edit"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Editar Proceso
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
                        onClick={() => setActiveTab("video")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "video"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Video
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "edit" && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Información del Proceso
                        </h2>
                        {canEdit && (
                            <button
                                onClick={() => setEditProcessModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Editar Proceso
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-4">
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
                        </div>

                        {/* Requirements */}
                        {process.requirements && (
                            <div className="space-y-4">
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
                </div>
            )}

            {/* Tab Tests */}
            {activeTab === "tests" && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Tests Asignados
                            </h2>
                            {canEdit && (
                                <button
                                    onClick={() => setAssignTestsModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Asignar Tests
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {testsData?.tests && testsData.tests.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        Tests Personalizados
                                    </h3>
                                    <div className="grid gap-3">
                                        {testsData.tests.map((test) => (
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
                                        {testsData.fixedTests.map((test) => (
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

            {/* Tab Video */}
            {activeTab === "video" && (
                <div>
                    <VideoRequirementsConfig processId={id!} readOnly={!canEdit} />
                </div>
            )}

            {/* Modals */}
            <AssignTestsModal
                isOpen={assignTestsModal}
                onClose={() => setAssignTestsModal(false)}
                processId={id!}
                assignedTestIds={testsData?.fixedTests?.map((t) => t.id) || []}
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
