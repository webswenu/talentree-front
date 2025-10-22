import { useState } from 'react';
import { useReports, useDeleteReport } from '../../hooks/useReports';
import { Report, ReportTypeLabels, ReportTypeColors } from '../../types/report.types';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import ReportModal from '../../components/admin/ReportModal';

export default function ReportsPage() {
  const { data: reports, isLoading } = useReports();
  const deleteMutation = useDeleteReport();

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | undefined>(undefined);

  const handleDelete = (report: Report) => {
    setReportToDelete(report);
    setIsConfirmDeleteOpen(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setReportToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (reportToDelete) {
      await deleteMutation.mutateAsync(reportToDelete.id);
      setIsConfirmDeleteOpen(false);
      setReportToDelete(null);
    }
  };

  const handleDownload = (report: Report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    }
  };

  const handleOpenModal = (report?: Report) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsReportModalOpen(false);
    setSelectedReport(undefined);
  };

  const getTypeBadge = (type: string) => {
    const color = ReportTypeColors[type as keyof typeof ReportTypeColors];
    const label = ReportTypeLabels[type as keyof typeof ReportTypeLabels];
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando reportes...</div>
      </div>
    );
  }

  const stats = {
    total: reports?.length || 0,
    withFiles: reports?.filter(r => r.fileUrl).length || 0,
    byProcess: reports?.filter(r => r.process).length || 0,
    byWorker: reports?.filter(r => r.worker).length || 0,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Reporte
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Con Archivos</p>
          <p className="text-2xl font-bold text-green-600">{stats.withFiles}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Por Proceso</p>
          <p className="text-2xl font-bold text-blue-600">{stats.byProcess}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Por Trabajador</p>
          <p className="text-2xl font-bold text-purple-600">{stats.byWorker}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proceso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trabajador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Generado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado Por
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports?.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {report.fileUrl && (
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                      </svg>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.title}</div>
                      {report.description && (
                        <div className="text-sm text-gray-500">{report.description.substring(0, 40)}...</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTypeBadge(report.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.process?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.worker ? `${report.worker.firstName} ${report.worker.lastName}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.createdBy?.firstName} {report.createdBy?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {report.fileUrl && (
                    <button
                      onClick={() => handleDownload(report)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Descargar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(report)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar Reporte"
        message={`¿Estás seguro de eliminar el reporte "${reportToDelete?.title}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
      />

      {isReportModalOpen && (
        <ReportModal report={selectedReport} onClose={handleCloseModal} />
      )}
    </div>
  );
}
