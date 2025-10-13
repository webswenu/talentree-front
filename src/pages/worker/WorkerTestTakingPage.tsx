import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { testResponseService } from '../../services/testResponse.service';
import { useState } from 'react';

export const WorkerTestTakingPage = () => {
  const { testResponseId } = useParams<{ testResponseId: string }>();
  const [currentQuestion] = useState(0);

  const { data: testResponse, isLoading } = useQuery({
    queryKey: ['test-response', testResponseId],
    queryFn: () => testResponseService.getById(testResponseId!),
    enabled: !!testResponseId,
  });

  if (isLoading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{testResponse?.test?.name || 'Test'}</h1>
            <p className="text-sm text-gray-600">
              Pregunta {currentQuestion + 1} de {testResponse?.test?.questions?.length || 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Tiempo restante</p>
            <p className="text-lg font-semibold">45:00</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / (testResponse?.test?.questions?.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <h2 className="text-lg font-medium">
            {currentQuestion + 1}. Pregunta de ejemplo
          </h2>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((option) => (
              <label
                key={option}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="answer"
                  className="mr-3"
                />
                <span>Opción {option}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6">
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={currentQuestion === 0}
            >
              Anterior
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {currentQuestion === (testResponse?.test?.questions?.length || 1) - 1
                ? 'Finalizar'
                : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
