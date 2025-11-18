import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProcesses } from "../../hooks/useProcesses";
import { useApplyToProcess, useWorkerProcesses } from "../../hooks/useWorkers";
import { useAuthStore } from "../../store/authStore";
import { ProcessStatus } from "../../types/process.types";
import { ApplyProcessModal } from "../../components/worker/ApplyProcessModal";
import { Modal } from "../../components/common/Modal";
import { toast } from "../../utils/toast";

export const WorkerProcessesPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const workerId = user?.worker?.id;

    const { data: processesData, isLoading } = useProcesses();
    const processes = processesData?.data || [];

    const { data: myApplications } = useWorkerProcesses(workerId || "");
    const applyMutation = useApplyToProcess();

    const [selectedProcessId, setSelectedProcessId] = useState<string | null>(
        null
    );
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const handleApplyClick = (processId: string) => {
        setSelectedProcessId(processId);
        setIsConfirmOpen(true);
    };

    const handleConfirmApply = async () => {
        if (!selectedProcessId) {
            toast.error("No hay proceso seleccionado");
            return;
        }

        if (!workerId) {
            toast.error("Error: No tienes un perfil de trabajador asociado. Por favor contacta al administrador.");
            return;
        }

        try {
            await applyMutation.mutateAsync({
                workerId,
                processId: selectedProcessId,
            });
            setIsConfirmOpen(false);
            setSelectedProcessId(null);
            setIsSuccessModalOpen(true);
        } catch (err) {
            toast.error("Error al postular. Por favor intenta nuevamente.");
        }
    };

    const handleCancelApply = () => {
        setIsConfirmOpen(false);
        setSelectedProcessId(null);
    };

    const isAlreadyApplied = (processId: string) => {
        return myApplications?.some((app) => app.process.id === processId);
    };

    if (isLoading) return <div className="text-center py-8">Cargando...</div>;

    const activeProcesses =
        processes?.filter((p) => p.status === ProcessStatus.ACTIVE) || [];
    const selectedProcess =
        processes?.find((p) => p.id === selectedProcessId) || null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    Procesos Disponibles
                </h1>
                <span className="text-sm text-gray-500">
                    {activeProcesses.length}{" "}
                    {activeProcesses.length === 1 ? "proceso" : "procesos"}{" "}
                    disponibles
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProcesses.map((process) => {
                    const alreadyApplied = isAlreadyApplied(process.id);

                    return (
                        <div
                            key={process.id}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">
                                    {process.name}
                                </h3>
                                {alreadyApplied && (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Aplicado
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {process.description || "Sin descripción"}
                            </p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Cargo</span>
                                    <span className="font-medium">
                                        {process.position}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">
                                        Empresa
                                    </span>
                                    <span className="font-medium">
                                        {process.company?.name ||
                                            "No especificada"}
                                    </span>
                                </div>
                                {process.location && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            Ubicación
                                        </span>
                                        <span className="font-medium">
                                            {process.location}
                                        </span>
                                    </div>
                                )}
                                {process.vacancies && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            Vacantes
                                        </span>
                                        <span className="font-medium">
                                            {process.vacancies}
                                        </span>
                                    </div>
                                )}
                                {process.endDate && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            Cierre
                                        </span>
                                        <span className="font-medium">
                                            {new Date(
                                                process.endDate
                                            ).toLocaleDateString("es-CL")}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleApplyClick(process.id)}
                                disabled={
                                    alreadyApplied || applyMutation.isPending
                                }
                                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                                    alreadyApplied
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                                {alreadyApplied ? "Ya Aplicaste" : "Postular"}
                            </button>
                        </div>
                    );
                })}
            </div>

            {activeProcesses.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600">
                        No hay procesos disponibles en este momento
                    </p>
                </div>
            )}

            <ApplyProcessModal
                isOpen={isConfirmOpen}
                onClose={handleCancelApply}
                onConfirm={handleConfirmApply}
                process={selectedProcess}
                isLoading={applyMutation.isPending}
            />

            {/* Modal de éxito */}
            <Modal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="¡Postulación Exitosa!"
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg
                            className="h-10 w-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Tu postulación ha sido registrada
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Puedes revisar el estado de tu postulación en la sección
                        "Mis Aplicaciones"
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => {
                                setIsSuccessModalOpen(false);
                                navigate("/trabajador/postulaciones");
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ver Mis Aplicaciones
                        </button>
                        <button
                            onClick={() => setIsSuccessModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Continuar Navegando
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
