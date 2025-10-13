import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { testResponseService } from '../../services/testResponse.service';

export const EvaluatorTestReviewPage = () => {
  const { testResponseId } = useParams<{ testResponseId: string }>();

  const { data: testResponse, isLoading } = useQuery({
    queryKey: ['test-response', testResponseId],
    queryFn: () => testResponseService.getById(testResponseId!),
    enabled: !!testResponseId,
  });

  if (isLoading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div>
            <h1 className="text-xl font-bold">Revisión de Test</h1>
            <p className="text-gray-600">Candidato: {testResponse?.worker?.firstName} {testResponse?.worker?.lastName}</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Guardar Revisión
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Respuestas del Test</h2>
          <div className="space-y-4">
            <p className="text-gray-600">Las respuestas del test aparecerán aquí...</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Evaluación</h2>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={6}
            placeholder="Ingrese sus comentarios y evaluación..."
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puntaje
            </label>
            <input
              type="number"
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0-100"
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
