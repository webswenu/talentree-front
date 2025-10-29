import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { testResponsesService } from '../../services/test-responses.service';
import { TestTypeLabels } from '../../types/test.types';
import { QuickStats } from '../../components/widgets/QuickStats';
import { RecentList } from '../../components/widgets/RecentList';
import { BarChart } from '../../components/charts/BarChart';
import { QuickActions } from '../../components/widgets/QuickActions';
import { CompanyModal } from '../../components/admin/CompanyModal';
import ProcessModal from '../../components/admin/ProcessModal';
import { useCompaniesStats } from '../../hooks/useCompanies';
import { useProcessesStats, useProcesses } from '../../hooks/useProcesses';
import { useWorkersStats } from '../../hooks/useWorkers';
import { useTestResponsesStats } from '../../hooks/useTestResponses';
import { ProcessStatusLabels } from '../../types/process.types';

export const EvaluatorDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  // Fetch all stats (igual que Admin)
  const { data: companiesStats, isLoading: loadingCompanies } = useCompaniesStats();
  const { data: processesStats, isLoading: loadingProcesses } = useProcessesStats();
  const { data: workersStats, isLoading: loadingWorkers } = useWorkersStats();
  const { data: testResponsesStats, isLoading: loadingTests } = useTestResponsesStats();
  const { data: processesData, isLoading: loadingRecentProcesses } = useProcesses();
  const recentProcesses = processesData?.data || [];

  const isLoading = loadingCompanies || loadingProcesses || loadingWorkers || loadingTests || loadingRecentProcesses;

  // Obtener tests pendientes de evaluación (completados pero requieren revisión manual)
  const { data: pendingEvaluations } = useQuery({
    queryKey: ['pending-evaluations'],
    queryFn: async () => {
      // Obtener todos los test responses que requieren revisión manual
      const responses = await testResponsesService.findAll?.() || [];
      return responses.filter(
        (tr) =>
          tr.isCompleted &&
          tr.test?.requiresManualReview &&
          !tr.evaluatorNotes // Sin notas del evaluador = pendiente de revisar
      );
    },
  });

  const isUrgent = (completedAt?: Date) => {
    if (!completedAt) return false;
    const daysSinceCompletion = Math.floor(
      (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCompletion > 2; // Urgente si pasaron más de 2 días
  };

  const getDaysRemaining = (completedAt?: Date) => {
    if (!completedAt) return 'N/A';
    const daysSinceCompletion = Math.floor(
      (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = 7 - daysSinceCompletion; // 7 días como límite
    if (daysRemaining < 0) return 'Vencido';
    return `${daysRemaining} días`;
  };

  const countOpenQuestions = (testResponse: any) => {
    return testResponse.test?.questions?.filter((q: any) => q.type === 'open_text').length || 0;
  };

  // QuickStats data (igual que Admin)
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
    onClick: () => navigate(`/evaluador/procesos/${process.id}`)
  }));

  // Process chart data (by month)
  const processData = (processesStats?.byMonth || []).map((item) => ({
    label: item.month,
    value: item.count,
    color: 'bg-blue-600'
  }));

  // Quick actions (solo lectura, sin crear)
  const quickActions = [
    {
      id: 'view-companies',
      label: 'Ver Empresas',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      onClick: () => navigate('/evaluador/empresas'),
      color: 'blue' as const
    },
    {
      id: 'view-tests',
      label: 'Ver Tests',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      onClick: () => navigate('/evaluador/tests'),
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
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mt-1">Panel de Evaluador - Revisa y califica candidatos</p>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Quick Actions */}
      <QuickActions actions={quickActions} columns={2} />

      {/* Evaluaciones Pendientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Evaluaciones Pendientes</h2>
          <p className="text-sm text-gray-600 mt-1">Tests que requieren calificación manual</p>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingEvaluations && pendingEvaluations.length > 0 ? (
            pendingEvaluations.map((testResponse) => {
              const urgent = isUrgent(testResponse.completedAt);
              const openQuestionsCount = countOpenQuestions(testResponse);

              return (
                <div
                  key={testResponse.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    urgent ? 'bg-red-50 border-l-4 border-red-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {urgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">
                            🔴 URGENTE
                          </span>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {testResponse.test?.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({TestTypeLabels[testResponse.test?.type]})
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {testResponse.workerProcess?.worker?.firstName}{' '}
                        {testResponse.workerProcess?.worker?.lastName} •{' '}
                        {testResponse.workerProcess?.process?.name} (
                        {testResponse.workerProcess?.process?.company?.name})
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-orange-600 font-medium">
                          {openQuestionsCount} preguntas abiertas sin revisar
                        </span>
                        <span className="text-sm text-gray-500">
                          • Vence en {getDaysRemaining(testResponse.completedAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/evaluador/revisar/${testResponse.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {urgent ? 'Evaluar Ahora' : 'Revisar'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <span className="text-6xl">🎉</span>
              <p className="text-gray-600 mt-4">¡No tienes evaluaciones pendientes!</p>
              <p className="text-sm text-gray-500 mt-1">Buen trabajo, estás al día</p>
            </div>
          )}
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
              label: 'Ver todos',
              onClick: () => navigate('/evaluador/procesos')
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
