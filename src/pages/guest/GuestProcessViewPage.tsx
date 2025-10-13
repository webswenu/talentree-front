import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { processService } from '../../services/process.service';

export const GuestProcessViewPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: process, isLoading } = useQuery({
    queryKey: ['process', id],
    queryFn: () => processService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">{process?.name}</h1>
        <p className="text-gray-600">{process?.description}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Información del Proceso</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Empresa</label>
            <p className="text-gray-900">{process?.company?.name || 'No especificada'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Vacantes</label>
            <p className="text-gray-900">{process?.vacancies}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Inicio</label>
            <p className="text-gray-900">
              {process?.startDate ? new Date(process.startDate).toLocaleDateString('es-CL') : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Fin</label>
            <p className="text-gray-900">
              {process?.endDate ? new Date(process.endDate).toLocaleDateString('es-CL') : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Candidatos</h2>
        <div className="text-center py-8 text-gray-500">
          Vista limitada - Solo lectura
        </div>
      </div>
    </div>
  );
};
