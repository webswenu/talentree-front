import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    useTestResponse,
    useEvaluateAnswer,
    useRecalculateScore,
    useSaveEvaluatorNotes,
} from "../../hooks/useTestResponses";
import {
    QuestionType,
    TestTypeLabels,
    TestTypeColors,
} from "../../types/test.types";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { toast } from "../../utils/toast";
import { getApiErrorMessage } from "../../utils/apiError";

/**
 * Una pregunta lista para dibujar, venga de un test personalizado o de uno fijo.
 *
 * Esta pantalla estaba escrita suponiendo que siempre habría un test
 * personalizado: leía `testResponse.test.questions` y, para cruzar cada
 * respuesta con su pregunta, hacía `answer.question.id`. En los tests fijos
 * (DISC, 16PF, IL, CFR, TAC, IC) la pregunta no cuelga de `question` sino de
 * `fixedTestQuestion`, así que `question` viene en null y esa línea lanzaba
 * "Cannot read properties of null (reading 'id')": la pantalla completa se caía
 * al error boundary. Y en producción los tests fijos son el 100% de las
 * respuestas que existen, así que no había ninguna que se pudiera abrir.
 */
interface PreguntaEnPantalla {
    id: string;
    numero: number;
    enunciado: string;
    tipo?: QuestionType;
    puntos: number;
    opciones?: string[];
    respuestasCorrectas?: string[];
    /** Solo los tests personalizados admiten calificación manual. */
    admiteNotaManual: boolean;
}

