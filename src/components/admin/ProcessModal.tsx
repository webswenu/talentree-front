import { useEffect, useState } from 'react';
import { SelectionProcess, CreateProcessDto, ProcessStatus, ProcessStatusLabels } from '../../types/process.types';
import { useCreateProcess, useUpdateProcess } from '../../hooks/useProcesses';
import { useCompanies } from '../../hooks/useCompanies';

interface ProcessModalProps {
  process?: SelectionProcess;
  onClose: () => void;
}

export default function ProcessModal({ process, onClose }: ProcessModalProps) {
  const createMutation = useCreateProcess();
  const updateMutation = useUpdateProcess();
  const { data: companies } = useCompanies();

  const [formData, setFormData] = useState<CreateProcessDto>({
    name: '',
    code: '',
    position: '',
    description: '',
    companyId: '',
    status: ProcessStatus.DRAFT,
    startDate: undefined,
    endDate: undefined,
    maxWorkers: undefined,
  });

  useEffect(() => {
    if (process) {
      setFormData({
        name: process.name,
        code: process.code,
        position: process.position,
        description: process.description || '',
        companyId: process.company?.id || '',
        status: process.status,
        startDate: process.startDate,
        endDate: process.endDate,
        maxWorkers: process.maxWorkers,
      });
    }
  }, [process]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (process) {
        await updateMutation.mutateAsync({ id: process.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar proceso:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxWorkers' ? (value ? parseInt(value) : undefined) : value || undefined,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {process ? 'Editar Proceso' : 'Nuevo Proceso'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione una empresa</option>
                {companies?.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.businessName} - {company.rut}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.values(ProcessStatus).map((status) => (
                  <option key={status} value={status}>
                    {ProcessStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de Trabajadores
              </label>
              <input
                type="number"
                name="maxWorkers"
                value={formData.maxWorkers || ''}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
