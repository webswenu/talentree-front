import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { workersService } from "../../services/workers.service";

export const CompanyWorkerDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: worker, isLoading } = useQuery({
        queryKey: ["worker", id],
        queryFn: () => workersService.getById(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">
                    Cargando información del candidato...
                </div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Candidato no encontrado</p>
                <button
                    onClick={() => navigate("/empresa/trabajadores")}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                >
                    Volver a candidatos
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
                    >
                        ← Volver
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {worker.firstName} {worker.lastName}
                    </h1>
                    <p className="text-gray-600 mt-1">{worker.email}</p>
                </div>
                {worker.user?.isActive ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                    </span>
                ) : (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactivo
                    </span>
                )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium text-gray-600">
                        Postulaciones
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {worker.applications?.length || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium text-gray-600">
                        Tests Realizados
                    </p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                        {worker.testResponses?.length || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium text-gray-600">Ciudad</p>
                    <p className="text-xl font-semibold text-gray-900 mt-2">
                        {worker.city || "No especificada"}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium text-gray-600">CV</p>
                    <div className="mt-2">
                        {worker.cvUrl ? (
                            <a
                                href={worker.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                            >
                                <span>📄</span>
                                Ver CV
                            </a>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                No disponible
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Información Personal */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-6">
                    Información Personal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            RUT
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.rut || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Email
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.email || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Teléfono
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.phone || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Fecha de Nacimiento
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.birthDate
                                ? new Date(worker.birthDate).toLocaleDateString(
                                      "es-CL"
                                  )
                                : "-"}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">
                            Dirección
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.address || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Ciudad
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.city || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">
                            Región
                        </label>
                        <p className="text-gray-900 mt-1">
                            {worker.region || "-"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Educación y Experiencia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Educación</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {worker.education || "No especificada"}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Experiencia</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {worker.experience || "No especificada"}
                    </p>
                </div>
            </div>

            {/* Habilidades */}
            {worker.skills && worker.skills.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Habilidades</h2>
                    <div className="flex flex-wrap gap-2">
                        {worker.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Procesos */}
            {worker.applications && worker.applications.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-6">
                        Historial de Postulaciones
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Proceso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Fecha de Aplicación
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Última Actualización
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {worker.applications.map((application) => (
                                    <tr
                                        key={application.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {application.process?.name ||
                                                    "N/A"}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {application.process?.code ||
                                                    ""}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {application.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {application.appliedAt
                                                ? new Date(
                                                      application.appliedAt
                                                  ).toLocaleDateString("es-CL")
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {application.updatedAt
                                                ? new Date(
                                                      application.updatedAt
                                                  ).toLocaleDateString("es-CL")
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
