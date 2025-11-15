import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { companyService } from "../../services/company.service";

export const CompanyDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Detectar si estamos en admin o evaluador
    const baseRoute = location.pathname.includes("/evaluador") ? "/evaluador" : "/admin";

    const {
        data: company,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["company", id],
        queryFn: () => companyService.getById(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Cargando...</div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-600">Error al cargar la empresa</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate(`${baseRoute}/empresas`)}
                        className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
                    >
                        ← Volver a empresas
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {company.name}
                    </h1>
                    <p className="text-gray-600">{company.businessName}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Editar Empresa
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
                        Información
                    </button>
                    <button
                        onClick={() => navigate(`${baseRoute}/procesos?company=${id}`)}
                        className="border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    >
                        Procesos
                    </button>
                </nav>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Información General
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            RUT
                        </label>
                        <p className="text-gray-900">{company.rut}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Email
                        </label>
                        <p className="text-gray-900">{company.email}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Teléfono
                        </label>
                        <p className="text-gray-900">
                            {company.phone || "No especificado"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Estado
                        </label>
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                company.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                        >
                            {company.isActive ? "Activa" : "Inactiva"}
                        </span>
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">
                            Dirección
                        </label>
                        <p className="text-gray-900">
                            {company.address || "No especificada"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Person */}
            {company.contactPerson && (
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Persona de Contacto
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Nombre
                            </label>
                            <p className="text-gray-900">
                                {company.contactPerson.name}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Email
                            </label>
                            <p className="text-gray-900">
                                {company.contactPerson.email}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Teléfono
                            </label>
                            <p className="text-gray-900">
                                {company.contactPerson.phone}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">
                        Procesos Activos
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">
                        Total Procesos
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">
                        Usuarios
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
            </div>
        </div>
    );
};
