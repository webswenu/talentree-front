import { useState } from 'react';
import { useTests, useDeleteTest, useToggleTestActive } from '../../hooks/useTests';
import { Test, TestTypeLabels, TestTypeColors } from '../../types/test.types';
import TestModal from '../../components/admin/TestModal';

export default function TestsPage() {
  const { data: tests, isLoading } = useTests();
  const deleteMutation = useDeleteTest();
  const toggleActiveMutation = useToggleTestActive();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | undefined>();

  const handleEdit = (test: Test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este test?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = async (id: string) => {
    await toggleActiveMutation.mutateAsync(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTest(undefined);
  };

  const getTypeBadge = (type: string) => {
    const color = TestTypeColors[type as keyof typeof TestTypeColors];
    const label = TestTypeLabels[type as keyof typeof TestTypeLabels];
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando tests...</div>
      </div>
    );
  }

  const stats = {
    total: tests?.length || 0,
    active: tests?.filter(t => t.isActive).length || 0,
    inactive: tests?.filter(t => !t.isActive).length || 0,
    withReview: tests?.filter(t => t.requiresManualReview).length || 0,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tests Psicométricos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Test
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Activos</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Inactivos</p>
          <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Con Revisión Manual</p>
          <p className="text-2xl font-bold text-orange-600">{stats.withReview}</p>
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
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preguntas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duración
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puntaje Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tests?.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{test.name}</div>
                  {test.description && (
                    <div className="text-sm text-gray-500">{test.description.substring(0, 50)}...</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTypeBadge(test.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.questions?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.duration ? `${test.duration} min` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.passingScore || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {test.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  {test.requiresManualReview && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      Rev. Manual
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(test)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(test.id)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    {test.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleDelete(test.id)}
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

      {isModalOpen && (
        <TestModal
          test={selectedTest}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