export const EvaluatorTestReviewPage = () => {
    const { testResponseId } = useParams<{ testResponseId: string }>();
    const navigate = useNavigate();

    const { data: testResponse, isLoading } = useTestResponse(
        testResponseId || ""
    );
    const evaluateAnswerMutation = useEvaluateAnswer();
    const recalculateMutation = useRecalculateScore();
    const saveNotesMutation = useSaveEvaluatorNotes();

    const [answerScores, setAnswerScores] = useState<
        Record<string, { score: number; comment: string }>
    >({});
    const [generalNotes, setGeneralNotes] = useState("");
    const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleScoreChange = (answerId: string, score: number) => {
        setAnswerScores((prev) => ({
            ...prev,
            [answerId]: {
                score,
                comment: prev[answerId]?.comment || "",
            },
        }));
    };

    const handleCommentChange = (answerId: string, comment: string) => {
        setAnswerScores((prev) => ({
            ...prev,
            [answerId]: {
                score: prev[answerId]?.score || 0,
                comment,
            },
        }));
    };

    const handleSaveReview = async () => {
        if (!testResponseId) return;

        setIsSaving(true);
        try {
            const answersToEvaluate = Object.entries(answerScores);

            for (const [answerId, data] of answersToEvaluate) {
                await evaluateAnswerMutation.mutateAsync({
                    answerId,
                    data: {
                        score: data.score,
                        isCorrect: data.score > 0,
                        evaluatorComment: data.comment,
                    },
                });
            }

            // P-66: las notas generales se escribían en el textarea y se
            // perdían: handleSaveReview mandaba el puntaje de cada respuesta
            // pero nunca las notas. Ahora se guardan antes de recalcular.
            await saveNotesMutation.mutateAsync({
                responseId: testResponseId,
                evaluatorNotes: generalNotes,
            });

            // Los tests fijos se puntúan solos y su puntaje no sale de las
            // notas del evaluador: recalcular ahí no aporta nada y, si la
            // respuesta quedó sin puntajes, los pisa de nuevo.
            if (answersToEvaluate.length > 0) {
                await recalculateMutation.mutateAsync(testResponseId);
            }

            navigate("/evaluador");
        } catch (err) {
            console.error("Error saving review:", err);
            // Al fallar no se navega al dashboard y el modal se cierra igual:
            // el evaluador quedaba en la misma pantalla sin saber si su
            // evaluación se guardó.
            toast.error(
                getApiErrorMessage(
                    err,
                    "No pudimos guardar la evaluación. Revisa los puntajes e intenta nuevamente."
                )
            );
        } finally {
            setIsSaving(false);
            setIsConfirmSaveOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando test...</div>
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
                        onClick={() => navigate("/evaluador")}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const esTestFijo = Boolean(testResponse.fixedTest);
    const nombreDelTest =
        testResponse.test?.name ??
        testResponse.fixedTest?.name ??
        "Test sin nombre";

    // Una sola lista, venga de donde venga la pregunta.
    const preguntas: PreguntaEnPantalla[] = esTestFijo
        ? (testResponse.fixedTest?.questions ?? []).map((q) => ({
              id: q.id,
              numero: q.questionNumber,
              enunciado: q.questionText,
              tipo: q.questionType as QuestionType,
              puntos: q.points,
              opciones: extraerOpciones(q.options),
              admiteNotaManual: false,
          }))
        : (testResponse.test?.questions ?? []).map((q, idx) => ({
              id: q.id,
              numero: q.order ?? idx + 1,
              enunciado: q.question,
              tipo: q.type,
              puntos: q.points,
              opciones: q.options,
              respuestasCorrectas: q.correctAnswers,
              admiteNotaManual: q.type === QuestionType.OPEN_TEXT,
          }));

    // La respuesta se cruza por el id de la pregunta que efectivamente traiga.
    const answersMap = new Map(
        (testResponse.answers ?? [])
            .map((a) => {
                const idPregunta = a.question?.id ?? a.fixedTestQuestion?.id;
                return idPregunta ? ([idPregunta, a] as const) : null;
            })
            .filter((par): par is readonly [string, (typeof testResponse.answers)[number]] =>
                par !== null
            )
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate("/evaluador")}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                ← Volver
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Revisión de Test
                            </h1>
                        </div>
                        <div className="mt-2 space-y-1">
                            <p className="text-gray-700">
                                <span className="font-medium">Candidato:</span>{" "}
                                {testResponse.workerProcess?.worker?.firstName}{" "}
                                {testResponse.workerProcess?.worker?.lastName}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-medium">Test:</span>{" "}
                                {nombreDelTest}
                                {testResponse.test?.type && (
                                    <span
                                        className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                                            TestTypeColors[
                                                testResponse.test.type
                                            ]
                                        }`}
                                    >
                                        {TestTypeLabels[testResponse.test.type]}
                                    </span>
                                )}
                                {esTestFijo && (
                                    <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                                        Test psicométrico ·{" "}
                                        {testResponse.fixedTest?.code}
                                    </span>
                                )}
                            </p>
                            {testResponse.workerProcess?.process?.name && (
                                <p className="text-gray-700">
                                    <span className="font-medium">
                                        Proceso:
                                    </span>{" "}
                                    {testResponse.workerProcess.process.name}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsConfirmSaveOpen(true)}
                        disabled={isSaving}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Guardando..." : "Guardar Evaluación"}
                    </button>
                </div>

                {/* Resultado */}
                {esTestFijo ? (
                    <ResultadoPsicometrico
                        codigo={testResponse.fixedTest?.code}
                        rawScores={testResponse.rawScores}
                        scaledScores={testResponse.scaledScores}
                        interpretation={testResponse.interpretation}
                    />
                ) : (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Resumen de Puntaje
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Puntaje Actual
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {testResponse.score || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Puntaje Máximo
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {testResponse.maxScore || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Porcentaje
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {testResponse.maxScore
                                        ? Math.round(
                                              ((testResponse.score || 0) /
                                                  testResponse.maxScore) *
                                                  100
                                          )
                                        : 0}
                                    %
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preguntas */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Respuestas del Candidato
                    </h2>

                    {preguntas.length === 0 && (
                        <div className="bg-white rounded-lg shadow p-6 text-gray-600">
                            No hay preguntas registradas para este test.
                        </div>
                    )}

                    {preguntas.map((pregunta, idx) => {
                        const answer = answersMap.get(pregunta.id);

                        return (
                            <div
                                key={pregunta.id}
                                className="bg-white rounded-lg shadow p-6 space-y-4"
                            >
                                {/* Pregunta */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-gray-800">
                                            {pregunta.numero || idx + 1}.{" "}
                                            {pregunta.enunciado}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {pregunta.puntos} puntos •{" "}
                                            {pregunta.admiteNotaManual
                                                ? "Pregunta Abierta"
                                                : "Autocalificada"}
                                        </p>
                                    </div>
                                    {!pregunta.admiteNotaManual &&
                                        !esTestFijo &&
                                        answer?.isCorrect !== undefined && (
                                            <span
                                                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                    answer.isCorrect
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {answer.isCorrect
                                                    ? "✓ Correcta"
                                                    : "✗ Incorrecta"}
                                            </span>
                                        )}
                                </div>

                                {/* Opciones que se le ofrecieron */}
                                {pregunta.opciones &&
                                    pregunta.opciones.length > 0 && (
                                        <p className="text-sm text-gray-500">
                                            Opciones:{" "}
                                            {pregunta.opciones.join(" · ")}
                                        </p>
                                    )}

                                {/* Respuesta */}
                                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        Respuesta del candidato:
                                    </p>
                                    {renderAnswer(answer?.answer)}
                                </div>

                                {/* Respuesta correcta, solo donde existe */}
                                {!pregunta.admiteNotaManual &&
                                    pregunta.respuestasCorrectas &&
                                    pregunta.respuestasCorrectas.length > 0 && (
                                        <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Respuesta correcta:
                                            </p>
                                            <p className="text-gray-800">
                                                {pregunta.respuestasCorrectas.join(
                                                    ", "
                                                )}
                                            </p>
                                        </div>
                                    )}

                                {/* Puntaje */}
                                <div className="pt-4 border-t">
                                    {pregunta.admiteNotaManual ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Calificación Manual (0 -{" "}
                                                    {pregunta.puntos} puntos)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={pregunta.puntos}
                                                    value={
                                                        answerScores[
                                                            answer?.id || ""
                                                        ]?.score || 0
                                                    }
                                                    onChange={(e) =>
                                                        handleScoreChange(
                                                            answer?.id || "",
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Comentarios del Evaluador
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={
                                                        answerScores[
                                                            answer?.id || ""
                                                        ]?.comment || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleCommentChange(
                                                            answer?.id || "",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                                    placeholder="Ingrese sus comentarios sobre esta respuesta..."
                                                />
                                            </div>
                                        </div>
                                    ) : esTestFijo ? (
                                        <p className="text-sm text-gray-500">
                                            Este test se puntúa de forma
                                            automática según su baremo; la
                                            respuesta no se califica una por
                                            una.
                                        </p>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-700">
                                                Puntaje automático:
                                            </span>
                                            <span className="text-lg font-bold text-gray-800">
                                                {answer?.score || 0} /{" "}
                                                {pregunta.puntos}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Notas generales */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Notas Generales del Evaluador
                    </h2>
                    <textarea
                        rows={6}
                        value={generalNotes}
                        onChange={(e) => setGeneralNotes(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        placeholder="Ingrese sus comentarios generales sobre el desempeño del candidato en este test..."
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmSaveOpen}
                onClose={() => setIsConfirmSaveOpen(false)}
                onConfirm={handleSaveReview}
                title="Guardar Evaluación"
                message="¿Estás seguro de guardar esta evaluación? Se notificará al candidato."
                confirmText="Guardar"
                cancelText="Cancelar"
                isLoading={isSaving}
            />
        </div>
    );
};

interface EstiloCEAL {
    numero: number;
    nombre: string;
    predominio: number;
    efectividad: number | null;
    nivelEfectividad: string | null;
    percepcion: {
        tipo: "EFICAZ" | "INEFICAZ";
        nombre: string;
        descripcion: string;
    } | null;
}

interface InterpretacionCEAL {
    efectividadGeneral: { puntaje: number; nivel: string };
    estilos: EstiloCEAL[];
    respuestas: {
        situacion: number;
        alternativa: string;
        estilo: number;
        efectividad: number;
    }[];
    referenciaTeorica: string;
}

interface DimensionBIS11 {
    clave: string;
    nombre: string;
    puntaje: number;
    maximo: number;
    nivel: string;
    interpretacion: string;
}

interface InterpretacionBIS11 {
    dimensiones: DimensionBIS11[];
    total: DimensionBIS11;
    notaMetodologica: string;
}

/** +10, -3, 0, +7,20 — igual que el informe. */
const conSigno = (valor: number) => {
    const texto = Number.isInteger(valor)
        ? String(valor)
        : valor.toFixed(2).replace(".", ",");
    return valor > 0 ? `+${texto}` : texto;
};

/** Panel de resultado de los tests psicométricos, que no usan score/maxScore. */
function ResultadoPsicometrico({
    codigo,
    rawScores,
    scaledScores,
    interpretation,
}: {
    codigo?: string;
    rawScores?: Record<string, number> | null;
    scaledScores?: Record<string, number> | null;
    interpretation?: Record<string, unknown> | string | null;
}) {
    // CEAL y BIS-11 traen su resultado estructurado. Si no se pudo calcular
    // (sin estilos o sin dimensiones), cae al panel genérico, que muestra la
    // descripción de por qué.
    if (interpretation && typeof interpretation === "object") {
        if (
            codigo === "TEST_CEAL" &&
            Array.isArray(interpretation.estilos) &&
            interpretation.estilos.length > 0
        ) {
            return (
                <ResultadoCEAL
                    interpretation={interpretation as unknown as InterpretacionCEAL}
                />
            );
        }
        if (
            codigo === "TEST_BIS11" &&
            Array.isArray(interpretation.dimensiones) &&
            interpretation.dimensiones.length > 0
        ) {
            return (
                <ResultadoBIS11
                    interpretation={interpretation as unknown as InterpretacionBIS11}
                />
            );
        }
    }

    const factores = Object.entries(rawScores ?? {});
    const resumen =
        typeof interpretation === "string"
            ? interpretation
            : ((interpretation?.descripcion ??
                  interpretation?.resumenGlobal ??
                  interpretation?.nivel) as string | undefined);

    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
                Resultado del Test
            </h2>

            {factores.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-600">
                                <th className="py-2 pr-6 font-medium">
                                    Dimensión
                                </th>
                                <th className="py-2 pr-6 font-medium">
                                    Puntaje bruto
                                </th>
                                <th className="py-2 font-medium">
                                    Puntaje escalado
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {factores.map(([factor, valor]) => (
                                <tr key={factor} className="border-t">
                                    <td className="py-2 pr-6 font-medium text-gray-800">
                                        {factor}
                                    </td>
                                    <td className="py-2 pr-6 text-gray-800 tabular-nums">
                                        {valor}
                                    </td>
                                    <td className="py-2 text-gray-800 tabular-nums">
                                        {scaledScores?.[factor] ?? "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">
                    Este test todavía no tiene puntajes calculados.
                </p>
            )}

            {resumen && (
                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                        Interpretación
                    </p>
                    <p className="text-gray-800 whitespace-pre-wrap">
                        {resumen}
                    </p>
                </div>
            )}
        </div>
    );
}

/** CEAL: estilos, predominio, efectividad y cómo son percibidos. */
function ResultadoCEAL({ interpretation }: { interpretation: InterpretacionCEAL }) {
    const { estilos, respuestas, efectividadGeneral } = interpretation;

    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
                Resultado del Test
            </h2>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-600">
                            <th className="py-2 pr-6 font-medium">Estilo</th>
                            <th className="py-2 pr-6 font-medium">Predominio</th>
                            <th className="py-2 font-medium">Efectividad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {estilos.map((e) => (
                            <tr key={e.numero} className="border-t">
                                <td className="py-2 pr-6 font-medium text-gray-800">
                                    {e.numero}. {e.nombre}
                                </td>
                                <td className="py-2 pr-6 text-gray-800 tabular-nums">
                                    {e.predominio}
                                </td>
                                <td className="py-2 text-gray-800 tabular-nums">
                                    {e.efectividad === null
                                        ? "Sin respuestas"
                                        : `${conSigno(e.efectividad)} (${e.nivelEfectividad})`}
                                </td>
                            </tr>
                        ))}
                        <tr className="border-t font-semibold text-gray-900">
                            <td className="py-2 pr-6">Efectividad general</td>
                            <td className="py-2 pr-6" />
                            <td className="py-2 tabular-nums">
                                {conSigno(efectividadGeneral.puntaje)} (
                                {efectividadGeneral.nivel})
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-gray-500">
                {interpretation.referenciaTeorica}
            </p>

            {respuestas.length > 0 && (
                <div className="overflow-x-auto">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                        Estilos situacionales y efectividad situacional
                    </p>
                    <table className="text-sm text-center">
                        <tbody>
                            {[
                                { etiqueta: "Situación", valor: (r: (typeof respuestas)[number]) => r.situacion },
                                { etiqueta: "Alternativa", valor: (r: (typeof respuestas)[number]) => r.alternativa },
                                { etiqueta: "Estilo", valor: (r: (typeof respuestas)[number]) => r.estilo },
                                { etiqueta: "Efectividad", valor: (r: (typeof respuestas)[number]) => conSigno(r.efectividad) },
                            ].map((fila) => (
                                <tr key={fila.etiqueta} className="border-t">
                                    <th className="py-1 pr-4 text-left font-medium text-gray-600">
                                        {fila.etiqueta}
                                    </th>
                                    {respuestas.map((r) => (
                                        <td
                                            key={r.situacion}
                                            className="py-1 px-2 tabular-nums text-gray-800"
                                        >
                                            {fila.valor(r)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                    Cómo podrían ser percibidos
                </p>
                {estilos.map((e) => (
                    <div key={e.numero} className="border-l-4 border-purple-500 pl-4 py-1">
                        <p className="text-gray-800">
                            <span className="font-medium">
                                {e.numero}. {e.nombre}
                                {e.percepcion ? ` — ${e.percepcion.nombre}` : ""}
                            </span>{" "}
                            <span className="text-gray-500 text-sm">
                                {e.predominio === 0
                                    ? "no se eligió en ninguna situación."
                                    : !e.percepcion
                                    ? "efectividad 0, en el punto medio: no se caracteriza como eficaz ni como ineficaz."
                                    : e.percepcion.tipo === "EFICAZ"
                                    ? "(eficaz, responde a la situación)"
                                    : "(ineficaz, no responde a la situación)"}
                            </span>
                        </p>
                        {e.percepcion && (
                            <p className="text-sm text-gray-700">
                                {e.percepcion.descripcion}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/** BIS-11: la hoja «Informe» del Excel. */
function ResultadoBIS11({ interpretation }: { interpretation: InterpretacionBIS11 }) {
    const { dimensiones, total } = interpretation;

    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
                Resultado del Test
            </h2>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-600">
                            <th className="py-2 pr-6 font-medium">Dimensión</th>
                            <th className="py-2 pr-6 font-medium">Puntaje</th>
                            <th className="py-2 pr-6 font-medium">Máximo</th>
                            <th className="py-2 font-medium">Nivel</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...dimensiones, total].map((d) => (
                            <tr
                                key={d.clave}
                                className={`border-t ${d.clave === "TOTAL" ? "font-semibold text-gray-900" : "text-gray-800"}`}
                            >
                                <td className="py-2 pr-6 font-medium">{d.nombre}</td>
                                <td className="py-2 pr-6 tabular-nums">{d.puntaje}</td>
                                <td className="py-2 pr-6 tabular-nums">{d.maximo}</td>
                                <td className="py-2">{d.nivel}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">
                    Análisis por dimensión
                </p>
                {dimensiones.map((d) => (
                    <div key={d.clave} className="border-l-4 border-purple-500 pl-4 py-1">
                        <p className="font-medium text-gray-800">
                            {d.nombre} — {d.puntaje}/{d.maximo} puntos ({d.nivel})
                        </p>
                        <p className="text-sm text-gray-700">{d.interpretacion}</p>
                    </div>
                ))}
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
                <p className="text-sm font-medium text-gray-700 mb-1">
                    Conclusión general
                </p>
                <p className="font-medium text-gray-800">
                    Puntaje total: {total.puntaje}/{total.maximo} puntos — Nivel:{" "}
                    {total.nivel}
                </p>
                <p className="text-gray-800">{total.interpretacion}</p>
            </div>

            {interpretation.notaMetodologica && (
                <p className="text-xs text-gray-500">
                    {interpretation.notaMetodologica}
                </p>
            )}
        </div>
    );
}

/** Saca los textos de opción de un `options` de test fijo, que es un objeto. */
function extraerOpciones(options: unknown): string[] | undefined {
    if (!options || typeof options !== "object") return undefined;
    const obj = options as Record<string, unknown>;

    // Forma del DISC: { words: { D: "Enérgico", ... }, format: "mas_menos" }
    if (obj.words && typeof obj.words === "object") {
        return Object.values(obj.words as Record<string, unknown>).map(String);
    }

    // Forma del 16PF / IL: { A: "Si", B: "...", C: "No", scoring: {...} }
    const textos = Object.entries(obj)
        .filter(
            ([clave, valor]) =>
                clave !== "scoring" &&
                clave !== "format" &&
                (typeof valor === "string" || typeof valor === "number")
        )
        .map(([, valor]) => String(valor));

    return textos.length > 0 ? textos : undefined;
}

/**
 * Dibuja la respuesta sea cual sea su forma.
 *
 * Antes elegía el formato por el tipo de pregunta y caía en `JSON.stringify`
 * para todo lo que no fuera de un test personalizado. Los tests fijos guardan
 * objetos: el DISC manda `{ "Enérgico": "mas", "Reservado": "menos" }` y el IC
 * manda `{ column1: ..., column2: ... }`.
 */
function renderAnswer(
    answer: unknown
): React.ReactElement {
    if (answer === null || answer === undefined || answer === "") {
        return <p className="text-gray-400 italic">No respondida</p>;
    }

    if (Array.isArray(answer)) {
        return <p className="text-gray-800">{answer.map(String).join(", ")}</p>;
    }

    if (typeof answer === "object") {
        const pares = Object.entries(answer as Record<string, unknown>);
        return (
            <ul className="text-gray-800 space-y-0.5">
                {pares.map(([clave, valor]) => (
                    <li key={clave}>
                        <span className="font-medium">{clave}:</span>{" "}
                        {String(valor)}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <p className="text-gray-800 whitespace-pre-wrap">{String(answer)}</p>
    );
}
