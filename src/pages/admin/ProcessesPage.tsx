import { useState } from 'react';
import { useProcesses, useDeleteProcess } from '../../hooks/useProcesses';
import { SelectionProcess, ProcessStatusLabels, ProcessStatusColors } from '../../types/process.types';
import ProcessModal from '../../components/admin/ProcessModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export default function ProcessesPage() {
  const { data: processes, isLoading } = useProcesses();
  const deleteMutation = useDeleteProcess();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<SelectionProcess | undefined>();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<SelectionProcess | null>(null);

  const handleEdit = (process: SelectionProcess) => {
    setSelectedProcess(process);
    setIsModalOpen(true);
  };

  const handleDelete = (process: SelectionProcess) => {
    setProcessToDelete(process);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!processToDelete) return;

    try {
      await deleteMutation.mutateAsync(processToDelete.id);
      setIsConfirmDeleteOpen(false);
      setProcessToDelete(null);
    } catch (err) {
      // Error ya manejado por el hook
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setProcessToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProcess(undefined);
  };

  const getStatusBadge = (status: string) => {
    const color = ProcessStatusColors[status as keyof typeof ProcessStatusColors];
    const label = ProcessStatusLabels[status as keyof typeof ProcessStatusLabels];
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando procesos...</div>
      </div>
    );
  }

  const stats = {
    total: processes?.length || 0,
    draft: processes?.filter(p => p.status === 'draft').length || 0,
    active: processes?.filter(p => p.status === 'active').length || 0,
    completed: processes?.filter(p => p.status === 'completed').length || 0,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Procesos de Selección</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Proceso
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Borradores</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Activos</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Completados</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Fin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Máx. Trabajadores
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processes?.map((process) => (
              <tr key={process.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{process.name}</div>
                  {process.description && (
                    <div className="text-sm text-gray-500">{process.description.substring(0, 50)}...</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{process.company?.name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(process.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {process.startDate ? new Date(process.startDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {process.endDate ? new Date(process.endDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {process.maxWorkers || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(process)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(process)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProcessModal
          process={selectedProcess}
          onClose={handleCloseModal}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar Proceso"
        message={`¿Estás seguro de eliminar el proceso "${processToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
