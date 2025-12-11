import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { QuickStats } from "../../components/widgets/QuickStats";
import { RecentList } from "../../components/widgets/RecentList";
import { BarChart } from "../../components/charts/BarChart";
import { QuickActions } from "../../components/widgets/QuickActions";
import { CompanyModal } from "../../components/admin/CompanyModal";
import ProcessModal from "../../components/admin/ProcessModal";
import { useCompaniesStats } from "../../hooks/useCompanies";
import { useProcessesStats, useProcesses } from "../../hooks/useProcesses";
import { useWorkersStats } from "../../hooks/useWorkers";
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
    const { data: processesData, isLoading: loadingRecentProcesses } =
        useProcesses();
    const recentProcesses = processesData?.data || [];

    const isLoading =
        loadingCompanies ||
        loadingProcesses ||
        loadingWorkers ||
        loadingRecentProcesses;

    const stats = [
        {
            title: "Empresas Activas",
            value: companiesStats?.active ?? 0,
            color: "orange" as const,
            onClick: () => navigate("/evaluador/empresas"),
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
            onClick: () => navigate("/evaluador/procesos"),
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
            onClick: () => navigate("/evaluador/trabajadores"),
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
            <QuickStats stats={stats} columns={3} />

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
