import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { processService } from '../../services/process.service';

export const CompanyProcessesPage = () => {
  const navigate = useNavigate();

  const { data: processes, isLoading } = useQuery({
    queryKey: ['company-processes'],
    queryFn: () => processService.getAll(),
  });

  if (isLoading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Procesos de Selección</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {processes?.map((process: any) => (
          <div
            key={process.id}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/empresa/procesos/${process.id}`)}
          >
            <h3 className="text-lg font-semibold mb-2">{process.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{process.description}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                process.status === 'active' ? 'bg-green-100 text-green-800' :
                process.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {process.status === 'active' && 'Activo'}
                {process.status === 'draft' && 'Borrador'}
                {process.status === 'closed' && 'Cerrado'}
              </span>
              <span className="text-sm text-gray-500">
                {process.vacancies} vacantes
              </span>
            </div>
          </div>
        ))}
      </div>

      {processes?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No hay procesos de selección disponibles</p>
        </div>
      )}
    </div>
  );
};
