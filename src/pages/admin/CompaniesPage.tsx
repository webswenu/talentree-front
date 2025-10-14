import { useState, useMemo } from 'react';
import { useCompanies, useDeleteCompany } from '../../hooks/useCompanies';
import { Company } from '../../types/company.types';
import { CompanyModal } from '../../components/admin/CompanyModal';
import { useNavigate } from 'react-router-dom';

export const CompaniesPage = () => {
  const { data: companies, isLoading, error } = useCompanies();
  const deleteMutation = useDeleteCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const navigate = useNavigate();

  // 🔍 Estados de filtro
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState('');
  const [sortByDate, setSortByDate] = useState('');

  // 📊 Manejo de modales
  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta empresa?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar la empresa');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  // 🧮 Aplicar filtros sobre las empresas
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];

    let filtered = companies;

    if (industry) {
      filtered = filtered.filter((c) => c.industry?.toLowerCase() === industry.toLowerCase());
    }

    if (status) {
      const isActive = status === 'Activa';
      filtered = filtered.filter((c) => c.isActive === isActive);
    }

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.user?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortByDate === 'Recientes') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortByDate === 'Antiguos') {
      filtered = [...filtered].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return filtered;
  }, [companies, search, industry, status, sortByDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error al cargar las empresas
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresa</h1>
          <p className="text-gray-600 mt-1">Gestión de empresas registradas</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg shadow transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Agregar Empresa
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center bg-white shadow-sm rounded-xl p-4">
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400"
        >
          <option value="">Industria</option>
          {[...new Set(companies?.map((c) => c.industry).filter(Boolean))].map((ind) => (
            <option key={ind} value={ind!}>
              {ind}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400"
        >
          <option value="">Estado</option>
          <option value="Activa">Activa</option>
          <option value="Inactiva">Inactiva</option>
        </select>

        <select
          value={sortByDate}
          onChange={(e) => setSortByDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400"
        >
          <option value="">Fecha</option>
          <option value="Recientes">Más recientes</option>
          <option value="Antiguos">Más antiguos</option>
        </select>

        <button
          onClick={() => {
            setIndustry('');
            setStatus('');
            setSearch('');
            setSortByDate('');
          }}
          className="text-sm text-gray-600 hover:text-gray-900 transition"
        >
          Limpiar filtros
        </button>

        <div className="flex-1 text-right">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-60 focus:ring-2 focus:ring-teal-400"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-sm text-gray-500 border-b">
              <th className="text-left py-3 px-4 font-medium">Acción</th>
              <th className="text-left py-3 px-4 font-medium">Nombre</th>
              <th className="text-left py-3 px-4 font-medium">Industria</th>
              <th className="text-left py-3 px-4 font-medium">Ciudad</th>
              <th className="text-left py-3 px-4 font-medium">Correo</th>
              <th className="text-left py-3 px-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company, index) => (
              <tr
                key={company.id}
                className={`${
                  index % 2 === 0 ? 'bg-teal-50/30' : 'bg-white'
                } hover:bg-teal-50 transition`}
              >
                <td className="py-3 px-4">
  <button
    onClick={() => navigate(`/admin/empresas/${company.id}`)}
    className="text-teal-600 hover:text-teal-800 transition"
  >
    ✏️
  </button>
</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  {company.name}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{company.industry || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{company.city || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{company.user?.email || '-'}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      company.isActive
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {company.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No se encontraron empresas con los filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && <CompanyModal company={selectedCompany} onClose={handleCloseModal} />}
    </div>
  );
};
