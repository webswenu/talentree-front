import { SelectionProcess } from '../../types/process.types';

interface ApplyProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  process: SelectionProcess | null;
  isLoading?: boolean;
}

export const ApplyProcessModal = ({
  isOpen,
  onClose,
  onConfirm,
  process,
  isLoading = false,
}: ApplyProcessModalProps) => {
  if (!isOpen || !process) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Postular a Proceso</h2>
                <p className="text-sm text-gray-500">Revisa los detalles antes de continuar</p>
              </div>
            </div>
          </div>

          {/* Process Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{process.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Empresa</p>
                <p className="font-medium text-gray-900">{process.company?.name || 'No especificada'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cargo</p>
                <p className="font-medium text-gray-900">{process.position}</p>
              </div>
              {process.location && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ubicación</p>
                  <p className="font-medium text-gray-900">{process.location}</p>
                </div>
              )}
              {process.endDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cierre de Postulaciones</p>
                  <p className="font-medium text-gray-900">
                    {new Date(process.endDate).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Process Steps */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              ¿Qué sucede después de postular?
            </h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Confirmación de Postulación</p>
                  <p className="text-sm text-gray-600">Tu postulación será registrada de inmediato</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Evaluación de Tests</p>
                  <p className="text-sm text-gray-600">
                    {process.tests && process.tests.length > 0
                      ? `Deberás completar ${process.tests.length} ${process.tests.length === 1 ? 'test' : 'tests'} de evaluación`
                      : 'Recibirás instrucciones sobre los tests a completar'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Revisión del Equipo</p>
                  <p className="text-sm text-gray-600">Nuestros evaluadores revisarán tu perfil y resultados</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notificación de Resultados</p>
                  <p className="text-sm text-gray-600">Te notificaremos sobre el estado de tu postulación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tests Info */}
          {process.tests && process.tests.length > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-amber-900">Tests Requeridos</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Este proceso incluye {process.tests.length} {process.tests.length === 1 ? 'test' : 'tests'} que deberás completar.
                    Recibirás una notificación cuando estén disponibles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Postulando...
                </>
              ) : (
                <>
                  Confirmar Postulación
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
