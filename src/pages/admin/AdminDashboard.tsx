import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { QuickStats } from '../../components/widgets/QuickStats';
import { ActivityFeed } from '../../components/widgets/ActivityFeed';
import { RecentList } from '../../components/widgets/RecentList';
import { BarChart } from '../../components/charts/BarChart';
import { QuickActions } from '../../components/widgets/QuickActions';
import { CompanyModal } from '../../components/admin/CompanyModal';
import ProcessModal from '../../components/admin/ProcessModal';
import { useCompaniesStats } from '../../hooks/useCompanies';
import { useProcessesStats, useProcesses } from '../../hooks/useProcesses';
import { useWorkersStats } from '../../hooks/useWorkers';
import { useTestResponsesStats } from '../../hooks/useTestResponses';
import { useAuditStats } from '../../hooks/useAudit';
import { ProcessStatusLabels } from '../../types/process.types';

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  // Fetch all stats
  const { data: companiesStats, isLoading: loadingCompanies } = useCompaniesStats();
  const { data: processesStats, isLoading: loadingProcesses } = useProcessesStats();
  const { data: workersStats, isLoading: loadingWorkers } = useWorkersStats();
  const { data: testResponsesStats, isLoading: loadingTests } = useTestResponsesStats();
  const { data: auditStats, isLoading: loadingAudit } = useAuditStats();
  const { data: recentProcesses, isLoading: loadingRecentProcesses } = useProcesses();

  const isLoading = loadingCompanies || loadingProcesses || loadingWorkers || loadingTests || loadingAudit || loadingRecentProcesses;

  // QuickStats data
  const stats = [
    {
      title: 'Empresas Activas',
      value: companiesStats?.active ?? 0,
      trend: companiesStats ? { value: 12, isPositive: true } : undefined,
      color: 'blue' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: 'Procesos Activos',
      value: processesStats?.byStatus?.active ?? 0,
      trend: processesStats ? { value: 8, isPositive: true } : undefined,
      color: 'green' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: 'Candidatos',
      value: workersStats?.total ?? 0,
      trend: workersStats ? { value: 5, isPositive: false } : undefined,
      color: 'yellow' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: 'Tests Completados',
      value: testResponsesStats?.completed ?? 0,
      trend: testResponsesStats ? { value: 15, isPositive: true } : undefined,
      color: 'gray' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    }
  ];

  // Recent processes list
  const recentProcessesList = (recentProcesses || []).slice(0, 5).map((process) => ({
    id: process.id,
    title: process.name,
    subtitle: process.company?.name || 'Sin empresa',
    status: {
      label: ProcessStatusLabels[process.status],
      color: getStatusColor(process.status)
    },
    meta: `Creado el ${new Date(process.createdAt).toLocaleDateString('es-ES')}`,
    onClick: () => navigate(`/admin/procesos/${process.id}`)
  }));

  // Activity feed from audit
  const activities = (auditStats?.recentActivity || []).slice(0, 10).map((log) => ({
    id: log.id,
    user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Sistema',
    action: getActionLabel(log.action),
    target: log.entityType,
    time: getTimeAgo(log.createdAt),
    type: getActivityType(log.action)
  }));

  // Process chart data (by month)
  const processData = (processesStats?.byMonth || []).map((item) => ({
    label: item.month,
    value: item.count,
    color: 'bg-blue-600'
  }));

  // Quick actions
  const quickActions = [
    {
      id: 'new-company',
      label: 'Nueva Empresa',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => setIsCompanyModalOpen(true),
      color: 'blue' as const
    },
    {
      id: 'new-process',
      label: 'Nuevo Proceso',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      onClick: () => setIsProcessModalOpen(true),
      color: 'green' as const
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenido, {user?.firstName}</p>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Quick Actions */}
      <QuickActions actions={quickActions} columns={2} />

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
              label: 'Ver todos',
              onClick: () => navigate('/admin/procesos')
            }}
          />
        )}
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
        <ProcessModal
          onClose={() => setIsProcessModalOpen(false)}
        />
      )}
    </div>
  );
};

// Helper functions
function getStatusColor(status: string): 'blue' | 'green' | 'yellow' | 'red' | 'gray' {
  const colorMap: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
    draft: 'gray',
    active: 'green',
    paused: 'yellow',
    completed: 'blue',
    archived: 'red',
    closed: 'red'
  };
  return colorMap[status] || 'gray';
}

function getActionLabel(action: string): string {
  const actionLabels: Record<string, string> = {
    created: 'creó',
    updated: 'actualizó',
    deleted: 'eliminó',
    login: 'inició sesión',
    logout: 'cerró sesión',
    view: 'visualizó'
  };
  return actionLabels[action] || action;
}

function getActivityType(action: string): 'create' | 'update' | 'delete' | 'info' {
  const typeMap: Record<string, 'create' | 'update' | 'delete' | 'info'> = {
    created: 'create',
    updated: 'update',
    deleted: 'delete',
    login: 'info',
    logout: 'info',
    view: 'info'
  };
  return typeMap[action] || 'info';
}

function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
}
