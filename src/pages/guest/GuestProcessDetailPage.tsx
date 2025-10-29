// Copia de CompanyProcessDetailPage pero SIN botón de invitar (Guest no tiene WORKERS_INVITE)
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { processesService } from '../../services/processes.service';
import { WorkerStatus, WorkerStatusLabels } from '../../types/worker.types';
import { ProcessStatusLabels, ProcessStatusColors } from '../../types/process.types';

type TabType = 'info' | 'candidates' | 'approved';

export const GuestProcessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const { data: process, isLoading } = useQuery({
    queryKey: ['process', id],
    queryFn: () => processesService.getById(id!),
    enabled: !!id,
  });

  const workers = process?.workers || [];
  const stats = {
    total: workers.length,
    inProcess: workers.filter(w => w.status === WorkerStatus.IN_PROCESS).length,
    approved: workers.filter(w => w.status === WorkerStatus.APPROVED).length,
    rejected: workers.filter(w => w.status === WorkerStatus.REJECTED).length,
  };

  const approvedWorkers = workers.filter(w => w.status === WorkerStatus.APPROVED);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando proceso...</div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Proceso no encontrado</p>
        <button
          onClick={() => navigate('/invitado/procesos')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Volver a procesos
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const color = ProcessStatusColors[status as keyof typeof ProcessStatusColors];
    const label = ProcessStatusLabels[status as keyof typeof ProcessStatusLabels];
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
        {label}
      </span>
    );
  };

  const getWorkerStatusBadge = (status: WorkerStatus) => {
    const colors = {
      [WorkerStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [WorkerStatus.IN_PROCESS]: 'bg-yellow-100 text-yellow-800',
      [WorkerStatus.APPROVED]: 'bg-green-100 text-green-800',
      [WorkerStatus.REJECTED]: 'bg-red-100 text-red-800',
      [WorkerStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800',
    };
    const label = WorkerStatusLabels[status];
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/invitado/procesos')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
          >
            ← Volver a procesos
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{process.name}</h1>
          <p className="text-gray-600 mt-1">{process.description || 'Sin descripción'}</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(process.status)}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Postulantes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">En Evaluación</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.inProcess}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Aprobados</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Rechazados</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'candidates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Candidatos ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'approved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aprobados ({stats.approved})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Tab: Información */}
        {activeTab === 'info' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Información del Proceso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Empresa</label>
                <p className="text-gray-900 mt-1">{process.company?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Código</label>
                <p className="text-gray-900 mt-1">{process.code || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Inicio</label>
                <p className="text-gray-900 mt-1">
                  {process.startDate ? new Date(process.startDate).toLocaleDateString('es-CL') : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Fin</label>
                <p className="text-gray-900 mt-1">
                  {process.endDate ? new Date(process.endDate).toLocaleDateString('es-CL') : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vacantes</label>
                <p className="text-gray-900 mt-1">{process.maxWorkers || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <div className="mt-1">{getStatusBadge(process.status)}</div>
              </div>
              {process.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Descripción</label>
                  <p className="text-gray-900 mt-1">{process.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Candidatos */}
        {activeTab === 'candidates' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Lista de Candidatos</h2>
            {workers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay candidatos postulados aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        RUT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha Aplicación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workers.map((workerProcess) => (
                      <tr key={workerProcess.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {workerProcess.worker?.firstName} {workerProcess.worker?.lastName}
                          </div>
                          {workerProcess.worker?.email && (
                            <div className="text-sm text-gray-500">{workerProcess.worker.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workerProcess.worker?.rut || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getWorkerStatusBadge(workerProcess.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {workerProcess.appliedAt
                            ? new Date(workerProcess.appliedAt).toLocaleDateString('es-CL')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Aprobados */}
        {activeTab === 'approved' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Candidatos Aprobados</h2>
            {approvedWorkers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay candidatos aprobados aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        RUT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha Aprobación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approvedWorkers.map((workerProcess) => (
                      <tr key={workerProcess.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {workerProcess.worker?.firstName} {workerProcess.worker?.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workerProcess.worker?.rut || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {workerProcess.worker?.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {workerProcess.worker?.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {workerProcess.updatedAt
                            ? new Date(workerProcess.updatedAt).toLocaleDateString('es-CL')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
