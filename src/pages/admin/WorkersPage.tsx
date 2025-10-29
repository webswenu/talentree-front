import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkers, useDeleteWorker } from '../../hooks/useWorkers';
import { Worker } from '../../types/worker.types';
import { WorkerFilters } from '../../services/workers.service';
import WorkerModal from '../../components/admin/WorkerModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Pagination } from '../../components/common/Pagination';
import { useAuthStore } from '../../store/authStore';
import { Permission, hasPermission } from '../../utils/permissions';
import { UserRole } from '../../types/user.types';

export default function WorkersPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filters: WorkerFilters = {
    page,
    limit,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data: workersData, isLoading } = useWorkers(filters);
  const deleteMutation = useDeleteWorker();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  const handleDelete = (worker: Worker) => {
    setWorkerToDelete(worker);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!workerToDelete) return;

    try {
      await deleteMutation.mutateAsync(workerToDelete.id);
      setIsConfirmDeleteOpen(false);
      setWorkerToDelete(null);
    } catch (err) {
      // Error ya manejado por el hook
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setWorkerToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWorker(undefined);
  };

  // Permisos según rol
  const canCreate = user && hasPermission(user.role, Permission.WORKERS_CREATE);
  const canEdit = user && hasPermission(user.role, Permission.WORKERS_EDIT);
  const canDelete = user && hasPermission(user.role, Permission.WORKERS_DELETE);

  // Título según rol
  const pageTitle = user?.role === UserRole.ADMIN_TALENTREE ? 'Trabajadores' : 'Candidatos';

  // Ruta base según rol
  const getBaseRoute = () => {
    switch (user?.role) {
      case UserRole.ADMIN_TALENTREE:
        return '/admin/trabajadores';
      case UserRole.COMPANY:
        return '/empresa/trabajadores';
      case UserRole.EVALUATOR:
        return '/evaluador/trabajadores';
      case UserRole.GUEST:
        return '/invitado/trabajadores';
      default:
        return '/admin/trabajadores';
    }
  };

  const baseRoute = getBaseRoute();

  const handleViewDetail = (workerId: string) => {
    navigate(`${baseRoute}/${workerId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando {pageTitle.toLowerCase()}...</div>
      </div>
    );
  }

  const workers = workersData?.data || [];
  const meta = workersData?.meta;

  const stats = {
    total: meta?.total || 0,
    withUser: workers.filter(w => w.user).length,
    withCV: workers.filter(w => w.cvUrl).length,
    withSkills: workers.filter(w => w.skills && w.skills.length > 0).length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nuevo Trabajador
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre, RUT, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>
        </div>
        {(search || statusFilter) && (
          <div className="mt-3">
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Con Usuario</p>
          <p className="text-2xl font-bold text-blue-600">{stats.withUser}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Con CV</p>
          <p className="text-2xl font-bold text-green-600">{stats.withCV}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Con Habilidades</p>
          <p className="text-2xl font-bold text-purple-600">{stats.withSkills}</p>
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
                RUT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ciudad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Habilidades
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workers?.map((worker) => (
              <tr key={worker.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {worker.firstName} {worker.lastName}
                      </div>
                      {worker.education && (
                        <div className="text-sm text-gray-500">{worker.education}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {worker.rut}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {worker.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {worker.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {worker.city || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {worker.skills && worker.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {worker.skills.slice(0, 2).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {worker.skills.length > 2 && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          +{worker.skills.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewDetail(worker.id)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Ver Detalle
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(worker)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(worker)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mostrar mensaje si no hay resultados */}
        {!isLoading && workers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {search || statusFilter
              ? 'No se encontraron trabajadores con los filtros aplicados'
              : 'No hay trabajadores registrados'}
          </div>
        )}
      </div>

      {/* Paginación */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {canCreate && isModalOpen && (
        <WorkerModal
          worker={selectedWorker}
          onClose={handleCloseModal}
        />
      )}

      {canDelete && (
        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Eliminar Trabajador"
          message={`¿Estás seguro de eliminar al trabajador "${workerToDelete?.firstName} ${workerToDelete?.lastName}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
