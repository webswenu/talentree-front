import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { testResponsesService } from "../../services/test-responses.service";
import { TestTypeLabels } from "../../types/test.types";
import { QuickStats } from "../../components/widgets/QuickStats";
import { RecentList } from "../../components/widgets/RecentList";
import { BarChart } from "../../components/charts/BarChart";
import { QuickActions } from "../../components/widgets/QuickActions";
import { CompanyModal } from "../../components/admin/CompanyModal";
import ProcessModal from "../../components/admin/ProcessModal";
import { useCompaniesStats } from "../../hooks/useCompanies";
import { useProcessesStats, useProcesses } from "../../hooks/useProcesses";
import { useWorkersStats } from "../../hooks/useWorkers";
import { useTestResponsesStats } from "../../hooks/useTestResponses";
import { ProcessStatusLabels } from "../../types/process.types";

export const EvaluatorDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

    const { data: companiesStats, isLoading: loadingCompanies } =
        useCompaniesStats();
    const { data: processesStats, isLoading: loadingProcesses } =
        useProcessesStats();
    const { data: workersStats, isLoading: loadingWorkers } = useWorkersStats();
    const { data: testResponsesStats, isLoading: loadingTests } =
        useTestResponsesStats();
    const { data: processesData, isLoading: loadingRecentProcesses } =
        useProcesses();
    const recentProcesses = processesData?.data || [];

    const isLoading =
        loadingCompanies ||
        loadingProcesses ||
        loadingWorkers ||
        loadingTests ||
        loadingRecentProcesses;

    const { data: pendingEvaluations } = useQuery({
        queryKey: ["pending-evaluations"],
        queryFn: async () => {
            const responses = (await testResponsesService.findAll?.()) || [];
            return responses.filter(
                (tr) =>
                    tr.isCompleted &&
                    tr.test?.requiresManualReview &&
                    !tr.evaluatorNotes
            );
        },
    });

    const isUrgent = (completedAt?: Date) => {
        if (!completedAt) return false;
        const daysSinceCompletion = Math.floor(
            (Date.now() - new Date(completedAt).getTime()) /
                (1000 * 60 * 60 * 24)
        );
        return daysSinceCompletion > 2;
    };

    const getDaysRemaining = (completedAt?: Date) => {
        if (!completedAt) return "N/A";
        const daysSinceCompletion = Math.floor(
            (Date.now() - new Date(completedAt).getTime()) /
                (1000 * 60 * 60 * 24)
        );
        const daysRemaining = 7 - daysSinceCompletion;
        if (daysRemaining < 0) return "Vencido";
        return `${daysRemaining} días`;
    };

    const countOpenQuestions = (testResponse: {
        test?: {
            questions?: Array<{ type: string }>;
        };
    }) => {
        return (
            testResponse.test?.questions?.filter((q) => q.type === "open_text")
                .length || 0
        );
    };

    const stats = [
        {
            title: "Empresas Activas",
            value: companiesStats?.active ?? 0,
            color: "orange" as const,
            icon: (
                <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                </svg>
            ),
        },
        {
            title: "Procesos Activos",
            value: processesStats?.byStatus?.active ?? 0,
            color: "turquoise" as const,
            icon: (
                <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
            ),
        },
        {
            title: "Candidatos",
            value: workersStats?.total ?? 0,
            color: "orange" as const,
            icon: (
                <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            ),
        },
        {
            title: "Tests Completados",
            value: testResponsesStats?.completed ?? 0,
            color: "turquoise" as const,
            icon: (
                <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                </svg>
            ),
        },
    ];

    const recentProcessesList = (recentProcesses || [])
        .slice(0, 5)
        .map((process) => ({
            id: process.id,
            title: process.name,
            subtitle: process.company?.name || "Sin empresa",
            status: {
                label: ProcessStatusLabels[process.status],
                color: getStatusColor(process.status),
            },
            meta: `Creado el ${new Date(process.createdAt).toLocaleDateString(
                "es-ES"
            )}`,
            onClick: () => navigate(`/evaluador/procesos/${process.id}`),
        }));

    const processData = (processesStats?.byMonth || []).map((item) => ({
        label: item.month,
        value: item.count,
        color: "bg-blue-600",
    }));

    const quickActions = [
        {
            id: "view-companies",
            label: "Ver Empresas",
            icon: (
                <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                </svg>
            ),
            onClick: () => navigate("/evaluador/empresas"),
            color: "orange" as const,
        },
        {
            id: "view-tests",
            label: "Ver Tests",
            icon: (
                <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
            ),
            onClick: () => navigate("/evaluador/tests"),
            color: "turquoise" as const,
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="glass-white rounded-2xl p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
                    <div className="text-gray-700 font-bold">Cargando estadísticas...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="rounded-2xl p-8">
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary-600/70 via-secondary-600/70 to-primary-600/70 bg-clip-text">
                    Dashboard de Evaluador
                </h1>
                <p className="text-gray-800 mt-3 text-lg font-bold">
                    Bienvenido, <span className="text-primary-600/80">{user?.firstName}</span>
                </p>
            </div>

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-4 text-sm font-semibold text-gray-500">Resumen</span>
                </div>
            </div>

            {/* Quick Stats */}
            <QuickStats stats={stats} />

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-4 text-sm font-semibold text-gray-500">Acciones Rápidas</span>
                </div>
            </div>

            {/* Quick Actions */}
            <QuickActions actions={quickActions} columns={2} />

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-4 text-sm font-semibold text-purple-600">Evaluaciones Pendientes</span>
                </div>
            </div>

            {/* Evaluaciones Pendientes */}
            <div className="glass-white rounded-2xl p-4 sm:p-6">
                <div className="space-y-3">
                    {pendingEvaluations && pendingEvaluations.length > 0 ? (
                        pendingEvaluations.map((testResponse) => {
                            const urgent = isUrgent(testResponse.completedAt);
                            const openQuestionsCount =
                                countOpenQuestions(testResponse);

                            return (
                                <div
                                    key={testResponse.id}
                                    className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
                                        urgent
                                            ? "bg-red-50/80 border-red-300/50 hover:bg-red-50"
                                            : "border-white/15 bg-white/8 hover:bg-white/12"
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {urgent && (
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-xl flex-shrink-0">
                                                        🔴 URGENTE
                                                    </span>
                                                )}
                                                <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                                    {testResponse.test?.name}
                                                </h3>
                                                <span className="text-xs sm:text-sm text-gray-500 font-medium">
                                                    (
                                                    {
                                                        TestTypeLabels[
                                                            testResponse.test
                                                                ?.type
                                                        ]
                                                    }
                                                    )
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium break-words">
                                                {
                                                    testResponse.workerProcess
                                                        ?.worker?.firstName
                                                }{" "}
                                                {
                                                    testResponse.workerProcess
                                                        ?.worker?.lastName
                                                }{" "}
                                                •{" "}
                                                {
                                                    testResponse.workerProcess
                                                        ?.process?.name
                                                }{" "}
                                                (
                                                {
                                                    testResponse.workerProcess
                                                        ?.process?.company?.name
                                                }
                                                )
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
                                                <span className="text-xs sm:text-sm text-orange-600 font-bold">
                                                    {openQuestionsCount}{" "}
                                                    preguntas abiertas sin
                                                    revisar
                                                </span>
                                                <span className="text-xs sm:text-sm text-gray-500 font-medium">
                                                    • Vence en{" "}
                                                    {getDaysRemaining(
                                                        testResponse.completedAt
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/evaluador/revisar/${testResponse.id}`
                                                )
                                            }
                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-md self-start lg:self-center whitespace-nowrap ${
                                                urgent
                                                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                            }`}
                                        >
                                            {urgent
                                                ? "Evaluar Ahora"
                                                : "Revisar"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center">
                            <span className="text-4xl sm:text-6xl">🎉</span>
                            <p className="text-sm sm:text-base text-gray-600 mt-4 font-medium">
                                ¡No tienes evaluaciones pendientes!
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                                Buen trabajo, estás al día
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-4 text-sm font-semibold text-orange-600">Estadísticas</span>
                </div>
            </div>

            {/* Charts and Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {processData.length > 0 && (
                    <BarChart
                        data={processData}
                        title="Procesos por Mes"
                        height={300}
                    />
                )}

                {recentProcessesList.length > 0 && (
                    <RecentList
                        title="Procesos Recientes"
                        items={recentProcessesList}
                        viewAllLink={{
                            label: "Ver todos",
                            onClick: () => navigate("/evaluador/procesos"),
                        }}
                    />
                )}
            </div>

            {/* Company Modal (read-only for evaluator) */}
            {isCompanyModalOpen && (
                <CompanyModal
                    company={null}
                    onClose={() => setIsCompanyModalOpen(false)}
                />
            )}

            {/* Process Modal (read-only for evaluator) */}
            {isProcessModalOpen && (
                <ProcessModal onClose={() => setIsProcessModalOpen(false)} />
            )}
        </div>
    );
};

function getStatusColor(
    status: string
): "blue" | "green" | "yellow" | "red" | "gray" {
    const colorMap: Record<
        string,
        "blue" | "green" | "yellow" | "red" | "gray"
    > = {
        draft: "gray",
        active: "green",
        paused: "yellow",
        completed: "blue",
        archived: "red",
        closed: "red",
    };
    return colorMap[status] || "gray";
}
