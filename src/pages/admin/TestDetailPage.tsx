import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../services/api.service";
import { FixedTest } from "../../types/test.types";

type TabType = "info" | "dimensions";

export const TestDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabType>("info");

    // Detect if in admin or evaluador
    const baseRoute = location.pathname.includes("/evaluador") ? "/evaluador" : "/admin";

    const { data: test, isLoading } = useQuery({
        queryKey: ["fixed-test", id],
        queryFn: async () => {
            const response = await apiService.get<FixedTest>(
                `/tests/fixed/${id}`
            );
            return response.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-gray-500">Test no encontrado</p>
                </div>
            </div>
        );
    }

    const dimensions = (test.configuration?.dimensions as Array<{ code: string; name: string; description?: string; questionCount?: number }> | undefined) || [];
    const instructions = (test.configuration?.instructions as string[] | undefined) || [];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(`${baseRoute}/tests`)}
                    className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center"
                >
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Volver a tests
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {test.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {test.code}
                            </span>
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
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("info")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "info"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Información General
                    </button>
                    <button
                        onClick={() => setActiveTab("dimensions")}
                        className={`py-4 px-1 text-sm font-medium border-b-2 ${
                            activeTab === "dimensions"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        Dimensiones
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "info" && (
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">
                            Información Básica
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Nombre
                                </label>
                                <p className="text-gray-900">{test.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Código
                                </label>
                                <p className="text-gray-900">{test.code}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Duración
                                </label>
                                <p className="text-gray-900">
                                    {test.duration
                                        ? `${test.duration} minutos`
                                        : "No especificada"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Estado
                                </label>
                                <p className="text-gray-900">
                                    {test.isActive ? "Activo" : "Inactivo"}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Descripción
                                </label>
                                <p className="text-gray-900">
                                    {test.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    {instructions.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900">
                                Instrucciones
                            </h2>
                            <ul className="list-disc list-inside space-y-2">
                                {instructions.map(
                                    (instruction: string, index: number) => (
                                        <li
                                            key={index}
                                            className="text-gray-700"
                                        >
                                            {instruction}
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "dimensions" && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">
                        Dimensiones Evaluadas
                    </h2>
                    {dimensions.length > 0 ? (
                        <div className="space-y-4">
                            {dimensions.map((dim, index: number) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                                    {dim.code}
                                                </span>
                                                <h3 className="font-medium text-gray-900">
                                                    {dim.name}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {dim.description}
                                            </p>
                                            {dim.questionCount && (
                                                <p className="text-xs text-gray-500">
                                                    {dim.questionCount} preguntas
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            No hay dimensiones configuradas
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
