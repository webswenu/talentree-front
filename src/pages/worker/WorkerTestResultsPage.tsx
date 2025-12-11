import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTestResponse, useTestResponsesByWorkerProcess } from "../../hooks/useTestResponses";

export const WorkerTestResultsPage = () => {
    const { testResponseId } = useParams<{ testResponseId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const processIdFromQuery = searchParams.get("processId");

    const { data: testResponse, isLoading } = useTestResponse(
        testResponseId || ""
    );

    // Get workerProcessId to fetch all test responses for this process
    const workerProcessId = processIdFromQuery || testResponse?.workerProcess?.id;
    const { data: allTestResponses } = useTestResponsesByWorkerProcess(
        workerProcessId || ""
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    if (!testResponse) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Test no encontrado
                    </h2>
                    <button
                        onClick={() => navigate("/trabajador/procesos")}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver a Mis Procesos
                    </button>
                </div>
            </div>
        );
    }

    // Calculate remaining tests
    const totalTests = allTestResponses?.length || 0;
    const completedTests = allTestResponses?.filter(tr => tr.isCompleted).length || 0;
    const remainingTests = totalTests - completedTests;
    const allTestsCompleted = remainingTests === 0;

    // Get incomplete test responses for navigation
    const incompleteTests = allTestResponses?.filter(tr => !tr.isCompleted) || [];

    // Workers no pueden ver los resultados detallados, solo confirmación de finalización
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="bg-white rounded-lg shadow p-8 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {allTestsCompleted ? "¡Proceso Completado!" : "¡Test Completado!"}
                    </h2>
                    <p className="text-gray-600">
                        Has completado exitosamente el test{" "}
                        <span className="font-semibold">
                            {testResponse.fixedTest?.name || testResponse.test?.name || "Test"}
                        </span>
                    </p>
                </div>

                {testResponse.completedAt && (
                    <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">
                            Completado el{" "}
                            {new Date(testResponse.completedAt).toLocaleString(
                                "es-CL",
                                {
                                    dateStyle: "long",
                                    timeStyle: "short",
                                }
                            )}
                        </p>
                    </div>
                )}

                {allTestsCompleted ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            Tus respuestas están siendo evaluadas por nuestro equipo.
                            Serás notificado cuando los resultados del proceso de selección estén disponibles.
                        </p>
                    </div>
                ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-orange-800 font-semibold">
                            ¡Excelente! Has completado {completedTests} de {totalTests} tests.
                        </p>
                        <p className="text-sm text-orange-700">
                            Te {remainingTests === 1 ? "queda" : "quedan"} {remainingTests} test{remainingTests > 1 ? "s" : ""} por responder.
                            ¡Continúa para completar el proceso de selección!
                        </p>
                    </div>
                )}

                <div className="flex gap-3 justify-center flex-wrap">
                    {!allTestsCompleted && incompleteTests.length > 0 && (
                        <button
                            onClick={() => {
                                // Navigate to the first incomplete test
                                navigate(`/trabajador/test/${incompleteTests[0].id}`);
                            }}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                            Continuar con el Siguiente Test
                        </button>
                    )}
                    <button
                        onClick={() => {
                            // Use query param first, then try from testResponse, fallback to postulaciones
                            const processId = processIdFromQuery || testResponse.workerProcess?.id;
                            if (processId) {
                                navigate(`/trabajador/postulaciones/${processId}`);
                            } else {
                                navigate("/trabajador/postulaciones");
                            }
                        }}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                            allTestsCompleted
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Volver al Proceso
                    </button>
                </div>
            </div>
        </div>
    );
};
