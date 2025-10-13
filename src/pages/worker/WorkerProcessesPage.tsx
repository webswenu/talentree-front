import { useQuery } from '@tanstack/react-query';
import { processService } from '../../services/process.service';

export const WorkerProcessesPage = () => {
  const { data: processes, isLoading } = useQuery({
    queryKey: ['available-processes'],
    queryFn: () => processService.getAll(),
  });

  if (isLoading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Procesos Disponibles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processes?.filter((p: any) => p.status === 'active').map((process: any) => (
          <div key={process.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">{process.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{process.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Empresa</span>
                <span className="font-medium">{process.company?.name || 'No especificada'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Vacantes</span>
                <span className="font-medium">{process.vacancies}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Cierre</span>
                <span className="font-medium">
                  {new Date(process.endDate).toLocaleDateString('es-CL')}
                </span>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Postular
            </button>
          </div>
        ))}
      </div>

      {processes?.filter((p: any) => p.status === 'active').length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No hay procesos disponibles en este momento</p>
        </div>
      )}
    </div>
  );
};
