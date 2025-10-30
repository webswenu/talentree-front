import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { processService } from "../../services/process.service";
import {
    useProcessWorkers,
    useUpdateWorkerProcessStatus,
} from "../../hooks/useWorkers";
import {
    WorkerStatus,
    WorkerStatusLabels,
    WorkerStatusColors,
} from "../../types/worker.types";
import { ConfirmModal } from "../../components/common/ConfirmModal";

export const EvaluatorProcessDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: process, isLoading: processLoading } = useQuery({
        queryKey: ["process", id],
        queryFn: () => processService.getById(id!),
        enabled: !!id,
    });

    const { data: candidates, isLoading: candidatesLoading } =
        useProcessWorkers(id || "");
    const updateStatusMutation = useUpdateWorkerProcessStatus();

    const [activeTab, setActiveTab] = useState<
        "info" | "candidates" | "pending"
    >("candidates");
    type CandidateType = {
        id: string;
        worker?: {
            firstName: string;
            lastName: string;
        };
    };

    const [selectedCandidate, setSelectedCandidate] =
        useState<CandidateType | null>(null);
    const [newStatus, setNewStatus] = useState<WorkerStatus | null>(null);
    const [isConfirmStatusOpen, setIsConfirmStatusOpen] = useState(false);
    const [statusNotes, setStatusNotes] = useState("");

    const handleStatusChange = (
        candidate: CandidateType,
        status: WorkerStatus
    ) => {
        setSelectedCandidate(candidate);
        setNewStatus(status);
        setStatusNotes("");
        setIsConfirmStatusOpen(true);
    };

    const handleConfirmStatusChange = async () => {
        if (!selectedCandidate || !newStatus) return;

        try {
            await updateStatusMutation.mutateAsync({
                id: selectedCandidate.id,
                data: {
                    status: newStatus,
                    notes: statusNotes || undefined,
                },
            });
            setIsConfirmStatusOpen(false);
            setSelectedCandidate(null);
            setNewStatus(null);
            setStatusNotes("");
        } catch (err) {
            console.error(err);
        }
    };

    if (processLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando proceso...</div>
            </div>
        );
    }

    const stats = {
        pending:
            candidates?.filter((c) => c.status === WorkerStatus.PENDING)
                .length || 0,
        inProcess:
            candidates?.filter((c) => c.status === WorkerStatus.IN_PROCESS)
                .length || 0,
        approved:
            candidates?.filter((c) => c.status === WorkerStatus.APPROVED)
                .length || 0,
        rejected:
            candidates?.filter((c) => c.status === WorkerStatus.REJECTED)
                .length || 0,
        total: candidates?.length || 0,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate("/evaluador/procesos")}
                        className="text-sm text-gray-600 hover:text-gray-900 mb-2"
                    >
                        ← Volver a procesos
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {process?.name}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {process?.company?.name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-500">
                        Pendientes
                    </h3>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">
                        {stats.pending}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-500">
                        En Proceso
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                        {stats.inProcess}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-500">
                        Aprobados
                    </h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        {stats.approved}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-500">
                        Rechazados
                    </h3>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                        {stats.rejected}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-medium text-gray-500">Total</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                        {stats.total}
                    </p>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("candidates")}
                        className={`py-4 px-1 text-sm font-medium ${
                            activeTab === "candidates"
                                ? "border-b-2 border-blue-500 text-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Candidatos ({stats.total})
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`py-4 px-1 text-sm font-medium ${
                            activeTab === "pending"
                                ? "border-b-2 border-blue-500 text-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Pendientes ({stats.pending})
                    </button>
                    <button
                        onClick={() => setActiveTab("info")}
                        className={`py-4 px-1 text-sm font-medium ${
                            activeTab === "info"
                                ? "border-b-2 border-blue-500 text-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Información
                    </button>
                </nav>
            </div>

            {activeTab === "info" && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Información del Proceso
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <span className="font-medium text-gray-700">
                                Descripción:
                            </span>
                            <p className="text-gray-600 mt-1">
                                {process?.description || "Sin descripción"}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">
                                Cargo:
                            </span>
                            <p className="text-gray-600">{process?.position}</p>
                        </div>
                        {process?.location && (
                            <div>
                                <span className="font-medium text-gray-700">
                                    Ubicación:
                                </span>
                                <p className="text-gray-600">
                                    {process?.location}
                                </p>
                            </div>
                        )}
                        {process?.vacancies && (
                            <div>
                                <span className="font-medium text-gray-700">
                                    Vacantes:
                                </span>
                                <p className="text-gray-600">
                                    {process?.vacancies}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(activeTab === "candidates" || activeTab === "pending") && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Candidato
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Aplicación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Puntaje
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {candidatesLoading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        Cargando candidatos...
                                    </td>
                                </tr>
                            ) : candidates && candidates.length > 0 ? (
                                candidates
                                    .filter(
                                        (c) =>
                                            activeTab === "candidates" ||
                                            c.status === WorkerStatus.PENDING
                                    )
                                    .map((candidate) => (
                                        <tr
                                            key={candidate.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {
                                                        candidate.worker
                                                            ?.firstName
                                                    }{" "}
                                                    {candidate.worker?.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {candidate.worker?.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {candidate.appliedAt
                                                    ? new Date(
                                                          candidate.appliedAt
                                                      ).toLocaleDateString(
                                                          "es-CL"
                                                      )
                                                    : new Date(
                                                          candidate.createdAt
                                                      ).toLocaleDateString(
                                                          "es-CL"
                                                      )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        WorkerStatusColors[
                                                            candidate.status
                                                        ]
                                                    }`}
                                                >
                                                    {
                                                        WorkerStatusLabels[
                                                            candidate.status
                                                        ]
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {candidate.totalScore !==
                                                    null &&
                                                candidate.totalScore !==
                                                    undefined
                                                    ? `${candidate.totalScore}%`
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                {candidate.status ===
                                                    WorkerStatus.IN_PROCESS && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    candidate,
                                                                    WorkerStatus.APPROVED
                                                                )
                                                            }
                                                            disabled={
                                                                updateStatusMutation.isPending
                                                            }
                                                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                        >
                                                            Aprobar
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    candidate,
                                                                    WorkerStatus.REJECTED
                                                                )
                                                            }
                                                            disabled={
                                                                updateStatusMutation.isPending
                                                            }
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                        >
                                                            Rechazar
                                                        </button>
                                                    </>
                                                )}
                                                {candidate.status ===
                                                    WorkerStatus.PENDING && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                candidate,
                                                                WorkerStatus.IN_PROCESS
                                                            )
                                                        }
                                                        disabled={
                                                            updateStatusMutation.isPending
                                                        }
                                                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                                    >
                                                        Revisar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        {activeTab === "pending"
                                            ? "No hay candidatos pendientes"
                                            : "No hay candidatos en este proceso"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmModal
                isOpen={isConfirmStatusOpen}
                onClose={() => {
                    setIsConfirmStatusOpen(false);
                    setSelectedCandidate(null);
                    setNewStatus(null);
                }}
                onConfirm={handleConfirmStatusChange}
                title={`Cambiar Estado a "${
                    newStatus ? WorkerStatusLabels[newStatus] : ""
                }"`}
                message={
                    <div className="space-y-3">
                        <p>
                            ¿Estás seguro de cambiar el estado del candidato{" "}
                            {selectedCandidate?.worker?.firstName}{" "}
                            {selectedCandidate?.worker?.lastName} a "
                            {newStatus ? WorkerStatusLabels[newStatus] : ""}"?
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas (opcional):
                            </label>
                            <textarea
                                rows={3}
                                value={statusNotes}
                                onChange={(e) => setStatusNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                placeholder="Agrega comentarios sobre esta decisión..."
                            />
                        </div>
                    </div>
                }
                confirmText="Confirmar"
                cancelText="Cancelar"
                isLoading={updateStatusMutation.isPending}
            />
        </div>
    );
};
