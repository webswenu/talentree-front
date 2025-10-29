import { useParams, useNavigate } from 'react-router-dom';
import { useTestResponse } from '../../hooks/useTestResponses';
import { TestTypeLabels, TestTypeColors, QuestionType } from '../../types/test.types';

export const WorkerTestResultsPage = () => {
  const { testResponseId } = useParams<{ testResponseId: string }>();
  const navigate = useNavigate();

  const { data: testResponse, isLoading } = useTestResponse(testResponseId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando resultados...</div>
      </div>
    );
  }

  if (!testResponse) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test no encontrado</h2>
          <button
            onClick={() => navigate('/trabajador/postulaciones')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a Postulaciones
          </button>
        </div>
      </div>
    );
  }

  const scorePercent = testResponse.maxScore
    ? Math.round(((testResponse.score || 0) / testResponse.maxScore) * 100)
    : 0;

  const answersMap = new Map(testResponse.answers?.map((a) => [a.question.id, a]) || []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/trabajador/postulaciones')}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Resultados del Test</h1>
      </div>

      {/* Test Info Card */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{testResponse.test?.name}</h2>
            <p className="text-gray-600 mt-1">{testResponse.test?.description}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              TestTypeColors[testResponse.test?.type]
            }`}
          >
            {TestTypeLabels[testResponse.test?.type]}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-gray-500 text-sm">Puntaje Obtenido</p>
            <p className="text-2xl font-bold text-gray-800">{testResponse.score || 0}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Puntaje Máximo</p>
            <p className="text-2xl font-bold text-gray-800">{testResponse.maxScore || 0}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Porcentaje</p>
            <p
              className={`text-2xl font-bold ${
                testResponse.passed ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {scorePercent}%
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Estado</p>
            <span
              className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${
                testResponse.passed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {testResponse.passed ? 'Aprobado' : 'No Aprobado'}
            </span>
          </div>
        </div>

        {testResponse.completedAt && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              Completado el{' '}
              {new Date(testResponse.completedAt).toLocaleString('es-CL', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
          </div>
        )}

        {testResponse.evaluatorNotes && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Comentarios del Evaluador:</p>
            <p className="text-gray-600">{testResponse.evaluatorNotes}</p>
          </div>
        )}
      </div>

      {/* Questions & Answers */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Preguntas y Respuestas</h3>

        {testResponse.test?.questions?.map((question, idx) => {
          const answer = answersMap.get(question.id);

          return (
            <div key={question.id} className="bg-white rounded-lg shadow p-6 space-y-4">
              {/* Question */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-base font-medium text-gray-800">
                    {idx + 1}. {question.question}
                  </h4>
                  <span className="text-sm text-gray-500">{question.points} pts</span>
                </div>
              </div>

              {/* Answer */}
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                <p className="text-sm font-medium text-gray-700 mb-1">Tu respuesta:</p>
                {renderAnswer(question.type, answer?.answer)}
              </div>

              {/* Correct Answer (if available) */}
              {question.type !== QuestionType.OPEN_TEXT &&
                question.correctAnswers &&
                question.correctAnswers.length > 0 && (
                  <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                    <p className="text-sm font-medium text-gray-700 mb-1">Respuesta correcta:</p>
                    <p className="text-gray-800">
                      {question.correctAnswers.join(', ')}
                    </p>
                  </div>
                )}

              {/* Score & Feedback */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      answer?.isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {answer?.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                  </span>
                  <span className="text-sm text-gray-600">
                    Puntaje: {answer?.score || 0} / {question.points}
                  </span>
                </div>
              </div>

              {answer?.evaluatorComment && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Comentario del Evaluador:</p>
                  <p className="text-sm text-gray-600">{answer.evaluatorComment}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
