import { useState } from "react";
import { useFixedTests } from "../../hooks/useTests";
import { useAddFixedTest, useRemoveFixedTest } from "../../hooks/useProcesses";

interface AssignTestsModalProps {
    isOpen: boolean;
    onClose: () => void;
    processId: string;
    assignedTestIds: string[];
}

export const AssignTestsModal = ({
    isOpen,
    onClose,
    processId,
    assignedTestIds,
}: AssignTestsModalProps) => {
    const { data: tests, isLoading } = useFixedTests();
    const addTestMutation = useAddFixedTest();
    const removeTestMutation = useRemoveFixedTest();
    const [selectedTests, setSelectedTests] = useState<Set<string>>(
        new Set(assignedTestIds)
    );

    if (!isOpen) return null;

    const handleToggleTest = async (testId: string) => {
        const wasSelected = selectedTests.has(testId);

        try {
            if (wasSelected) {
                await removeTestMutation.mutateAsync({ processId, fixedTestId: testId });
                const newSelected = new Set(selectedTests);
                newSelected.delete(testId);
                setSelectedTests(newSelected);
            } else {
                await addTestMutation.mutateAsync({ processId, fixedTestId: testId });
                setSelectedTests(new Set([...selectedTests, testId]));
            }
        } catch (error) {
            console.error("Error toggling test:", error);
        }
    };

    const handleClose = () => {
        setSelectedTests(new Set(assignedTestIds));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Asignar Tests al Proceso
                            </h3>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Seleccione los tests que desea asignar a este proceso. Los tests seleccionados aparecerán marcados.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-gray-500">Cargando tests...</div>
                            </div>
                        ) : tests && tests.length > 0 ? (
                            <div className="space-y-2">
                                {tests.map((test: any) => {
                                    const isSelected = selectedTests.has(test.id);
                                    const isProcessing =
                                        addTestMutation.isPending || removeTestMutation.isPending;

                                    return (
                                        <div
                                            key={test.id}
                                            className={`border rounded-lg p-4 transition-all cursor-pointer ${
                                                isSelected
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                                            onClick={() => !isProcessing && handleToggleTest(test.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Checkbox */}
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <div
                                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                            isSelected
                                                                ? "bg-blue-600 border-blue-600"
                                                                : "border-gray-300 bg-white"
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <svg
                                                                className="w-3 h-3 text-white"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={3}
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Test Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900">
                                                        {test.name}
                                                    </h4>
                                                    {test.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {test.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            </svg>
                                                            {test.questions?.length || 0} preguntas
                                                        </span>
                                                        {test.duration && (
                                                            <span className="flex items-center gap-1">
                                                                <svg
                                                                    className="w-4 h-4"
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
                                                                {test.duration} min
                                                            </span>
                                                        )}
                                                        {test.isActive !== undefined && (
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full text-xs ${
                                                                    test.isActive
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-gray-100 text-gray-600"
                                                                }`}
                                                            >
                                                                {test.isActive ? "Activo" : "Inactivo"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <svg
                                    className="w-12 h-12 text-gray-400 mb-4"
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
                                <p className="text-gray-500 text-center">
                                    No hay tests disponibles para asignar
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {selectedTests.size} test{selectedTests.size !== 1 ? "s" : ""}{" "}
                                seleccionado{selectedTests.size !== 1 ? "s" : ""}
                            </div>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
