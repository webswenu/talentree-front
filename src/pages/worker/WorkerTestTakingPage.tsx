import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTestResponse, useSubmitTest } from "../../hooks/useTestResponses";
import { useTestTimers } from "../../hooks/useTestTimers";
import { QuestionType, FixedTest } from "../../types/test.types";
import { SubmitAnswerDto, TestResponse } from "../../types/test-response.types";

interface ExtendedTestResponse extends TestResponse {
    fixedTest?: FixedTest & {
        questions?: Array<{
            id: string;
            questionText: string;
            questionType: QuestionType;
            questionNumber: number;
            options?: unknown;
        }>;
    };
}

interface FixedTestQuestion {
    id: string;
    questionText: string;
    questionType: QuestionType;
    questionNumber: number;
    options?: unknown;
    question?: string;
    text?: string;
    type?: QuestionType;
    order?: number;
}

export const WorkerTestTakingPage = () => {
    const { testResponseId } = useParams<{ testResponseId: string }>();
    const navigate = useNavigate();

    const { data: testResponse, isLoading } = useTestResponse(
        testResponseId || ""
    ) as { data?: ExtendedTestResponse; isLoading: boolean };
    const submitMutation = useSubmitTest();
    const { registerTimer, removeTimer, getTimeLeft } = useTestTimers();

    const [currentQuestion, setCurrentQuestion] = useState(() => {
        // Restore current question from localStorage if exists
        const saved = localStorage.getItem(`test_progress_${testResponseId}`);
        return saved ? parseInt(saved, 10) : 0;
    });
    const [answers, setAnswers] = useState<
        Record<string, string | string[] | number | Record<string, unknown> | null>
    >(() => {
        // Restore answers from localStorage if exists
        const saved = localStorage.getItem(`test_progress_answers_${testResponseId}`);
        return saved ? JSON.parse(saved) : {};
    });
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Support both regular tests and fixed tests
    const isFixedTest = !!(testResponse as ExtendedTestResponse)?.fixedTest;
    const testData = isFixedTest 
        ? (testResponse as ExtendedTestResponse)?.fixedTest 
        : testResponse?.test;

    const questions = useMemo(() => {
        if (isFixedTest) {
            // For fixed tests, questions come from fixedTest.questions
            const fixedQuestions = (testResponse as ExtendedTestResponse)?.fixedTest?.questions || [];
            // Normalize fixed test questions to match regular test question structure
            return fixedQuestions.map((q: FixedTestQuestion) => {
                // Normalize options based on question type
                let normalizedOptions: unknown = q.options;

                if (q.questionType === QuestionType.FORCED_CHOICE || q.questionType === QuestionType.TABLE_CHECKBOX) {
                    // For DISC test and IC test - keep the structure as is
                    normalizedOptions = q.options;
                } else if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                    // For objects like {A: "Si", B: "No", C: "Tal vez"}
                    // Convert to array format, excluding 'scoring' key
                    normalizedOptions = Object.entries(q.options as Record<string, unknown>)
                        .filter(([key]) => key !== 'scoring' && key !== 'format')
                        .map(([, value]) => value);
                }

                return {
                    ...q,
                    question: q.questionText,
                    text: q.questionText,
                    type: q.questionType,
                    order: q.questionNumber,
                    options: normalizedOptions,
                };
            });
        }
        // For regular tests, questions come from test.questions
        return testResponse?.test?.questions || [];
    }, [testResponse, isFixedTest]);

    const totalQuestions = questions.length;
    const currentQ = questions[currentQuestion];

    // Save progress to localStorage when currentQuestion changes
    useEffect(() => {
        if (testResponseId) {
            localStorage.setItem(`test_progress_${testResponseId}`, currentQuestion.toString());
        }
    }, [currentQuestion, testResponseId]);

    // Save answers to localStorage whenever they change (for auto-submit)
    useEffect(() => {
        if (testResponseId && Object.keys(answers).length > 0) {
            const submitAnswers: SubmitAnswerDto[] = questions
                .filter((q) => answers[q.id] !== null && answers[q.id] !== undefined)
                .map((q) => ({
                    questionId: q.id,
                    answer: answers[q.id] as string | string[] | number | null,
                }));
            localStorage.setItem(`test_progress_answers_${testResponseId}`, JSON.stringify(submitAnswers));
        }
    }, [answers, testResponseId, questions]);

    const handleSubmit = useCallback(async () => {
        if (!testResponseId || isSubmitting) return;

        setIsSubmitting(true);

        // Only send answers that have been provided (filter out null/undefined)
        const submitAnswers: SubmitAnswerDto[] = questions
            .filter((q) => answers[q.id] !== null && answers[q.id] !== undefined)
            .map((q) => ({
                questionId: q.id,
                answer: answers[q.id] as string | string[] | number | null,
            }));

        try {
            const response = await submitMutation.mutateAsync({
                responseId: testResponseId,
                data: { answers: submitAnswers },
            });
            // Clean up progress from localStorage after successful submit
            localStorage.removeItem(`test_progress_${testResponseId}`);
            localStorage.removeItem(`test_progress_answers_${testResponseId}`);
            // Remove timer
            removeTimer(testResponseId);
            // Pass workerProcessId as query param to results page
            const workerProcessId = response.workerProcess?.id;
            if (workerProcessId) {
                navigate(`/trabajador/resultados/${testResponseId}?processId=${workerProcessId}`);
            } else {
                navigate(`/trabajador/resultados/${testResponseId}`);
            }
        } catch {
            setIsSubmitting(false);
        }
    }, [testResponseId, questions, answers, submitMutation, navigate, isSubmitting, removeTimer]);

    // Register timer with global timer system and update local display
    useEffect(() => {
        if (!testData?.duration || !testResponse?.startedAt || testResponse?.isCompleted || !testResponseId) return;

        const startedAt = new Date(testResponse.startedAt).getTime();
        const duration = testData.duration; // in minutes

        // Get processId and workerProcessId
        const processId = typeof testResponse.workerProcess === 'string'
            ? testResponse.workerProcess
            : testResponse.workerProcess?.id || '';
        const workerProcessId = processId;

        // Register with global timer system (only once, registerTimer handles duplicates)
        registerTimer(testResponseId, startedAt, duration, processId, workerProcessId);

        // Update local timeLeft state for display
        const updateTimeLeft = () => {
            const remaining = getTimeLeft(testResponseId);
            setTimeLeft(remaining);
        };

        // Update immediately
        updateTimeLeft();

        // Update every second for display
        const interval = setInterval(updateTimeLeft, 1000);

        return () => {
            clearInterval(interval);
            // Don't remove timer on unmount - it should continue globally
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testResponse?.startedAt, testData?.duration, testResponse?.isCompleted, testResponseId]);

    // Redirect to applications when test is completed
    useEffect(() => {
        if (testResponse?.isCompleted) {
            // Clean up timer and localStorage
            if (testResponseId) {
                removeTimer(testResponseId);
                localStorage.removeItem(`test_progress_${testResponseId}`);
                localStorage.removeItem(`test_progress_answers_${testResponseId}`);
            }
            // Redirect after a short delay to allow state updates
            const timer = setTimeout(() => {
                navigate("/trabajador/postulaciones");
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [testResponse?.isCompleted, testResponseId, removeTimer, navigate]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswerChange = (
        value: string | string[] | number | Record<string, unknown> | null
    ) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQ.id]: value,
        }));
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    // Check if current question is answered
    const isCurrentQuestionAnswered = () => {
        const currentAnswer = answers[currentQ?.id];

        if (!currentAnswer) return false;

        if (currentQ.type === QuestionType.FORCED_CHOICE) {
            // For forced choice, need both mas and menos
            return currentAnswer &&
                   typeof currentAnswer === 'object' &&
                   !Array.isArray(currentAnswer) &&
                   'mas' in currentAnswer &&
                   'menos' in currentAnswer &&
                   (currentAnswer as { mas?: unknown; menos?: unknown }).mas &&
                   (currentAnswer as { mas?: unknown; menos?: unknown }).menos;
        } else if (currentQ.type === QuestionType.MULTIPLE_RESPONSE) {
            // For multiple response, need at least one selection
            return Array.isArray(currentAnswer) && currentAnswer.length > 0;
        } else if (currentQ.type === QuestionType.TABLE_CHECKBOX) {
            // For table checkbox, need at least one checkbox selected
            return currentAnswer &&
                   typeof currentAnswer === 'object' &&
                   !Array.isArray(currentAnswer) &&
                   Object.values(currentAnswer).some((col) => Array.isArray(col) && col.length > 0);
        } else {
            // For other types, just check if value exists
            return currentAnswer !== null &&
                   currentAnswer !== undefined &&
                   currentAnswer !== '';
        }
    };

    const handleNext = () => {
        if (currentQuestion < totalQuestions - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Submit directly without confirmation modal
            handleSubmit();
        }
    };

    const renderQuestionInput = () => {
        const currentAnswer = answers[currentQ.id];

        switch (currentQ.type) {
            case QuestionType.MULTIPLE_CHOICE:
                return (
                    <div className="space-y-3">
                        {(currentQ.options as string[])?.map((option: string, idx: number) => (
                            <label
                                key={idx}
                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                    currentAnswer === option
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQ.id}`}
                                    value={option}
                                    checked={currentAnswer === option}
                                    onChange={(e) =>
                                        handleAnswerChange(e.target.value)
                                    }
                                    className="mr-3 w-4 h-4 text-blue-600"
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case QuestionType.TRUE_FALSE:
                return (
                    <div className="space-y-3">
                        {["Verdadero", "Falso"].map((option) => (
                            <label
                                key={option}
                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                    currentAnswer === option
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQ.id}`}
                                    value={option}
                                    checked={currentAnswer === option}
                                    onChange={(e) =>
                                        handleAnswerChange(e.target.value)
                                    }
                                    className="mr-3 w-4 h-4 text-blue-600"
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case QuestionType.MULTIPLE_RESPONSE:
                return (
                    <div className="space-y-3">
                        {(currentQ.options as string[])?.map((option: string, idx: number) => {
                            const selectedOptions =
                                (currentAnswer as string[]) || [];
                            const isChecked = selectedOptions.includes(option);

                            return (
                                <label
                                    key={idx}
                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                        isChecked
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                            const newSelected = e.target.checked
                                                ? [...selectedOptions, option]
                                                : selectedOptions.filter(
                                                      (o) => o !== option
                                                  );
                                            handleAnswerChange(newSelected);
                                        }}
                                        className="mr-3 w-4 h-4 text-blue-600"
                                    />
                                    <span>{option}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case QuestionType.SCALE:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <label
                                    key={value}
                                    className={`flex flex-col items-center cursor-pointer p-4 border-2 rounded-lg transition-colors ${
                                        currentAnswer === value
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQ.id}`}
                                        value={value}
                                        checked={currentAnswer === value}
                                        onChange={(e) =>
                                            handleAnswerChange(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="sr-only"
                                    />
                                    <span className="text-2xl font-bold">
                                        {value}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Totalmente en desacuerdo</span>
                            <span>Totalmente de acuerdo</span>
                        </div>
                    </div>
                );

            case QuestionType.OPEN_TEXT:
                return (
                    <textarea
                        value={typeof currentAnswer === 'string' ? currentAnswer : ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        rows={6}
                        className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
                        placeholder="Escribe tu respuesta aquí..."
                    />
                );

            case QuestionType.MULTIPLE_CHOICE_TERNARY:
                // Test 16PF - Opciones A, B, C
                return (
                    <div className="space-y-3">
                        {(currentQ.options as string[])?.map((option: string, idx: number) => (
                            <label
                                key={idx}
                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                    currentAnswer === option
                                        ? "border-purple-600 bg-purple-50"
                                        : "border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQ.id}`}
                                    value={option}
                                    checked={currentAnswer === option}
                                    onChange={(e) =>
                                        handleAnswerChange(e.target.value)
                                    }
                                    className="mr-3 w-4 h-4 text-purple-600"
                                />
                                <span className="font-semibold mr-2">
                                    {String.fromCharCode(65 + idx)}.
                                </span>
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case QuestionType.FORCED_CHOICE: {
                // Test DISC - Elección forzada: elegir MÁS y MENOS descriptivo
                const forcedAnswer = (currentAnswer as { mas?: string; menos?: string }) || { mas: null, menos: null };

                // Extract words from options.words object for DISC test
                const optionsObj = currentQ.options as { words?: Record<string, string> } | Record<string, string> | undefined;
                const wordsObj = (optionsObj && typeof optionsObj === 'object' && 'words' in optionsObj) 
                    ? optionsObj.words 
                    : (optionsObj as Record<string, string> | undefined);
                const words = wordsObj ? Object.values(wordsObj) as string[] : [];

                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-blue-900">
                                Instrucciones: De las siguientes palabras, selecciona:
                            </p>
                            <ul className="text-sm text-blue-800 mt-2 space-y-1">
                                <li>• Una palabra que <strong>MÁS</strong> te describe</li>
                                <li>• Una palabra que <strong>MENOS</strong> te describe</li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {words.map((word, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg"
                                >
                                    <span className="font-medium">{word}</span>
                                    <div className="flex gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`mas-${currentQ.id}`}
                                                value={word}
                                                checked={forcedAnswer.mas === word}
                                                onChange={(e) =>
                                                    handleAnswerChange({
                                                        ...forcedAnswer,
                                                        mas: e.target.value,
                                                    })
                                                }
                                                className="mr-2 w-4 h-4 text-green-600"
                                            />
                                            <span className="text-sm font-medium text-green-700">
                                                MÁS
                                            </span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`menos-${currentQ.id}`}
                                                value={word}
                                                checked={forcedAnswer.menos === word}
                                                onChange={(e) =>
                                                    handleAnswerChange({
                                                        ...forcedAnswer,
                                                        menos: e.target.value,
                                                    })
                                                }
                                                className="mr-2 w-4 h-4 text-red-600"
                                            />
                                            <span className="text-sm font-medium text-red-700">
                                                MENOS
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            case QuestionType.LIKERT_SCALE:
                // Test CFR - Escala Likert 1-5
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-stretch gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <label
                                    key={value}
                                    className={`flex-1 flex flex-col items-center justify-center cursor-pointer p-4 border-2 rounded-lg transition-all ${
                                        currentAnswer === value
                                            ? "border-blue-600 bg-blue-50 scale-105 shadow-md"
                                            : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQ.id}`}
                                        value={value}
                                        checked={currentAnswer === value}
                                        onChange={(e) =>
                                            handleAnswerChange(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="sr-only"
                                    />
                                    <span className="text-3xl font-bold mb-2">
                                        {value}
                                    </span>
                                    <span className="text-xs text-center text-gray-600">
                                        {value === 1 && "Totalmente en desacuerdo"}
                                        {value === 2 && "En desacuerdo"}
                                        {value === 3 && "Neutral"}
                                        {value === 4 && "De acuerdo"}
                                        {value === 5 && "Totalmente de acuerdo"}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case QuestionType.TABLE_CHECKBOX: {
                // Test IC - Tabla compleja con checkboxes
                interface TableData {
                    instructions?: Array<{ column: number; text: string }>;
                    tableHeaders?: string[];
                    tableData?: Array<{
                        cantidadAsegurada: string;
                        claseSeguro: string;
                        fecha: string;
                        rowId: number;
                    }>;
                }
                const tableData = currentQ.options as TableData;
                const tableAnswer = (currentAnswer as { column1?: number[]; column2?: number[]; column3?: number[] }) || { column1: [], column2: [], column3: [] };

                return (
                    <div className="space-y-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-yellow-900 mb-2">
                                Instrucciones:
                            </p>
                            <div className="space-y-2 text-sm text-yellow-800">
                                {tableData?.instructions?.map((instr, idx: number) => (
                                    <div key={idx} className="flex items-start">
                                        <span className="font-semibold mr-2">
                                            Columna {instr.column}:
                                        </span>
                                        <span>{instr.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        {tableData?.tableHeaders?.map((header: string, idx: number) => (
                                            <th
                                                key={idx}
                                                className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData?.tableData?.map((row, rowIdx: number) => (
                                        <tr key={rowIdx} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-2 text-sm">
                                                {row.cantidadAsegurada}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-sm">
                                                {row.claseSeguro}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-sm">
                                                {row.fecha}
                                            </td>
                                            {[1, 2, 3].map((colNum) => {
                                                const columnKey = `column${colNum}` as 'column1' | 'column2' | 'column3';
                                                const currentColumn = tableAnswer[columnKey] || [];
                                                return (
                                                    <td
                                                        key={colNum}
                                                        className="border border-gray-300 px-4 py-2 text-center"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={currentColumn.includes(row.rowId)}
                                                            onChange={(e) => {
                                                                const newColumn = e.target.checked
                                                                    ? [...currentColumn, row.rowId]
                                                                    : currentColumn.filter((id: number) => id !== row.rowId);
                                                                handleAnswerChange({
                                                                    ...tableAnswer,
                                                                    [columnKey]: newColumn,
                                                                });
                                                            }}
                                                            className="w-5 h-5 text-blue-600"
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }

            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando test...</div>
            </div>
        );
    }

    if (testResponse?.isCompleted) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-12">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600">
                        Redirigiendo...
                    </p>
                </div>
            </div>
        );
    }

    if (!currentQ) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-12">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Test sin preguntas
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Este test no tiene preguntas configuradas.
                    </p>
                    <button
                        onClick={() => navigate("/trabajador/postulaciones")}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    // Count only questions with actual answers (not null/undefined/empty)
    const answeredCount = Object.values(answers).filter(answer => {
        if (answer === null || answer === undefined || answer === '') return false;
        if (Array.isArray(answer) && answer.length === 0) return false;
        if (typeof answer === 'object' && !Array.isArray(answer)) {
            // For forced choice and table checkbox, check if has values
            return Object.values(answer).some(val =>
                val !== null && val !== undefined &&
                (Array.isArray(val) ? val.length > 0 : true)
            );
        }
        return true;
    }).length;
    const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">
                            {testData?.name || "Test"}
                        </h1>
                        <p className="text-sm text-gray-600">
                            Pregunta {currentQuestion + 1} de {totalQuestions} •{" "}
                            {answeredCount} respondidas
                        </p>
                    </div>
                    {timeLeft !== null && (
                        <div className="text-right">
                            <p className="text-sm text-gray-600">
                                Tiempo restante
                            </p>
                            <p
                                className={`text-lg font-semibold ${
                                    timeLeft < 300
                                        ? "text-red-600"
                                        : "text-gray-800"
                                }`}
                            >
                                {formatTime(timeLeft)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow p-8 space-y-6">
                    <div>
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-800">
                                {currentQuestion + 1}. {currentQ.question}
                            </h2>
                            {'isRequired' in currentQ && currentQ.isRequired && (
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                                    Obligatoria
                                </span>
                            )}
                        </div>
                        {'points' in currentQ && (
                            <p className="text-sm text-gray-600">
                                {currentQ.points} puntos
                            </p>
                        )}
                    </div>

                    {renderQuestionInput()}

                    <div className="flex items-center justify-between pt-6 border-t">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!isCurrentQuestionAnswered() || submitMutation.isPending}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {currentQuestion === totalQuestions - 1
                                ? "Finalizar"
                                : "Siguiente"}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};
