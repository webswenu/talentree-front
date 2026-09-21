import { useState } from "react";
import { ModalPortal } from "./ModalPortal";

interface ApproveRejectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: (reason?: string) => void;
    onReject: (reason: string) => void;
    reportTitle: string;
}

/**
 * Revisión de un informe de evaluación (el PDF que sube el evaluador).
 *
 * Este modal decide sobre el INFORME, no sobre el postulante. Antes decía
 * "Aprobar / Rechazar" a secas y tenía un campo de motivo, así que la admin
 * escribía aquí el mensaje que quería mandarle al candidato y creía que lo
 * había rechazado. Ahora el rechazo se llama "Devolver", cada pantalla dice
 * en una línea a quién afecta y a quién no, y el motivo se presenta como lo
 * que es: una instrucción para el evaluador.
 */
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

        <ModalPortal onClose={onClose}>
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                {/* Botón X para cerrar */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {!action ? (
                    <>
                        {/* Selection view */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Revisar informe de evaluación
                            </h2>
                            <p className="text-gray-600">
                                {reportTitle}
                            </p>
                            <p className="text-sm text-gray-500 mt-3">
                                Esta decisión es sobre el <strong>informe</strong>, no sobre el
                                postulante. Al postulante se le aprueba o rechaza después,
                                con el informe ya aprobado.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setAction("approve")}
                                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >
                                ✓ Aprobar informe
                            </button>
                            <button
                                onClick={() => setAction("reject")}
                                className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                            >
                                ↩ Devolver informe
                            </button>
                        </div>
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
                                Aprobar informe
                            </h2>
                            <p className="text-gray-600">
                                La empresa podrá descargarlo. A continuación podrás aprobar o
                                rechazar al postulante.
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
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Devolver informe al evaluador
                            </h2>
                            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-left">
                                Esto <strong>no rechaza al postulante ni le envía ningún aviso</strong>.
                                Solo el evaluador verá el motivo, para subir una versión corregida.
                            </p>
                            <p className="text-gray-600 mb-2 text-left text-sm">
                                Qué debe corregir el evaluador (opcional):
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Ej: falta la conclusión de riesgo, revisar el puntaje del DISC..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Devolver informe
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>

        </ModalPortal>
    );
};
