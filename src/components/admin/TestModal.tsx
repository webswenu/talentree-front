import { useEffect, useState } from "react";
import {
    Test,
    CreateTestDto,
    TestType,
    QuestionType,
    TestTypeLabels,
    QuestionTypeLabels,
    CreateQuestionDto,
} from "../../types/test.types";
import { useCreateTest, useUpdateTest } from "../../hooks/useTests";

interface TestModalProps {
    test?: Test;
    onClose: () => void;
}

export default function TestModal({ test, onClose }: TestModalProps) {
    const createMutation = useCreateTest();
    const updateMutation = useUpdateTest();

    const [formData, setFormData] = useState<CreateTestDto>({
        name: "",
        description: "",
        type: TestType.PSYCHOMETRIC,
        duration: undefined,
        passingScore: undefined,
        isActive: true,
        requiresManualReview: false,
        questions: [],
    });

    const [currentQuestion, setCurrentQuestion] = useState<CreateQuestionDto>({
        question: "",
        type: QuestionType.MULTIPLE_CHOICE,
        options: [""],
        correctAnswers: [],
        points: 1,
        order: 1,
        isRequired: true,
    });

    const [showQuestionForm, setShowQuestionForm] = useState(false);

    useEffect(() => {
        if (test) {
            setFormData({
                name: test.name,
                description: test.description || "",
                type: test.type,
                duration: test.duration,
                passingScore: test.passingScore,
                isActive: test.isActive,
                requiresManualReview: test.requiresManualReview,
                questions:
                    test.questions?.map((q) => ({
                        question: q.question,
                        type: q.type,
                        options: q.options,
                        correctAnswers: q.correctAnswers,
                        points: q.points,
                        order: q.order,
                        isRequired: q.isRequired,
                    })) || [],
            });
        }
    }, [test]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (test) {
                await updateMutation.mutateAsync({
                    id: test.id,
                    data: formData,
                });
            } else {
                await createMutation.mutateAsync(formData);
            }
            onClose();
        } catch (error) {
            console.error("Error al guardar test:", error);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : name === "duration" || name === "passingScore"
                    ? value
                        ? parseInt(value)
                        : undefined
                    : value,
        }));
    };

    const handleAddQuestion = () => {
        setFormData((prev) => ({
            ...prev,
            questions: [
                ...(prev.questions || []),
                {
                    ...currentQuestion,
                    order: (prev.questions?.length || 0) + 1,
                },
            ],
        }));
        setCurrentQuestion({
            question: "",
            type: QuestionType.MULTIPLE_CHOICE,
            options: [""],
            correctAnswers: [],
            points: 1,
            order: (formData.questions?.length || 0) + 2,
            isRequired: true,
        });
        setShowQuestionForm(false);
    };

    const handleRemoveQuestion = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions?.filter((_, i) => i !== index),
        }));
    };

    const handleOptionChange = (index: number, value: string) => {
        setCurrentQuestion((prev) => ({
            ...prev,
            options: prev.options?.map((opt, i) => (i === index ? value : opt)),
        }));
    };

    const handleAddOption = () => {
        setCurrentQuestion((prev) => ({
            ...prev,
            options: [...(prev.options || []), ""],
        }));
    };

    const handleRemoveOption = (index: number) => {
        setCurrentQuestion((prev) => ({
            ...prev,
            options: prev.options?.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {test ? "Editar Test" : "Nuevo Test"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {Object.values(TestType).map((type) => (
                                        <option key={type} value={type}>
                                            {TestTypeLabels[type]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duración (minutos)
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration || ""}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Puntaje Mínimo
                                </label>
                                <input
                                    type="number"
                                    name="passingScore"
                                    value={formData.passingScore || ""}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">
                                    Activo
                                </span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="requiresManualReview"
                                    checked={formData.requiresManualReview}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">
                                    Requiere Revisión Manual
                                </span>
                            </label>
                        </div>

                        {/* Questions Section */}
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Preguntas ({formData.questions?.length || 0}
                                    )
                                </h3>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowQuestionForm(!showQuestionForm)
                                    }
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                    {showQuestionForm
                                        ? "Cancelar"
                                        : "+ Agregar Pregunta"}
                                </button>
                            </div>

                            {/* Question List */}
                            <div className="space-y-2 mb-3">
                                {formData.questions?.map((q, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {index + 1}. {q.question}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {QuestionTypeLabels[q.type]} •{" "}
                                                {q.points} pts
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveQuestion(index)
                                            }
                                            className="text-red-600 hover:text-red-700 text-sm ml-2"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Question Form */}
                            {showQuestionForm && (
                                <div className="border rounded-lg p-4 bg-blue-50">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pregunta *
                                            </label>
                                            <input
                                                type="text"
                                                value={currentQuestion.question}
                                                onChange={(e) =>
                                                    setCurrentQuestion(
                                                        (prev) => ({
                                                            ...prev,
                                                            question:
                                                                e.target.value,
                                                        })
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tipo *
                                                </label>
                                                <select
                                                    value={currentQuestion.type}
                                                    onChange={(e) =>
                                                        setCurrentQuestion(
                                                            (prev) => ({
                                                                ...prev,
                                                                type: e.target
                                                                    .value as QuestionType,
                                                            })
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                >
                                                    {Object.values(
                                                        QuestionType
                                                    ).map((type) => (
                                                        <option
                                                            key={type}
                                                            value={type}
                                                        >
                                                            {
                                                                QuestionTypeLabels[
                                                                    type
                                                                ]
                                                            }
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Puntos *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={
                                                        currentQuestion.points
                                                    }
                                                    onChange={(e) =>
                                                        setCurrentQuestion(
                                                            (prev) => ({
                                                                ...prev,
                                                                points: parseInt(
                                                                    e.target
                                                                        .value
                                                                ),
                                                            })
                                                        )
                                                    }
                                                    min="1"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>

                                            <div className="flex items-end">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            currentQuestion.isRequired
                                                        }
                                                        onChange={(e) =>
                                                            setCurrentQuestion(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    isRequired:
                                                                        e.target
                                                                            .checked,
                                                                })
                                                            )
                                                        }
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                        Requerida
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Options for Multiple Choice */}
                                        {(currentQuestion.type ===
                                            QuestionType.MULTIPLE_CHOICE ||
                                            currentQuestion.type ===
                                                QuestionType.MULTIPLE_RESPONSE) && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Opciones
                                                </label>
                                                {currentQuestion.options?.map(
                                                    (opt, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex gap-2 mb-2"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) =>
                                                                    handleOptionChange(
                                                                        index,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                                                placeholder={`Opción ${
                                                                    index + 1
                                                                }`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveOption(
                                                                        index
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={handleAddOption}
                                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                                >
                                                    + Agregar Opción
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleAddQuestion}
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Guardar Pregunta
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={
                                createMutation.isPending ||
                                updateMutation.isPending
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {createMutation.isPending ||
                            updateMutation.isPending
                                ? "Guardando..."
                                : "Guardar Test"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
