import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFixedTests } from "../../hooks/useTests";
import { FixedTest } from "../../types/test.types";

export default function TestsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: tests, isLoading } = useFixedTests();
    const [searchTerm, setSearchTerm] = useState("");

    // Detect if in admin or evaluador
    const baseRoute = location.pathname.includes("/evaluador") ? "/evaluador" : "/admin";

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando tests...</div>
            </div>
        );
    }

    const filteredTests = tests?.filter((test) =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: tests?.length || 0,
        active: tests?.filter((t) => t.isActive).length || 0,
        inactive: tests?.filter((t) => !t.isActive).length || 0,
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Tests Psicométricos
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Catálogo de tests estandarizados disponibles para evaluación
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total de Tests</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {stats.total}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Activos</p>
                    <p className="text-2xl font-bold text-green-600">
                        {stats.active}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Inactivos</p>
                    <p className="text-2xl font-bold text-gray-600">
                        {stats.inactive}
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar tests por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Tests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests?.map((test: FixedTest) => (
                    <div
                        key={test.id}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`${baseRoute}/tests/${test.id}`)}
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {test.name}
                                    </h3>
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                        {test.code}
                                    </span>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        test.isActive
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {test.isActive ? "Activo" : "Inactivo"}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                {test.description}
                            </p>

                            {/* Info */}
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-500">
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Duración: {test.duration ? `${test.duration} min` : "No especificada"}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Test estandarizado
                                </div>
                            </div>

                            {/* View Button */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/tests/${test.id}`);
                                    }}
                                    className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Ver detalles →
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredTests?.length === 0 && (
                <div className="text-center py-12">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No se encontraron tests
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Intenta con otros términos de búsqueda
                    </p>
                </div>
            )}
        </div>
    );
}
