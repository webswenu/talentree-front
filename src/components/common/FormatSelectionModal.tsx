interface FormatSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectFormat: (format: 'pdf' | 'docx') => void;
    hasPdf: boolean;
    hasDocx: boolean;
}

export const FormatSelectionModal = ({
    isOpen,
    onClose,
    onSelectFormat,
    hasPdf,
    hasDocx,
}: FormatSelectionModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/25 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Seleccionar Formato
                    </h2>
                    <p className="text-gray-600">
                        ¿Qué formato deseas descargar?
                    </p>
                </div>

                <div className="space-y-3">
                    {hasDocx && (
                        <button
                            onClick={() => {
                                onSelectFormat('docx');
                                onClose();
                            }}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                            </svg>
                            DOCX (Word)
                        </button>
                    )}
                    {hasPdf && (
                        <button
                            onClick={() => {
                                onSelectFormat('pdf');
                                onClose();
                            }}
                            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                            </svg>
                            PDF
                        </button>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};
