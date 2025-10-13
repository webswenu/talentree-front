import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { processService } from '../../services/process.service';

export const CompanyProcessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: process, isLoading } = useQuery({
    queryKey: ['process', id],
    queryFn: () => processService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/empresa/procesos')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Volver a procesos
          </button>
          <h1 className="text-2xl font-bold">{process?.name}</h1>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
            Información
          </button>
          <button className="py-4 px-1 text-sm font-medium text-gray-500">Candidatos</button>
          <button className="py-4 px-1 text-sm font-medium text-gray-500">Aprobados</button>
          <button className="py-4 px-1 text-sm font-medium text-gray-500">Reportes</button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Información del Proceso</h2>
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="text-sm font-medium text-gray-500">Vacantes</label>
            <p className="text-gray-900">{process?.vacancies}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Estado</label>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              process?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {process?.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Postulantes</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">En Evaluación</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Aprobados</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
      </div>
    </div>
  );
};
