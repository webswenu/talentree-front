import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { testResponsesService } from "../../services/test-responses.service";
import { RespuestaConProceso } from "../common/TestsRendidos";
import { toast } from "../../utils/toast";
import { getApiErrorMessage } from "../../utils/apiError";

interface Props {
    fila: RespuestaConProceso;
    nombrePostulante: string;
    correoPostulante?: string;
    onClose: () => void;
}

/**
 * Solo admin: reinicia UN test de una persona dentro de un proceso. Se borran
 * sus respuestas y la persona lo rinde de nuevo desde cero; los demás tests
 * del proceso no se tocan. A diferencia de «Reactivar», no conserva nada.
 */
export const ReiniciarTestModal = ({ fila, nombrePostulante, correoPostulante, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [motivo, setMotivo] = useState("");
    const [confirmado, setConfirmado] = useState(false);
    const [enviarCorreo, setEnviarCorreo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const { respuesta, proceso } = fila;
    const nombreTest = respuesta.fixedTest?.name ?? respuesta.test?.name ?? "este test";

    const motivoValido = motivo.trim().length >= 3;

    const mutation = useMutation({
        mutationFn: () =>
            testResponsesService.reiniciarTest(respuesta.id, {
                motivo: motivo.trim(),
                enviarCorreo,
                mensaje: mensaje.trim() || undefined,
            }),
        onSuccess: (r) => {
            queryClient.invalidateQueries({ queryKey: ["worker"] });
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            const informes = r.informesBorrados > 0 ? ` Se borró el informe del proceso.` : "";
            if (r.correoEnviado) {
                toast.success(`Test reiniciado y correo enviado a ${nombrePostulante}.${informes}`);
            } else if (r.correoError) {
                toast.error(`Test reiniciado, pero sin correo: ${r.correoError}`);
            } else {
                toast.success(`Test reiniciado.${informes} Recuerda avisarle a ${nombrePostulante}.`);
            }
            onClose();
        },
        onError: (err) => {
            toast.error(getApiErrorMessage(err, "No se pudo reiniciar el test. Intenta nuevamente."));
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
                aria-labelledby="reiniciar-test-titulo"
            >
                <div className="p-6">
                    <h3 id="reiniciar-test-titulo" className="text-xl font-semibold text-gray-900 mb-1">
                        Reiniciar test
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {nombrePostulante} · <strong>{nombreTest}</strong>
                        {proceso ? <> · {proceso}</> : null}
                    </p>

                    <ul className="text-sm text-gray-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 list-disc pl-8 space-y-1">
                        <li>Se borran <strong>las respuestas y el resultado de este test</strong>. Los demás tests del proceso no se tocan.</li>
                        <li>Se borra el informe de este proceso, <strong>también si ya está aprobado</strong>; se genera otro cuando termine.</li>
                        <li>La persona rinde el test desde la primera pregunta, con el tiempo completo.</li>
                        <li>El intento anterior queda respaldado en la auditoría.</li>
                    </ul>

                    <div className="mb-4">
                        <label htmlFor="reiniciar-test-motivo" className="block text-sm font-medium text-gray-700 mb-1">
                            Motivo del reinicio <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            id="reiniciar-test-motivo"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            maxLength={1000}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Ej: se le acabó el tiempo por un problema de conexión..."
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
                                Le explica que debe rendir este test de nuevo desde el principio.
                            </span>
                        </span>
                    </label>

                    {enviarCorreo && (
                        <div className="mb-4">
                            <label htmlFor="reiniciar-test-mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                                Mensaje para la persona (opcional)
                            </label>
                            <textarea
                                id="reiniciar-test-mensaje"
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
                        <span>Entiendo que las respuestas de este test se borran.</span>
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
                            {mutation.isPending ? "Reiniciando..." : "Reiniciar test"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
