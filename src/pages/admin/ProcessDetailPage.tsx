import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { processService } from '../../services/process.service';

export const ProcessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: process, isLoading, error } = useQuery({
    queryKey: ['process', id],
    queryFn: () => processService.getById(id!),
    enabled: !!id,
  });

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
            onClick={() => navigate('/admin/procesos')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
          >
            ← Volver a procesos
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{process.name}</h1>
          <p className="text-gray-600">{process.description}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Asignar Tests
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Editar Proceso
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg ${
        process.status === 'active' ? 'bg-green-50 border border-green-200' :
        process.status === 'draft' ? 'bg-gray-50 border border-gray-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Estado del Proceso</h3>
            <p className="text-sm text-gray-600">
              {process.status === 'active' && 'El proceso está activo y recibiendo postulaciones'}
              {process.status === 'draft' && 'El proceso está en borrador'}
              {process.status === 'completed' && 'El proceso ha finalizado'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            process.status === 'active' ? 'bg-green-100 text-green-800' :
            process.status === 'draft' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {process.status === 'active' && 'Activo'}
            {process.status === 'draft' && 'Borrador'}
            {process.status === 'completed' && 'Completado'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
            Información
          </button>
          <button className="border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
            Tests
          </button>
          <button className="border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
            Candidatos
          </button>
          <button className="border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
            Aprobados
          </button>
          <button className="border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
            Reportes
          </button>
          <button className="border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
            Timeline
          </button>
        </nav>
      </div>

      {/* Process Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Información del Proceso</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Empresa</label>
                <p className="text-gray-900">{process.company?.name || 'No asignada'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Inicio</label>
                <p className="text-gray-900">
                  {process.startDate ? new Date(process.startDate).toLocaleDateString('es-CL') : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Fin</label>
                <p className="text-gray-900">
                  {process.endDate ? new Date(process.endDate).toLocaleDateString('es-CL') : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vacantes</label>
                <p className="text-gray-900">{process.vacancies}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="text-gray-900">{process.description}</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {process.requirements && (
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Requisitos</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700">{process.requirements}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Postulantes</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">En Evaluación</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Aprobados</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Acciones Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                Exportar candidatos
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                Generar reporte
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                Notificar empresa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
