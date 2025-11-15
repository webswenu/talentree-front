import { useAuthStore } from "../../store/authStore";
import { useWorkerProcesses } from "../../hooks/useWorkers";
import { useNavigate } from "react-router-dom";
import { TestResponse } from "../../types/test-response.types";

interface TestResultRow {
    testResponseId: string;
    testName: string;
    processName: string;
    companyName: string;
    completedAt: Date | null;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
}

export const WorkerTestResultsListPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const workerId = user?.worker?.id;

    const { data: applications, isLoading } = useWorkerProcesses(
        workerId || ""
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando resultados...</div>
            </div>
        );
    }

    const completedTests: TestResultRow[] =
        applications
            ?.flatMap(
                (app) =>
                    app.testResponses
                        ?.filter((tr: TestResponse) => tr.isCompleted)
                        .map((tr: TestResponse) => ({
                            testResponseId: tr.id,
                            testName: tr.test?.name || "Test sin nombre",
                            processName: app.process?.name || "Proceso",
                            companyName:
                                app.process?.company?.name || "Empresa",
                            completedAt: tr.completedAt
                                ? new Date(tr.completedAt)
                                : null,
                            score: tr.score || 0,
                            maxScore: tr.maxScore || 0,
                            percentage: tr.maxScore
                                ? Math.round(
                                      ((tr.score || 0) / tr.maxScore) * 100
                                  )
                                : 0,
                            passed: tr.passed || false,
                        })) || []
            )
            .sort((a, b) => {
                if (!a.completedAt) return 1;
                if (!b.completedAt) return -1;
                return b.completedAt.getTime() - a.completedAt.getTime();
            }) || [];

    const stats = {
        total: completedTests.length,
        aprobados: completedTests.filter((test) => test.passed).length,
        noAprobados: completedTests.filter((test) => !test.passed).length,
        promedio:
            completedTests.length > 0
                ? Math.round(
                      completedTests.reduce(
                          (sum, test) => sum + test.percentage,
                          0
                      ) / completedTests.length
                  )
                : 0,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Mis Resultados
                </h1>
                <p className="text-gray-600 mt-1">
                    Historial completo de tests realizados
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-500 text-sm mb-1">
                        Tests Completados
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                        {stats.total}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-500 text-sm mb-1">Aprobados</p>
                    <p className="text-3xl font-bold text-green-600">
                        {stats.aprobados}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-500 text-sm mb-1">No Aprobados</p>
                    <p className="text-3xl font-bold text-red-600">
                        {stats.noAprobados}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-500 text-sm mb-1">Promedio</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {stats.promedio}%
                    </p>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {completedTests.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Test
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Proceso
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empresa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Completado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Puntaje
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resultado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {completedTests.map((test) => (
                                <tr
                                    key={test.testResponseId}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {test.testName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {test.processName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {test.companyName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {test.completedAt
                                                ? test.completedAt.toLocaleDateString(
                                                      "es-CL",
                                                      {
                                                          day: "2-digit",
                                                          month: "2-digit",
                                                          year: "numeric",
                                                      }
                                                  )
                                                : "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {test.score} / {test.maxScore}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {test.percentage}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                test.passed
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {test.passed
                                                ? "✓ Aprobado"
                                                : "✗ No Aprobado"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/trabajador/resultados/${test.testResponseId}`
                                                )
                                            }
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p className="mt-4 text-gray-500 text-lg">
                            No has completado ningún test todavía
                        </p>
                        <p className="mt-2 text-gray-400 text-sm">
                            Completa tests de tus postulaciones activas para ver
                            tus resultados aquí
                        </p>
                        <button
                            onClick={() =>
                                navigate("/trabajador/postulaciones")
                            }
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ver Mis Postulaciones
                        </button>
                    </div>
                )}
            </div>

            {/* Información adicional */}
            {completedTests.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg
                            className="h-5 w-5 text-blue-600 mt-0.5 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-blue-800">
                                Sobre tus resultados
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    Los resultados mostrados corresponden a
                                    todos los tests que has completado en tus
                                    postulaciones activas. Haz clic en "Ver
                                    Detalles" para revisar tus respuestas y
                                    comentarios de los evaluadores.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
