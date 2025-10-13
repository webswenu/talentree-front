import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { testService } from '../../services/test.service';

export const TestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: test, isLoading } = useQuery({
    queryKey: ['test', id],
    queryFn: () => testService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/tests')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Volver a tests
          </button>
          <h1 className="text-2xl font-bold">{test?.name || 'Test'}</h1>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Editar Test
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
            Información
          </button>
          <button className="py-4 px-1 text-sm font-medium text-gray-500">Preguntas</button>
          <button className="py-4 px-1 text-sm font-medium text-gray-500">Scoring</button>
          <button className="py-4 px-1 text-sm font-medium text-gray-500">Vista Previa</button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Información del Test</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nombre</label>
            <p className="text-gray-900">{test?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Tipo</label>
            <p className="text-gray-900">{test?.type || 'Psicométrico'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Duración</label>
            <p className="text-gray-900">{test?.duration || 60} minutos</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Preguntas</label>
            <p className="text-gray-900">{test?.questions?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
