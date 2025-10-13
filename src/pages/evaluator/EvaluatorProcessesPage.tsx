import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { processService } from '../../services/process.service';

export const EvaluatorProcessesPage = () => {
  const navigate = useNavigate();

  const { data: processes, isLoading } = useQuery({
    queryKey: ['evaluator-processes'],
    queryFn: () => processService.getAll(),
  });

  if (isLoading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Procesos Asignados</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {processes?.map((process: any) => (
          <div
            key={process.id}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/evaluador/procesos/${process.id}`)}
          >
            <h3 className="text-lg font-semibold mb-2">{process.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{process.description}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Pendientes de revisar</span>
                <span className="font-medium text-orange-600">0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Revisados</span>
                <span className="font-medium text-green-600">0</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
