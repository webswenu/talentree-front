import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { processesService } from "../../services/processes.service";
import {
    VideoQuestion,
    CreateProcessVideoRequirementDto,
} from "../../types/process.types";

interface VideoRequirementsConfigProps {
    processId: string;
    readOnly?: boolean;
}

type ModalType = "success" | "error" | "confirm" | null;

interface ModalState {
    type: ModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
}

export const VideoRequirementsConfig = ({
    processId,
    readOnly = false,
}: VideoRequirementsConfigProps) => {
    const queryClient = useQueryClient();

    const [isRequired, setIsRequired] = useState(false);
    const [maxDuration, setMaxDuration] = useState<number>(180); // 3 minutes default
    const [instructions, setInstructions] = useState("");
    const [questions, setQuestions] = useState<VideoQuestion[]>([]);
    const [newQuestion, setNewQuestion] = useState({
        question: "",
        displayAtSecond: 0,
    });
    const [modal, setModal] = useState<ModalState>({
        type: null,
        title: "",
        message: "",
    });

    // Fetch existing config
    const { data: existingConfig, isLoading } = useQuery({
        queryKey: ["process-video-requirements", processId],
        queryFn: () => processesService.getVideoRequirement(processId),
    });

    // Load existing config when it changes
    useEffect(() => {
        if (existingConfig) {
            setIsRequired(existingConfig.isRequired);
            setMaxDuration(existingConfig.maxDuration || 180);
            setInstructions(existingConfig.instructions || "");
            setQuestions(existingConfig.questions || []);
        }
    }, [existingConfig]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateProcessVideoRequirementDto) =>
            processesService.createVideoRequirement(processId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["process-video-requirements", processId],
            });
            setModal({
                type: "success",
                title: "¡Configuración creada!",
                message: "La configuración de video se ha creado exitosamente.",
            });
        },
        onError: (error: unknown) => {
            let errorMessage =
                "No se pudo crear la configuración de video. Por favor intenta nuevamente.";
            
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string | string[];
                        };
                    };
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMessage = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMessage = message[0];
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            setModal({
                type: "error",
                title: "Error al crear",
                message: errorMessage,
            });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: CreateProcessVideoRequirementDto) =>
            processesService.updateVideoRequirement(processId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["process-video-requirements", processId],
            });
            setModal({
                type: "success",
                title: "¡Configuración actualizada!",
                message: "Los cambios se han guardado exitosamente.",
            });
        },
        onError: (error: unknown) => {
            let errorMessage =
                "No se pudo actualizar la configuración. Por favor intenta nuevamente.";
            
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string | string[];
                        };
                    };
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMessage = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMessage = message[0];
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            setModal({
                type: "error",
                title: "Error al actualizar",
                message: errorMessage,
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: () => processesService.deleteVideoRequirement(processId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["process-video-requirements", processId],
            });
            setIsRequired(false);
            setMaxDuration(180);
            setInstructions("");
            setQuestions([]);
            setModal({
                type: "success",
                title: "¡Configuración eliminada!",
                message: "La configuración de video ha sido eliminada exitosamente.",
            });
        },
        onError: (error: unknown) => {
            let errorMessage =
                "No se pudo eliminar la configuración. Por favor intenta nuevamente.";
            
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string | string[];
                        };
                    };
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMessage = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMessage = message[0];
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            setModal({
                type: "error",
                title: "Error al eliminar",
                message: errorMessage,
            });
        },
    });

    const addQuestion = () => {
        if (!newQuestion.question.trim()) {
            setModal({
                type: "error",
                title: "Pregunta vacía",
                message: "Por favor escribe una pregunta antes de agregar.",
            });
            return;
        }

        const newQuestionObj: VideoQuestion = {
            order: questions.length + 1,
            question: newQuestion.question,
            displayAtSecond: newQuestion.displayAtSecond,
        };

        setQuestions([...questions, newQuestionObj]);
        setNewQuestion({ question: "", displayAtSecond: 0 });
    };

    const removeQuestion = (index: number) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        // Re-order remaining questions
        const reorderedQuestions = updatedQuestions.map((q, i) => ({
            ...q,
            order: i + 1,
        }));
        setQuestions(reorderedQuestions);
    };

    const handleSave = () => {
        const data: CreateProcessVideoRequirementDto = {
            isRequired,
            maxDuration: isRequired ? maxDuration : undefined,
            questions: isRequired && questions.length > 0 ? questions : undefined,
            instructions: isRequired && instructions.trim() ? instructions : undefined,
        };

        if (existingConfig) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = () => {
        setModal({
            type: "confirm",
            title: "¿Eliminar configuración?",
            message:
                "Esta acción eliminará toda la configuración de video para este proceso. Los trabajadores ya no necesitarán grabar un video para acceder a los tests.",
            onConfirm: () => {
                deleteMutation.mutate();
                setModal({ type: null, title: "", message: "" });
            },
        });
    };

    const closeModal = () => {
        setModal({ type: null, title: "", message: "" });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Configuración de Video Introductorio
                </h3>

                {/* Is Required Toggle */}
                <div className="mb-6">
                    <label className={`flex items-center space-x-3 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                        <input
                            type="checkbox"
                            checked={isRequired}
                            onChange={(e) => setIsRequired(e.target.checked)}
                            disabled={readOnly}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Requerir video introductorio para este proceso
                        </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-8">
                        Si está activo, los trabajadores deberán grabar un video antes de acceder a los tests
                    </p>
                </div>

                {isRequired && (
                    <>
                        {/* Max Duration */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duración máxima (segundos)
                            </label>
                            <input
                                type="number"
                                min="30"
                                max="600"
                                value={maxDuration}
                                onChange={(e) =>
                                    setMaxDuration(parseInt(e.target.value))
                                }
                                disabled={readOnly}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                El video se detendrá automáticamente al alcanzar esta duración ({Math.floor(maxDuration / 60)}:{String(maxDuration % 60).padStart(2, '0')} minutos)
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Instrucciones para el trabajador
                            </label>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                rows={4}
                                placeholder="Ej: Preséntate brevemente, cuéntanos sobre tu experiencia laboral y por qué te interesa esta posición..."
                                disabled={readOnly}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                            />
                        </div>

                        {/* Questions List */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preguntas durante la grabación
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Las preguntas aparecerán en pantalla en el momento especificado
                            </p>

                            {questions.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {questions.map((q, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start justify-between p-3 bg-gray-50 rounded-md"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {q.order}. {q.question}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Aparece a los {q.displayAtSecond}s
                                                </p>
                                            </div>
                                            {!readOnly && (
                                                <button
                                                    onClick={() => removeQuestion(index)}
                                                    className="ml-2 text-red-600 hover:text-red-800"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Question Form */}
                            {!readOnly && (
                                <div className="border border-gray-200 rounded-md p-4">
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={newQuestion.question}
                                            onChange={(e) =>
                                                setNewQuestion({
                                                    ...newQuestion,
                                                    question: e.target.value,
                                                })
                                            }
                                            placeholder="Escribe una pregunta..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex items-center space-x-3">
                                            <label className="text-sm text-gray-700 whitespace-nowrap">
                                                Mostrar a los:
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={maxDuration}
                                                value={newQuestion.displayAtSecond}
                                                onChange={(e) =>
                                                    setNewQuestion({
                                                        ...newQuestion,
                                                        displayAtSecond: parseInt(
                                                            e.target.value
                                                        ),
                                                    })
                                                }
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                segundos
                                            </span>
                                            <button
                                                onClick={addQuestion}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Action Buttons */}
                {!readOnly && (
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div>
                            {existingConfig && (
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deleteMutation.isPending
                                        ? "Eliminando..."
                                        : "Eliminar configuración"}
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={
                                createMutation.isPending || updateMutation.isPending
                            }
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {createMutation.isPending || updateMutation.isPending
                                ? "Guardando..."
                                : "Guardar configuración"}
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal.type && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div
                            className={`px-6 py-4 border-b ${
                                modal.type === "success"
                                    ? "bg-green-50 border-green-200"
                                    : modal.type === "error"
                                    ? "bg-red-50 border-red-200"
                                    : "bg-yellow-50 border-yellow-200"
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                        modal.type === "success"
                                            ? "bg-green-100"
                                            : modal.type === "error"
                                            ? "bg-red-100"
                                            : "bg-yellow-100"
                                    }`}
                                >
                                    {modal.type === "success" && (
                                        <svg
                                            className="w-6 h-6 text-green-600"
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
                                    )}
                                    {modal.type === "error" && (
                                        <svg
                                            className="w-6 h-6 text-red-600"
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
                                    )}
                                    {modal.type === "confirm" && (
                                        <svg
                                            className="w-6 h-6 text-yellow-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <h3
                                    className={`text-lg font-semibold ${
                                        modal.type === "success"
                                            ? "text-green-900"
                                            : modal.type === "error"
                                            ? "text-red-900"
                                            : "text-yellow-900"
                                    }`}
                                >
                                    {modal.title}
                                </h3>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4">
                            <p className="text-gray-700">{modal.message}</p>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                            {modal.type === "confirm" ? (
                                <>
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={modal.onConfirm}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={closeModal}
                                    className={`px-6 py-2 text-white rounded-md transition-colors ${
                                        modal.type === "success"
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    Aceptar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
