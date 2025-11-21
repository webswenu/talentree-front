import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { QuickStats } from "../../components/widgets/QuickStats";
import { ActivityFeed } from "../../components/widgets/ActivityFeed";
import { RecentList } from "../../components/widgets/RecentList";
import { BarChart } from "../../components/charts/BarChart";
import { QuickActions } from "../../components/widgets/QuickActions";
import { CompanyModal } from "../../components/admin/CompanyModal";
import ProcessModal from "../../components/admin/ProcessModal";
import { useCompaniesStats } from "../../hooks/useCompanies";
import { useProcessesStats, useProcesses } from "../../hooks/useProcesses";
import { useWorkersStats } from "../../hooks/useWorkers";
import { useTestResponsesStats } from "../../hooks/useTestResponses";
import { useAuditStats } from "../../hooks/useAudit";
import { ProcessStatusLabels } from "../../types/process.types";

export const AdminDashboard = () => {
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
    const { data: auditStats, isLoading: loadingAudit } = useAuditStats();
    const { data: processesData, isLoading: loadingRecentProcesses } =
        useProcesses();
    const recentProcesses = processesData?.data || [];

    const isLoading =
        loadingCompanies ||
        loadingProcesses ||
        loadingWorkers ||
        loadingTests ||
        loadingAudit ||
        loadingRecentProcesses;

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
            onClick: () => navigate(`/admin/procesos/${process.id}`),
        }));

    const activities = (auditStats?.recentActivity || [])
        .slice(0, 10)
        .map((log) => ({
            id: log.id,
            user: log.user
                ? `${log.user.firstName} ${log.user.lastName}`
                : "Sistema",
            action: getActionLabel(log.action),
            target: log.entityType,
            time: getTimeAgo(log.createdAt),
            type: getActivityType(log.action),
        }));

    const processData = (processesStats?.byMonth || []).map((item) => ({
        label: item.month,
        value: item.count,
        color: "bg-blue-600",
    }));

    const quickActions = [
        {
            id: "new-company",
            label: "Nueva Empresa",
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
                        d="M12 4v16m8-8H4"
                    />
                </svg>
            ),
            onClick: () => setIsCompanyModalOpen(true),
            color: "orange" as const,
        },
        {
            id: "new-process",
            label: "Nuevo Proceso",
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
            onClick: () => setIsProcessModalOpen(true),
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
                    Dashboard de Administración
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
                            onClick: () => navigate("/admin/procesos"),
                        }}
                    />
                )}
            </div>

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-teal-200 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-4 text-sm font-semibold text-teal-600">Actividad Reciente</span>
                </div>
            </div>

            {/* Activity Feed */}
            {activities.length > 0 && (
                <ActivityFeed activities={activities} maxItems={10} />
            )}

            {/* Company Modal */}
            {isCompanyModalOpen && (
                <CompanyModal
                    company={null}
                    onClose={() => setIsCompanyModalOpen(false)}
                />
            )}

            {/* Process Modal */}
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

function getActionLabel(action: string): string {
    const actionLabels: Record<string, string> = {
        created: "creó",
        updated: "actualizó",
        deleted: "eliminó",
        login: "inició sesión",
        logout: "cerró sesión",
        view: "visualizó",
    };
    return actionLabels[action] || action;
}

function getActivityType(
    action: string
): "create" | "update" | "delete" | "info" {
    const typeMap: Record<string, "create" | "update" | "delete" | "info"> = {
        created: "create",
        updated: "update",
        deleted: "delete",
        login: "info",
        logout: "info",
        view: "info",
    };
    return typeMap[action] || "info";
}

function getTimeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60)
        return `Hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
    if (diffHours < 24)
        return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
}
