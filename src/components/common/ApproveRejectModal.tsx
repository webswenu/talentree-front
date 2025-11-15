import { useState } from "react";

interface ApproveRejectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: (reason?: string) => void;
    onReject: (reason: string) => void;
    reportTitle: string;
}

export const ApproveRejectModal = ({
    isOpen,
    onClose,
    onApprove,
    onReject,
    reportTitle,
}: ApproveRejectModalProps) => {
    const [action, setAction] = useState<"approve" | "reject" | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (action === "approve") {
            onApprove();
        } else if (action === "reject") {
            onReject(rejectionReason);
        }
        handleClose();
    };

    const handleClose = () => {
        setAction(null);
        setRejectionReason("");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/25 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                {!action ? (
                    <>
                        {/* Selection view */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Revisar Reporte
                            </h2>
                            <p className="text-gray-600">
                                {reportTitle}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setAction("approve")}
                                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >
                                ✓ Aprobar
                            </button>
                            <button
                                onClick={() => setAction("reject")}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                ✗ Rechazar
                            </button>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full mt-3 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                        >
                            Cancelar
                        </button>
                    </>
                ) : action === "approve" ? (
                    <>
                        {/* Approve confirmation */}
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Aprobar Reporte
                            </h2>
                            <p className="text-gray-600">
                                ¿Estás seguro de aprobar este reporte? La empresa podrá verlo.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setAction(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Reject with reason */}
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Rechazar Reporte
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Ingrese el motivo del rechazo (opcional):
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Motivo del rechazo..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setAction(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
