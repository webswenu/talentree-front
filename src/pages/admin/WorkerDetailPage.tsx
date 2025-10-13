import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workerService } from '../../services/worker.service';

export const WorkerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: worker, isLoading } = useQuery({
    queryKey: ['worker', id],
    queryFn: () => workerService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/trabajadores')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Volver a trabajadores
          </button>
          <h1 className="text-2xl font-bold">
            {worker?.firstName} {worker?.lastName}
          </h1>
          <p className="text-gray-600">{worker?.email}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Editar Trabajador
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
            Información
          </button>
          <button className="py-4 px-1 text-sm font-medium text-gray-500">Procesos</button>
          <button className="py-4 px-1 text-sm font-medium text-gray-500">Tests</button>
          <button className="py-4 px-1 text-sm font-medium text-gray-500">Historial</button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Datos Personales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">RUT</label>
            <p className="text-gray-900">{worker?.rut}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Teléfono</label>
            <p className="text-gray-900">{worker?.phone || 'No especificado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
            <p className="text-gray-900">
              {worker?.birthDate ? new Date(worker.birthDate).toLocaleDateString('es-CL') : 'No especificada'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Estado</label>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              worker?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {worker?.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
