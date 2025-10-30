import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workersService } from "../../services/workers.service";
import { Modal } from "../common/Modal";

interface InviteWorkersModalProps {
    processId: string;
    processName: string;
    onClose: () => void;
}

export const InviteWorkersModal = ({
    processId,
    processName,
    onClose,
}: InviteWorkersModalProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(
        new Set()
    );
    const [invitationNotes, setInvitationNotes] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const queryClient = useQueryClient();

    const { data: workersData, isLoading } = useQuery({
        queryKey: ["workers", "all"],
        queryFn: () => workersService.findAll({ page: 1, limit: 100 }),
    });

    const inviteMutation = useMutation({
        mutationFn: async (workerIds: string[]) => {
            const promises = workerIds.map((workerId) =>
                workersService.applyToProcess({
                    workerId,
                    processId,
                    notes:
                        invitationNotes ||
                        `Invitado por la empresa a postular al proceso: ${processName}`,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["process", processId] });
            queryClient.invalidateQueries({ queryKey: ["processes"] });
            setShowConfirmModal(false);
            setShowSuccessModal(true);
        },
        onError: (error: Error) => {
            console.error("Error al invitar trabajadores:", error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Error al invitar trabajadores"
            );
            setShowConfirmModal(false);
            setShowErrorModal(true);
        },
    });

    const workers = workersData?.data || [];

    const { data: processWorkers } = useQuery({
        queryKey: ["process-workers", processId],
        queryFn: () => workersService.getProcessWorkers(processId),
    });

    const existingWorkerIds = new Set(
        processWorkers?.map((pw) => pw.worker?.id).filter(Boolean) || []
    );

    const availableWorkers = workers.filter(
        (worker) => !existingWorkerIds.has(worker.id)
    );

    const filteredWorkers = availableWorkers.filter((worker) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            worker.firstName.toLowerCase().includes(searchLower) ||
            worker.lastName.toLowerCase().includes(searchLower) ||
            worker.email?.toLowerCase().includes(searchLower) ||
            worker.rut?.toLowerCase().includes(searchLower)
        );
    });

    const handleToggleWorker = (workerId: string) => {
        const newSelected = new Set(selectedWorkers);
        if (newSelected.has(workerId)) {
            newSelected.delete(workerId);
        } else {
            newSelected.add(workerId);
        }
        setSelectedWorkers(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedWorkers.size === filteredWorkers.length) {
            setSelectedWorkers(new Set());
        } else {
            setSelectedWorkers(new Set(filteredWorkers.map((w) => w.id)));
        }
    };

    const handleInvite = () => {
        if (selectedWorkers.size === 0) {
            setErrorMessage("Por favor selecciona al menos un trabajador");
            setShowErrorModal(true);
            return;
        }

        setShowConfirmModal(true);
    };

    const handleConfirmInvite = () => {
        inviteMutation.mutate(Array.from(selectedWorkers));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                Invitar Trabajadores
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Proceso: {processName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o RUT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {filteredWorkers.length} trabajadores disponibles
                        </span>
                        <span className="font-medium text-blue-600">
                            {selectedWorkers.size} seleccionados
                        </span>
                    </div>
                </div>

                {/* Workers List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">
                            Cargando trabajadores...
                        </div>
                    ) : filteredWorkers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                {searchTerm
                                    ? "No se encontraron trabajadores con ese criterio"
                                    : "No hay trabajadores disponibles para invitar"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Select All */}
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedWorkers.size ===
                                            filteredWorkers.length &&
                                        filteredWorkers.length > 0
                                    }
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-3 text-sm font-medium text-gray-900">
                                    Seleccionar todos ({filteredWorkers.length})
                                </label>
                            </div>

                            {/* Workers */}
                            {filteredWorkers.map((worker) => (
                                <div
                                    key={worker.id}
                                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                        selectedWorkers.has(worker.id)
                                            ? "bg-blue-50 border-blue-300"
                                            : "bg-white border-gray-200 hover:bg-gray-50"
                                    }`}
                                    onClick={() =>
                                        handleToggleWorker(worker.id)
                                    }
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedWorkers.has(worker.id)}
                                        onChange={() =>
                                            handleToggleWorker(worker.id)
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {worker.firstName} {worker.lastName}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-xs text-gray-500">
                                                {worker.email || "Sin email"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                RUT: {worker.rut || "N/A"}
                                            </p>
                                            {worker.phone && (
                                                <p className="text-xs text-gray-500">
                                                    Tel: {worker.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {worker.cvUrl && (
                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                            CV
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nota de invitación (opcional)
                    </label>
                    <textarea
                        value={invitationNotes}
                        onChange={(e) => setInvitationNotes(e.target.value)}
                        placeholder="Agrega un mensaje personalizado para los trabajadores invitados..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={inviteMutation.isPending}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleInvite}
                        disabled={
                            selectedWorkers.size === 0 ||
                            inviteMutation.isPending
                        }
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {inviteMutation.isPending
                            ? "Invitando..."
                            : `Invitar ${
                                  selectedWorkers.size > 0
                                      ? `(${selectedWorkers.size})`
                                      : ""
                              }`}
                    </button>
                </div>
            </div>

            {/* Modal de Confirmación */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirmar Invitación"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">❓</span>
                        </div>
                    </div>
                    <p className="text-center text-gray-700">
                        ¿Confirmas que deseas invitar{" "}
                        <strong>{selectedWorkers.size} trabajador(es)</strong> a
                        este proceso?
                    </p>
                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={inviteMutation.isPending}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmInvite}
                            disabled={inviteMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {inviteMutation.isPending
                                ? "Invitando..."
                                : "Aceptar"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Éxito */}
            <Modal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    onClose();
                }}
                title="¡Invitación Exitosa!"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">✓</span>
                        </div>
                    </div>
                    <p className="text-center text-gray-700">
                        <strong>{selectedWorkers.size} trabajador(es)</strong>{" "}
                        invitado(s) exitosamente al proceso
                    </p>
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                onClose();
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Error */}
            <Modal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Error"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">✕</span>
                        </div>
                    </div>
                    <p className="text-center text-gray-700">{errorMessage}</p>
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => setShowErrorModal(false)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
