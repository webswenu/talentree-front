import { useState, useEffect } from 'react';
import { Report, ReportType, ReportTypeLabels, CreateReportDto } from '../../types/report.types';
import { useCreateReport, useUpdateReport } from '../../hooks/useReports';
import { useProcesses } from '../../hooks/useProcesses';
import { useWorkers } from '../../hooks/useWorkers';

interface ReportModalProps {
  report?: Report;
  onClose: () => void;
}

export default function ReportModal({ report, onClose }: ReportModalProps) {
  const createMutation = useCreateReport();
  const updateMutation = useUpdateReport();
  const { data: processes } = useProcesses();
  const { data: workers } = useWorkers();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: ReportType.CUSTOM,
    processId: '',
    workerId: '',
    fileUrl: '',
    fileName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || '',
        description: report.description || '',
        type: report.type,
        processId: report.process?.id || '',
        workerId: report.worker?.id || '',
        fileUrl: report.fileUrl || '',
        fileName: report.fileName || '',
      });
    }
  }, [report]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.type) {
      newErrors.type = 'El tipo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const reportData: CreateReportDto = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        processId: formData.processId || undefined,
        workerId: formData.workerId || undefined,
        fileUrl: formData.fileUrl || undefined,
        fileName: formData.fileName || undefined,
      };

      if (report) {
        await updateMutation.mutateAsync({
          id: report.id,
          data: reportData,
        });
      } else {
        await createMutation.mutateAsync(reportData);
      }

      onClose();
    } catch (error) {
      console.error('Error al guardar reporte:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {report ? 'Editar Reporte' : 'Nuevo Reporte'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              {Object.values(ReportType).map((type) => (
                <option key={type} value={type}>
                  {ReportTypeLabels[type]}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Proceso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proceso (Opcional)</label>
            <select
              name="processId"
              value={formData.processId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Ninguno</option>
              {processes?.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.name} - {process.position}
                </option>
              ))}
            </select>
          </div>

          {/* Trabajador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trabajador (Opcional)</label>
            <select
              name="workerId"
              value={formData.workerId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Ninguno</option>
              {workers?.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.firstName} {worker.lastName} - {worker.rut}
                </option>
              ))}
            </select>
          </div>

          {/* URL del Archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL del Archivo</label>
            <input
              type="url"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/reporte.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Nombre del Archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Archivo</label>
            <input
              type="text"
              name="fileName"
              value={formData.fileName}
              onChange={handleChange}
              placeholder="reporte-evaluacion.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : report ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
