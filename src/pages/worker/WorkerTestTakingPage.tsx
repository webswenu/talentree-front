import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTestResponse, useSubmitTest } from '../../hooks/useTestResponses';
import { QuestionType } from '../../types/test.types';
import { SubmitAnswerDto } from '../../types/test-response.types';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const WorkerTestTakingPage = () => {
  const { testResponseId } = useParams<{ testResponseId: string }>();
  const navigate = useNavigate();

  const { data: testResponse, isLoading } = useTestResponse(testResponseId || '');
  const submitMutation = useSubmitTest();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);

  const questions = testResponse?.test?.questions || [];
  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion];

  // Timer
  useEffect(() => {
    if (!testResponse?.test?.duration || testResponse.isCompleted) return;

    const duration = testResponse.test.duration * 60; // minutos a segundos
    const startedAt = testResponse.startedAt ? new Date(testResponse.startedAt).getTime() : Date.now();
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const remaining = Math.max(0, duration - elapsed);

    setTimeLeft(remaining);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testResponse]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: any) => {
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

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsConfirmSubmitOpen(true);
    }
  };

  const handleAutoSubmit = async () => {
    await handleSubmit();
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmSubmitOpen(false);
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!testResponseId) return;

    const submitAnswers: SubmitAnswerDto[] = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || null,
    }));

    try {
      await submitMutation.mutateAsync({
        responseId: testResponseId,
        data: { answers: submitAnswers },
      });
      navigate('/trabajador/postulaciones');
    } catch (err) {
      // Error manejado por el hook
    }
  };

  const renderQuestionInput = () => {
    const currentAnswer = answers[currentQ.id];

    switch (currentQ.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-3">
            {currentQ.options?.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  currentAnswer === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
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
            {['Verdadero', 'Falso'].map((option) => (
              <label
                key={option}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  currentAnswer === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
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
            {currentQ.options?.map((option, idx) => {
              const selectedOptions = (currentAnswer as string[]) || [];
              const isChecked = selectedOptions.includes(option);

              return (
                <label
                  key={idx}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    isChecked ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newSelected = e.target.checked
                        ? [...selectedOptions, option]
                        : selectedOptions.filter((o) => o !== option);
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
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={value}
                    checked={currentAnswer === value}
                    onChange={(e) => handleAnswerChange(Number(e.target.value))}
                    className="sr-only"
                  />
                  <span className="text-2xl font-bold">{value}</span>
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
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={6}
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
            placeholder="Escribe tu respuesta aquí..."
          />
        );

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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Completado</h2>
          <p className="text-gray-600 mb-6">Ya has completado este test.</p>
          <button
            onClick={() => navigate('/trabajador/postulaciones')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ver Mis Postulaciones
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test sin preguntas</h2>
          <p className="text-gray-600 mb-6">Este test no tiene preguntas configuradas.</p>
          <button
            onClick={() => navigate('/trabajador/postulaciones')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{testResponse?.test?.name || 'Test'}</h1>
            <p className="text-sm text-gray-600">
              Pregunta {currentQuestion + 1} de {totalQuestions} • {answeredCount} respondidas
            </p>
          </div>
          {timeLeft !== null && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Tiempo restante</p>
              <p
                className={`text-lg font-semibold ${
                  timeLeft < 300 ? 'text-red-600' : 'text-gray-800'
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
              {currentQ.isRequired && (
                <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                  Obligatoria
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{currentQ.points} puntos</p>
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
              disabled={submitMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentQuestion === totalQuestions - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmSubmitOpen}
        onClose={() => setIsConfirmSubmitOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Envío"
        message={`¿Estás seguro de enviar el test? Has respondido ${answeredCount} de ${totalQuestions} preguntas. No podrás modificar tus respuestas después de enviar.`}
        confirmText="Enviar Test"
        cancelText="Revisar"
        isLoading={submitMutation.isPending}
      />
    </div>
  );
};
