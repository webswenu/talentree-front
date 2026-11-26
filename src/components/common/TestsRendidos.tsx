import { Worker } from "../../types/worker.types";
import { TestResponse } from "../../types/test-response.types";

/**
 * Las respuestas de test de un trabajador, en una sola lista.
 *
 * Cuelgan de cada postulación (`workerProcesses[].testResponses`), no del
 * trabajador. Las tres fichas —admin, empresa y evaluador— leían
 * `worker.testResponses`, un campo plano que el backend no devuelve, así que
 * el contador "Tests Realizados" marcaba 0 aunque la persona hubiera rendido
 * todos sus tests.
 */
export interface RespuestaConProceso {
    respuesta: TestResponse;
    proceso: string | null;
}

export function respuestasDeTestDelTrabajador(
    worker?: Worker | null
): RespuestaConProceso[] {
    return (worker?.workerProcesses ?? []).flatMap((wp) =>
        (wp.testResponses ?? []).map((respuesta) => ({
            respuesta,
            proceso: wp.process?.name ?? null,
        }))
    );
}

const ETIQUETA_DE_ESTADO: Record<string, { texto: string; clase: string }> = {
    completed: { texto: "Completado", clase: "bg-green-100 text-green-800" },
    in_progress: { texto: "En curso", clase: "bg-yellow-100 text-yellow-800" },
    pending: { texto: "Pendiente", clase: "bg-gray-100 text-gray-700" },
    insufficient_answers: {
        texto: "Incompleto",
        clase: "bg-orange-100 text-orange-800",
    },
};

/** Etiqueta del estado. Un test abierto aún no tiene `status`. */
function etiquetaDe(respuesta: TestResponse) {
    if (!respuesta.status && !respuesta.isCompleted) {
        return ETIQUETA_DE_ESTADO.in_progress;
    }
    if (
        respuesta.status === "insufficient_answers" &&
        respuesta.metadata?.motivo === "tiempo"
    ) {
        return {
            texto: "Incompleto (tiempo agotado)",
            clase: ETIQUETA_DE_ESTADO.insufficient_answers.clase,
        };
    }
    return (
        ETIQUETA_DE_ESTADO[respuesta.status ?? ""] ?? {
            texto: respuesta.status ?? "—",
            clase: "bg-gray-100 text-gray-700",
        }
    );
}

/** Estados desde los que el admin puede reactivar un test. */
const ESTADOS_REACTIVABLES = ["insufficient_answers", "abandoned"];

/**
 * Tabla compacta con los tests que rindió la persona.
 *
 * `onReactivar` y `onReiniciar` solo los pasa la ficha del admin: agregan la
 * columna de acciones. «Reactivar» aparece en los tests incompletos (conserva
 * las respuestas); «Reiniciar» en todos (las borra y se rinde desde cero).
 */
export const TestsRendidos = ({
    worker,
    onReactivar,
    onReiniciar,
}: {
    worker?: Worker | null;
    onReactivar?: (fila: RespuestaConProceso) => void;
    onReiniciar?: (fila: RespuestaConProceso) => void;
}) => {
    const conAcciones = !!onReactivar || !!onReiniciar;
    const respuestas = respuestasDeTestDelTrabajador(worker);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Tests Rendidos
            </h2>

            {respuestas.length === 0 ? (
                <p className="text-gray-500">
                    Esta persona todavía no ha rendido ningún test.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-600">
                                <th className="py-2 pr-6 font-medium">Test</th>
                                <th className="py-2 pr-6 font-medium">
                                    Proceso
                                </th>
                                <th className="py-2 pr-6 font-medium">
                                    Estado
                                </th>
                                <th className="py-2 pr-6 font-medium">Fecha</th>
                                {conAcciones && (
                                    <th className="py-2 font-medium">Acción</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {respuestas.map((fila) => {
                                const { respuesta, proceso } = fila;
                                const estado = etiquetaDe(respuesta);
                                const fecha = respuesta.completedAt;

                                return (
                                    <tr key={respuesta.id} className="border-t">
                                        <td className="py-2 pr-6 font-medium text-gray-800">
                                            {respuesta.fixedTest?.name ??
                                                respuesta.test?.name ??
                                                "Test sin nombre"}
                                        </td>
                                        <td className="py-2 pr-6 text-gray-700">
                                            {proceso ?? "—"}
                                        </td>
                                        <td className="py-2 pr-6">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${estado.clase}`}
                                            >
                                                {estado.texto}
                                            </span>
                                        </td>
                                        <td className="py-2 pr-6 text-gray-700 tabular-nums">
                                            {fecha
                                                ? new Date(
                                                      fecha
                                                  ).toLocaleDateString("es-CL")
                                                : "—"}
                                        </td>
                                        {conAcciones && (
                                            <td className="py-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {onReactivar &&
                                                        ESTADOS_REACTIVABLES.includes(
                                                            respuesta.status ?? ""
                                                        ) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onReactivar(fila)}
                                                                title="Reabre el test conservando lo que ya respondió"
                                                                className="px-3 py-1 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                                                            >
                                                                Reactivar
                                                            </button>
                                                        )}
                                                    {onReiniciar && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onReiniciar(fila)}
                                                            title="Borra las respuestas de este test para que lo rinda desde cero"
                                                            className="px-3 py-1 text-xs font-semibold rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                                                        >
                                                            Reiniciar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
