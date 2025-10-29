import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTestResponse, useEvaluateAnswer, useRecalculateScore, useUpdateWorkerProcessStatus } from '../../hooks/useTestResponses';
import { QuestionType, TestTypeLabels, TestTypeColors } from '../../types/test.types';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const EvaluatorTestReviewPage = () => {
  const { testResponseId } = useParams<{ testResponseId: string }>();
  const navigate = useNavigate();

  const { data: testResponse, isLoading } = useTestResponse(testResponseId || '');
  const evaluateAnswerMutation = useEvaluateAnswer();
  const recalculateMutation = useRecalculateScore();

  const [answerScores, setAnswerScores] = useState<Record<string, { score: number; comment: string }>>({});
  const [generalNotes, setGeneralNotes] = useState('');
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleScoreChange = (answerId: string, score: number) => {
    setAnswerScores((prev) => ({
      ...prev,
      [answerId]: {
        score,
        comment: prev[answerId]?.comment || '',
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
      // Evaluar cada respuesta con puntaje y comentario
      const answersToEvaluate = Object.entries(answerScores);

      for (const [answerId, data] of answersToEvaluate) {
        await evaluateAnswerMutation.mutateAsync({
          answerId,
          data: {
            score: data.score,
            isCorrect: data.score > 0, // Simplificación: > 0 = correcta
            evaluatorComment: data.comment,
          },
        });
      }

      // Recalcular puntaje total
      await recalculateMutation.mutateAsync(testResponseId);

      // Navegar de vuelta al dashboard
      navigate('/evaluador');
    } catch (err) {
      console.error('Error saving review:', err);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test no encontrado</h2>
          <button
            onClick={() => navigate('/evaluador')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const answersMap = new Map(testResponse.answers?.map((a) => [a.question.id, a]) || []);
  const openQuestions = testResponse.test?.questions?.filter((q) => q.type === QuestionType.OPEN_TEXT) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/evaluador')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Volver
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Revisión de Test</h1>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-gray-700">
                <span className="font-medium">Candidato:</span>{' '}
                {testResponse.workerProcess?.worker?.firstName}{' '}
                {testResponse.workerProcess?.worker?.lastName}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Test:</span> {testResponse.test?.name}
                <span
                  className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                    TestTypeColors[testResponse.test?.type]
                  }`}
                >
                  {TestTypeLabels[testResponse.test?.type]}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Proceso:</span>{' '}
                {testResponse.workerProcess?.process?.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConfirmSaveOpen(true)}
            disabled={isSaving}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Guardando...' : 'Guardar Evaluación'}
          </button>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Puntaje</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Puntaje Actual</p>
              <p className="text-2xl font-bold text-gray-800">{testResponse.score || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Puntaje Máximo</p>
              <p className="text-2xl font-bold text-gray-800">{testResponse.maxScore || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Porcentaje</p>
              <p className="text-2xl font-bold text-blue-600">
                {testResponse.maxScore
                  ? Math.round(((testResponse.score || 0) / testResponse.maxScore) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        {/* All Questions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Respuestas del Candidato</h2>

          {testResponse.test?.questions?.map((question, idx) => {
            const answer = answersMap.get(question.id);
            const isOpenQuestion = question.type === QuestionType.OPEN_TEXT;

            return (
              <div key={question.id} className="bg-white rounded-lg shadow p-6 space-y-4">
                {/* Question */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-800">
                      {idx + 1}. {question.question}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {question.points} puntos • {question.type === QuestionType.OPEN_TEXT ? 'Pregunta Abierta' : 'Autocalificada'}
                    </p>
                  </div>
                  {!isOpenQuestion && answer?.isCorrect !== undefined && (
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        answer.isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {answer.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                    </span>
                  )}
                </div>

                {/* Answer */}
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                  <p className="text-sm font-medium text-gray-700 mb-1">Respuesta del candidato:</p>
                  {renderAnswer(question.type, answer?.answer)}
                </div>

                {/* Correct Answer (if not open) */}
                {!isOpenQuestion && question.correctAnswers && question.correctAnswers.length > 0 && (
                  <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                    <p className="text-sm font-medium text-gray-700 mb-1">Respuesta correcta:</p>
                    <p className="text-gray-800">{question.correctAnswers.join(', ')}</p>
                  </div>
                )}

                {/* Score (auto or manual) */}
                <div className="pt-4 border-t">
                  {isOpenQuestion ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Calificación Manual (0 - {question.points} puntos)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={question.points}
                          value={answerScores[answer?.id || '']?.score || 0}
                          onChange={(e) =>
                            handleScoreChange(answer?.id || '', Number(e.target.value))
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
                          value={answerScores[answer?.id || '']?.comment || ''}
                          onChange={(e) =>
                            handleCommentChange(answer?.id || '', e.target.value)
                          }
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          placeholder="Ingrese sus comentarios sobre esta respuesta..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">
                        Puntaje automático:
                      </span>
                      <span className="text-lg font-bold text-gray-800">
                        {answer?.score || 0} / {question.points}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* General Notes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notas Generales del Evaluador</h2>
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
        message={`¿Estás seguro de guardar esta evaluación? Se recalculará el puntaje total y se notificará al candidato.`}
        confirmText="Guardar"
        cancelText="Cancelar"
        isLoading={isSaving}
      />
    </div>
  );
};

function renderAnswer(type: QuestionType, answer: any): JSX.Element {
  if (answer === null || answer === undefined) {
    return <p className="text-gray-400 italic">No respondida</p>;
  }

  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.TRUE_FALSE:
      return <p className="text-gray-800">{answer}</p>;

    case QuestionType.MULTIPLE_RESPONSE:
      return (
        <p className="text-gray-800">
          {Array.isArray(answer) ? answer.join(', ') : answer}
        </p>
      );

    case QuestionType.SCALE:
      return (
        <div className="flex items-center gap-2">
          <p className="text-gray-800 font-medium">{answer}</p>
          <span className="text-gray-500">/ 5</span>
        </div>
      );

    case QuestionType.OPEN_TEXT:
      return <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>;

    default:
      return <p className="text-gray-800">{JSON.stringify(answer)}</p>;
  }
}
