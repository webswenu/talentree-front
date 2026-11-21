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
 * Reabre un test que quedó incompleto (p. ej. se le acabó el tiempo al
 * postulante) y, opcionalmente, le avisa por correo con un mensaje del admin.
 */
export const ReactivarTestModal = ({ fila, nombrePostulante, correoPostulante, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [enviarCorreo, setEnviarCorreo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const { respuesta, proceso } = fila;
    const nombreTest = respuesta.fixedTest?.name ?? respuesta.test?.name ?? "este test";

    const mutation = useMutation({
        mutationFn: () =>
            testResponsesService.reactivar(respuesta.id, {
                enviarCorreo,
                mensaje: mensaje.trim() || undefined,
            }),
        onSuccess: (r) => {
            queryClient.invalidateQueries({ queryKey: ["worker"] });
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            const guardadas =
                r.respuestasConservadas > 0
                    ? ` Conserva ${r.respuestasConservadas} respuestas.`
                    : "";
            if (r.correoEnviado) {
                toast.success(`Test reactivado y correo enviado a ${nombrePostulante}.${guardadas}`);
            } else if (r.correoError) {
                toast.error(`Test reactivado, pero sin correo: ${r.correoError}`);
            } else {
                toast.success(`Test reactivado.${guardadas} Recuerda avisarle a ${nombrePostulante}.`);
            }
            onClose();
        },
        onError: (err) => {
            toast.error(getApiErrorMessage(err, "No se pudo reactivar el test. Intenta nuevamente."));
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
                aria-labelledby="reactivar-test-titulo"
            >
                <div className="p-6">
                    <h3 id="reactivar-test-titulo" className="text-xl font-semibold text-gray-900 mb-1">
                        Reactivar test
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        <strong>{nombreTest}</strong> de {nombrePostulante}
                        {proceso ? <> · {proceso}</> : null}
                    </p>

                    <ul className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 list-disc pl-8 space-y-1">
                        <li>Lo que ya respondió se conserva; sigue desde la primera pregunta pendiente.</li>
                        <li>Si el test tiene tiempo, el reloj parte de cero cuando vuelva a entrar.</li>
                        <li>Se borra el informe sin aprobar de esta postulación; se genera de nuevo al terminar.</li>
                    </ul>

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
                                Le explica paso a paso cómo entrar y continuar el test.
                            </span>
                        </span>
                    </label>

                    {enviarCorreo && (
                        <div className="mb-4">
                            <label htmlFor="reactivar-mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                                Mensaje para el postulante (opcional)
                            </label>
                            <textarea
                                id="reactivar-mensaje"
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                maxLength={2000}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder="Ej: Don Juan, le reabrimos el test para que lo termine con calma. Cualquier duda, llámenos al..."
                            />
                        </div>
                    )}

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
                            disabled={mutation.isPending}
                            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                        >
                            {mutation.isPending ? "Reactivando..." : "Reactivar test"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
