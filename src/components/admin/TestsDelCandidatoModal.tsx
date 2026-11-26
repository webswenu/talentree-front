import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workersService } from "../../services/workers.service";
import { workerKeys } from "../../hooks/useWorkers";
import { RespuestaConProceso, TestsRendidos } from "../common/TestsRendidos";
import { ReactivarTestModal } from "./ReactivarTestModal";
import { ReiniciarTestModal } from "./ReiniciarTestModal";
import { ModalPortal } from "../common/ModalPortal";

interface Props {
    workerId: string;
    processId: string;
    onClose: () => void;
}

/**
 * Solo admin: desde Procesos → Candidatos, los tests de UNA persona en ESTE
 * proceso, con «Reactivar» y «Reiniciar». Es la misma tabla de la ficha del
 * trabajador, filtrada al proceso: antes esas acciones solo estaban en la
 * ficha y la admin las buscaba aquí.
 */
export const TestsDelCandidatoModal = ({ workerId, processId, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [porReactivar, setPorReactivar] = useState<RespuestaConProceso | null>(null);
    const [porReiniciar, setPorReiniciar] = useState<RespuestaConProceso | null>(null);

    const { data: worker, isLoading } = useQuery({
        queryKey: ["worker", workerId],
        queryFn: () => workersService.getById(workerId),
    });

    const soloEsteProceso = worker
        ? {
              ...worker,
              workerProcesses: (worker.workerProcesses ?? []).filter(
                  (wp) => wp.process?.id === processId
              ),
          }
        : null;

    // Tras reactivar o reiniciar cambia el estado de la postulación: se
    // refresca la tabla de candidatos de atrás.
    const cerrarAccion = () => {
        setPorReactivar(null);
        setPorReiniciar(null);
        queryClient.invalidateQueries({ queryKey: workerKeys.processWorkers(processId) });
    };

    const nombre = worker ? `${worker.firstName} ${worker.lastName}` : "";

    return (
        <ModalPortal onClose={porReactivar || porReiniciar ? undefined : onClose}>
            <div
                className="fixed inset-0 bg-black/25 flex items-center justify-center z-40 p-4 overflow-y-auto"
                onClick={onClose}
            >
                <div
                    className="bg-gray-50 rounded-lg shadow-xl max-w-3xl w-full"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-label={`Tests de ${nombre}`}
                >
                    <div className="flex items-center justify-between px-6 pt-5">
                        <h3 className="text-lg font-semibold text-gray-900">{nombre || "Tests"}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-800 text-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                    <div className="p-4">
                        {isLoading || !soloEsteProceso ? (
                            <p className="text-gray-500 p-4">Cargando tests...</p>
                        ) : (
                            <TestsRendidos
                                worker={soloEsteProceso}
                                onReactivar={setPorReactivar}
                                onReiniciar={setPorReiniciar}
                            />
                        )}
                    </div>
                </div>
            </div>
            {porReactivar && worker && (
                <ReactivarTestModal
                    fila={porReactivar}
                    nombrePostulante={nombre}
                    correoPostulante={worker.email}
                    onClose={cerrarAccion}
                />
            )}
            {porReiniciar && worker && (
                <ReiniciarTestModal
                    fila={porReiniciar}
                    nombrePostulante={nombre}
                    correoPostulante={worker.email}
                    onClose={cerrarAccion}
                />
            )}
        </ModalPortal>
    );
};
