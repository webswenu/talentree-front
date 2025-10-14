import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useUsers } from "../../hooks/useUsers";
import { useUpdateCompany } from "../../hooks/useCompanies";
import { companyService } from "../../services/company.service";
import { UserRole } from "../../types/user.types";

export const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: users } = useUsers();
  const updateMutation = useUpdateCompany();

  // 📦 Obtener datos de la empresa
  const { data: company, isLoading, error } = useQuery({
    queryKey: ["company", id],
    queryFn: () => companyService.getById(id!),
    enabled: !!id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    industry: "",
    address: "",
    city: "",
    country: "Chile",
    userId: "",
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        rut: company.rut || "",
        industry: company.industry || "",
        address: company.address || "",
        city: company.city || "",
        country: company.country || "Chile",
        userId: company.user?.id || "",
      });
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const { userId, rut, ...updateData } = formData;
      await updateMutation.mutateAsync({ id: id!, data: updateData });
      setIsEditing(false);
    } catch (err) {
      alert("Error al guardar los cambios");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (company) {
      setFormData({
        name: company.name,
        rut: company.rut,
        industry: company.industry || "",
        address: company.address || "",
        city: company.city || "",
        country: company.country || "Chile",
        userId: company.user?.id || "",
      });
    }
  };

  const availableUsers = users?.filter((u) => u.role === UserRole.COMPANY) || [];

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Cargando empresa...</p>
      </div>
    );

  if (error || !company)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error al cargar la empresa</p>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/admin/empresas")}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
          >
            ← Volver a empresas
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-gray-600">{company.industry || "Sin industria definida"}</p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-teal-600 hover:text-teal-800 text-sm font-medium"
          >
            ✏️ Editar
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-teal-500 hover:bg-teal-600 text-white text-sm px-4 py-1.5 rounded-lg shadow"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900 text-sm"
              disabled={updateMutation.isPending}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* INFORMACIÓN EMPRESA */}
      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Información Empresa
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`input w-full ${
                !isEditing ? "bg-gray-50 text-gray-600 cursor-default" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RUT *
            </label>
            <input
              type="text"
              name="rut"
              value={formData.rut}
              onChange={handleChange}
              readOnly
              className="input w-full bg-gray-50 text-gray-600 cursor-default"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industria
            </label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`input w-full ${
                !isEditing ? "bg-gray-50 text-gray-600 cursor-default" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`input w-full ${
                !isEditing ? "bg-gray-50 text-gray-600 cursor-default" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`input w-full ${
                !isEditing ? "bg-gray-50 text-gray-600 cursor-default" : ""
              }`}
            />
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario Representante *
              </label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="input w-full"
                required
              >
                <option value="">Seleccionar usuario...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`input w-full ${
                !isEditing ? "bg-gray-50 text-gray-600 cursor-default" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* SECCIONES INFERIORES */}
      <details className="bg-white shadow rounded-xl">
        <summary className="cursor-pointer p-4 font-medium text-gray-700 hover:text-teal-600">
          Procesos Activos
        </summary>
        <div className="p-4 text-gray-500">No hay procesos activos</div>
      </details>

      <details className="bg-white shadow rounded-xl">
        <summary className="cursor-pointer p-4 font-medium text-gray-700 hover:text-teal-600">
          Procesos Terminados
        </summary>
        <div className="p-4 text-gray-500">No hay procesos terminados</div>
      </details>
    </div>
  );
};
