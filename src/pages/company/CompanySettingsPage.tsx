import { useAuthStore } from '../../store/authStore';
import type { Company } from '../../types/company.types';

export const CompanySettingsPage = () => {
  const { user } = useAuthStore();
  const companyData = (typeof user?.company === 'object' && user?.company) ? (user.company as Company) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración de Empresa</h1>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
            Información
          </button>
          <button className="py-4 px-1 text-sm font-medium text-gray-500">Usuarios</button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">Información de la Empresa</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              defaultValue={companyData?.name || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              defaultValue={companyData?.rut || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              defaultValue={companyData?.email || ''}
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
