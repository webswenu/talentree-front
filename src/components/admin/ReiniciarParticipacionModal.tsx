import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { testResponsesService } from "../../services/test-responses.service";
import { toast } from "../../utils/toast";
import { getApiErrorMessage } from "../../utils/apiError";

interface Props {
    workerProcessId: string;
    nombreProceso: string;
    nombrePostulante: string;
    correoPostulante?: string;
    onClose: () => void;
}

/**
 * Solo admin: reinicia la participación de una persona en un proceso. Se
 * borran todos sus tests e informes de ese proceso para que los rinda de nuevo
 * desde cero. El intento anterior queda respaldado en la auditoría.
 */
export const ReiniciarParticipacionModal = ({
    workerProcessId,
    nombreProceso,
    nombrePostulante,
    correoPostulante,
    onClose,
}: Props) => {
    const queryClient = useQueryClient();
    const [motivo, setMotivo] = useState("");
    const [confirmado, setConfirmado] = useState(false);
    const [enviarCorreo, setEnviarCorreo] = useState(true);
    const [mensaje, setMensaje] = useState("");

    const motivoValido = motivo.trim().length >= 3;

    const mutation = useMutation({
        mutationFn: () =>
            testResponsesService.reiniciarParticipacion(workerProcessId, {
                motivo: motivo.trim(),
                enviarCorreo,
                mensaje: mensaje.trim() || undefined,
            }),
        onSuccess: (r) => {
            queryClient.invalidateQueries({ queryKey: ["worker"] });
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            const detalle = `${r.testsBorrados} test(s) y ${r.informesBorrados} informe(s) borrados.`;
            if (r.correoEnviado) {
                toast.success(`Participación reiniciada y correo enviado a ${nombrePostulante}. ${detalle}`);
            } else if (r.correoError) {
                toast.error(`Participación reiniciada, pero sin correo: ${r.correoError}`);
            } else {
                toast.success(`Participación reiniciada. ${detalle} Recuerda avisarle a ${nombrePostulante}.`);
            }
            onClose();
        },
        onError: (err) => {
            toast.error(getApiErrorMessage(err, "No se pudo reiniciar la participación. Intenta nuevamente."));
        },
    });

    return (
        <div
            className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => !mutation.isPending && onClose()}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-labelledby="reiniciar-participacion-titulo"
            >
                <div className="p-6">
                    <h3 id="reiniciar-participacion-titulo" className="text-xl font-semibold text-gray-900 mb-1">
                        Reiniciar participación
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {nombrePostulante} · <strong>{nombreProceso}</strong>
                    </p>

                    <ul className="text-sm text-gray-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 list-disc pl-8 space-y-1">
                        <li>Se borran <strong>todos los tests</strong> de este proceso, con sus respuestas y puntajes.</li>
                        <li>Se borran los informes de este proceso, <strong>también si ya está aprobado</strong>.</li>
                        <li>La postulación vuelve a «Pendiente» y la persona rinde los tests desde cero.</li>
                        <li>Los videos se conservan. El intento anterior queda respaldado en la auditoría.</li>
                    </ul>

                    <div className="mb-4">
                        <label htmlFor="reiniciar-motivo" className="block text-sm font-medium text-gray-700 mb-1">
                            Motivo del reinicio <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            id="reiniciar-motivo"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            maxLength={1000}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Ej: la empresa pidió repetir la evaluación; se le cortó la conexión a mitad del test..."
                        />
                    </div>

                    <label className="flex items-start gap-2 text-sm text-gray-800 mb-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enviarCorreo}
                            onChange={(e) => setEnviarCorreo(e.target.checked)}
                            className="mt-0.5"
                        />
                        <span>
                            Avisar por correo
                            {correoPostulante ? <> a <strong>{correoPostulante}</strong></> : null}
                            <span className="block text-gray-500">
                                Le explica que debe volver a rendir los tests desde el principio.
                            </span>
                        </span>
                    </label>

                    {enviarCorreo && (
                        <div className="mb-4">
                            <label htmlFor="reiniciar-mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                                Mensaje para la persona (opcional)
                            </label>
                            <textarea
                                id="reiniciar-mensaje"
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                maxLength={2000}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    <label className="flex items-start gap-2 text-sm text-gray-800 mb-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={confirmado}
                            onChange={(e) => setConfirmado(e.target.checked)}
                            className="mt-0.5"
                        />
                        <span>Entiendo que los tests e informes de este proceso se borran.</span>
                    </label>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={mutation.isPending}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={() => mutation.mutate()}
                            disabled={mutation.isPending || !confirmado || !motivoValido}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {mutation.isPending ? "Reiniciando..." : "Reiniciar participación"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
