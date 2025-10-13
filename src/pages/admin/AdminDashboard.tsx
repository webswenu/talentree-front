import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { QuickStats } from '../../components/widgets/QuickStats';
import { ActivityFeed } from '../../components/widgets/ActivityFeed';
import { RecentList } from '../../components/widgets/RecentList';
import { BarChart } from '../../components/charts/BarChart';
import { QuickActions } from '../../components/widgets/QuickActions';

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Empresas Activas',
      value: 24,
      trend: { value: 12, isPositive: true },
      color: 'blue' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: 'Procesos Activos',
      value: 58,
      trend: { value: 8, isPositive: true },
      color: 'green' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: 'Candidatos',
      value: 342,
      trend: { value: 5, isPositive: false },
      color: 'yellow' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: 'Tests Completados',
      value: 128,
      trend: { value: 15, isPositive: true },
      color: 'gray' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    }
  ];

  const recentProcesses = [
    {
      id: 1,
      title: 'Operadores Mina Los Pelambres',
      subtitle: 'Minera Los Pelambres',
      status: { label: 'Activo', color: 'green' as const },
      meta: '12 candidatos | Creado hace 2 días',
      onClick: () => navigate('/admin/procesos/1')
    },
    {
      id: 2,
      title: 'Supervisores Turno Noche',
      subtitle: 'Codelco El Teniente',
      status: { label: 'En revisión', color: 'yellow' as const },
      meta: '8 candidatos | Creado hace 5 días',
      onClick: () => navigate('/admin/procesos/2')
    },
    {
      id: 3,
      title: 'Mecánicos Especialistas',
      subtitle: 'Antofagasta Minerals',
      status: { label: 'Cerrado', color: 'gray' as const },
      meta: '15 candidatos | Finalizado hace 1 semana',
      onClick: () => navigate('/admin/procesos/3')
    }
  ];

  const activities = [
    {
      id: 1,
      user: 'Juan Pérez',
      action: 'creó un nuevo proceso',
      target: 'Operadores Mina',
      time: 'Hace 10 minutos',
      type: 'create' as const
    },
    {
      id: 2,
      user: 'María González',
      action: 'actualizó empresa',
      target: 'Minera Los Pelambres',
      time: 'Hace 1 hora',
      type: 'update' as const
    },
    {
      id: 3,
      user: 'Carlos Soto',
      action: 'eliminó test',
      target: 'Test Psicométrico V2',
      time: 'Hace 2 horas',
      type: 'delete' as const
    },
    {
      id: 4,
      user: 'Ana Martínez',
      action: 'aprobó candidato',
      target: 'Roberto Silva',
      time: 'Hace 3 horas',
      type: 'info' as const
    }
  ];

  const processData = [
    { label: 'Enero', value: 12, color: 'bg-blue-600' },
    { label: 'Febrero', value: 19, color: 'bg-blue-600' },
    { label: 'Marzo', value: 15, color: 'bg-blue-600' },
    { label: 'Abril', value: 22, color: 'bg-blue-600' },
    { label: 'Mayo', value: 18, color: 'bg-blue-600' },
    { label: 'Junio', value: 25, color: 'bg-blue-600' }
  ];

  const quickActions = [
    {
      id: 'new-company',
      label: 'Nueva Empresa',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => navigate('/admin/empresas?action=create'),
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
      onClick: () => navigate('/admin/procesos?action=create'),
      color: 'green' as const
    },
    {
      id: 'new-test',
      label: 'Nuevo Test',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => navigate('/admin/tests?action=create'),
      color: 'yellow' as const
    }
  ];

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
      <QuickActions actions={quickActions} />

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={processData}
          title="Procesos por Mes"
          height={300}
        />

        <RecentList
          title="Procesos Recientes"
          items={recentProcesses}
          viewAllLink={{
            label: 'Ver todos',
            onClick: () => navigate('/admin/procesos')
          }}
        />
      </div>

      {/* Activity Feed */}
      <ActivityFeed activities={activities} maxItems={5} />
    </div>
  );
};
