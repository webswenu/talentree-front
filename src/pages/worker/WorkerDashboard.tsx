import { useState, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import {
    useWorkerProcesses,
    useApplyToProcess,
} from "../../hooks/useWorkers";
import { useProcesses } from "../../hooks/useProcesses";
import { WorkerStatus } from "../../types/worker.types";
import { ProcessStatus } from "../../types/process.types";
import { useNavigate } from "react-router-dom";
import { ApplyProcessModal } from "../../components/worker/ApplyProcessModal";
import { SearchInput } from "../../components/common/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";
import { Modal } from "../../components/common/Modal";
import { toast } from "../../utils/toast";
import { QuickActions } from "../../components/widgets/QuickActions";
import { useMyProcessInvitations, useAcceptProcessInvitation } from "../../hooks/useProcessInvitations";
import { Mail, Calendar } from "lucide-react";

export const WorkerDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const workerId = user?.worker?.id;

    const [selectedProcessId, setSelectedProcessId] = useState<string | null>(
        null
    );
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const applyMutation = useApplyToProcess();

    // Obtener invitaciones pendientes del trabajador
    const { data: myInvitations } = useMyProcessInvitations();
    const acceptInvitationMutation = useAcceptProcessInvitation();

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [searchApplications, setSearchApplications] = useState("");
    const debouncedSearchApplications = useDebounce(searchApplications, 300);

    const { data: myApplications } = useWorkerProcesses(workerId || "");

    const { data: processesData } = useProcesses();
    const availableProcesses = useMemo(
        () => processesData?.data || [],
        [processesData]
    );

    const misAplicacionesCompletas =
        myApplications?.map((app) => {
            // Contar tests regulares + fixed tests
            const testsTotal = (app.process?.tests?.length || 0) + (app.process?.fixedTests?.length || 0);
            const testsCompletados =
                app.testResponses?.filter((tr) => tr.isCompleted).length || 0;

            return {
                id: app.id,
                titulo: app.process?.name || "Proceso sin nombre",
                empresa: app.process?.company?.name || "Empresa",
                estado: app.status,
                estadoLabel: getStatusLabel(app.status),
                estadoColor: getStatusColor(app.status),
                fechaAplicacion: app.appliedAt
                    ? new Date(app.appliedAt).toLocaleDateString("es-CL")
                    : "N/A",
                fechaAplicacionRaw: app.appliedAt
                    ? new Date(app.appliedAt).getTime()
                    : app.createdAt
                    ? new Date(app.createdAt).getTime()
                    : 0,
                testsCompletados,
                testsTotal,
                mensaje: getStatusMessage(app.status),
                puntaje: app.totalScore,
            };
        }) || [];

    // Filtrar aplicaciones por búsqueda
    const misAplicacionesFiltradas = misAplicacionesCompletas.filter((app) => {
        const searchLower = debouncedSearchApplications.toLowerCase();
        return (
            app.titulo.toLowerCase().includes(searchLower) ||
            app.empresa.toLowerCase().includes(searchLower)
        );
    });

    // Ordenar por fecha de aplicación (más reciente primero) y tomar las últimas 3
    const misAplicaciones = misAplicacionesFiltradas
        .sort((a, b) => b.fechaAplicacionRaw - a.fechaAplicacionRaw)
        .slice(0, 3);

    const appliedProcessIds = useMemo(
        () => new Set(myApplications?.map((app) => app.process?.id) || []),
        [myApplications]
    );


    const ofertasDisponiblesFiltradas = useMemo(() => {
        return (
            availableProcesses
                ?.filter((process) => {
                    if (
                        process.status !== ProcessStatus.ACTIVE ||
                        appliedProcessIds.has(process.id)
                    ) {
                        return false;
                    }

                    const matchesSearch =
                        debouncedSearch === "" ||
                        process.name
                            ?.toLowerCase()
                            .includes(debouncedSearch.toLowerCase()) ||
                        process.company?.name
                            ?.toLowerCase()
                            .includes(debouncedSearch.toLowerCase()) ||
                        process.location
                            ?.toLowerCase()
                            .includes(debouncedSearch.toLowerCase()) ||
                        process.position
                            ?.toLowerCase()
                            .includes(debouncedSearch.toLowerCase());

                    return matchesSearch;
                })
                .map((process) => ({
                    id: process.id,
                    titulo: process.name,
                    empresa: process.company?.name || "Empresa",
                    descripcion: process.description
                        ? process.description.length > 100
                            ? process.description.substring(0, 100) + "..."
                            : process.description
                        : null,
                    ubicacion: process.location || "No especificado",
                    salario: "A convenir",
                    vacantes: process.vacancies || 1,
                    vence: process.endDate
                        ? new Date(process.endDate).toLocaleDateString("es-CL")
                        : "Sin fecha límite",
                    nuevo: false,
                    createdAt: process.createdAt
                        ? new Date(process.createdAt).getTime()
                        : 0,
                })) || []
        );
    }, [availableProcesses, appliedProcessIds, debouncedSearch]);

    // Ordenar por fecha de creación (más reciente primero) y tomar las últimas 3
    const ofertasDisponibles = ofertasDisponiblesFiltradas
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 3);

    function getStatusLabel(status: WorkerStatus): string {
        const labels: Record<WorkerStatus, string> = {
            [WorkerStatus.PENDING]: "PENDIENTE",
            [WorkerStatus.IN_PROCESS]: "EN PROCESO",
            [WorkerStatus.APPROVED]: "APROBADO",
            [WorkerStatus.REJECTED]: "RECHAZADO",
            [WorkerStatus.HIRED]: "CONTRATADO",
            [WorkerStatus.COMPLETED]: "COMPLETADO",
        };
        return labels[status] || "DESCONOCIDO";
    }

    function getStatusColor(status: WorkerStatus): string {
        const colors: Record<WorkerStatus, string> = {
            [WorkerStatus.PENDING]: "blue",
            [WorkerStatus.IN_PROCESS]: "yellow",
            [WorkerStatus.APPROVED]: "green",
            [WorkerStatus.REJECTED]: "red",
            [WorkerStatus.HIRED]: "green",
            [WorkerStatus.COMPLETED]: "gray",
        };
        return colors[status] || "gray";
    }

    function getStatusMessage(status: WorkerStatus): string {
        const messages: Record<WorkerStatus, string> = {
            [WorkerStatus.PENDING]: "Esperando revisión",
            [WorkerStatus.IN_PROCESS]: "En evaluación",
            [WorkerStatus.APPROVED]: "Aprobado para siguiente etapa",
            [WorkerStatus.REJECTED]: "No seleccionado",
            [WorkerStatus.HIRED]: "Felicitaciones!",
            [WorkerStatus.COMPLETED]: "Completado",
        };
        return messages[status] || "";
    }

    function getButtonText(status: WorkerStatus): string {
        const buttonTexts: Record<WorkerStatus, string> = {
            [WorkerStatus.PENDING]: "Inicia el Proceso →",
            [WorkerStatus.IN_PROCESS]: "Continuar con el Proceso →",
            [WorkerStatus.COMPLETED]: "Ver Detalles →",
            [WorkerStatus.APPROVED]: "Ver Detalles →",
            [WorkerStatus.REJECTED]: "Ver Detalles →",
            [WorkerStatus.HIRED]: "Ver Detalles →",
        };
        return buttonTexts[status] || "Ver Detalles →";
    }

    const getEstadoColorClass = (color: string) => {
        switch (color) {
            case "yellow":
                return "bg-yellow-100 text-yellow-800";
            case "green":
                return "bg-green-100 text-green-800";
            case "blue":
                return "bg-blue-100 text-blue-800";
            case "red":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

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
        } catch {
            toast.error("Error al postular. Por favor intenta nuevamente.");
        }
    };

    const handleCancelApply = () => {
        setIsConfirmOpen(false);
        setSelectedProcessId(null);
    };

    const handleAcceptInvitation = async (token: string) => {
        try {
            await acceptInvitationMutation.mutateAsync({ token });
            toast.success("Invitación aceptada exitosamente");
        } catch {
            toast.error("Error al aceptar la invitación. Por favor intenta nuevamente.");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="rounded-2xl p-8">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900">
                    Dashboard de Trabajador
                </h1>
                <p className="text-gray-800 mt-3 text-lg font-bold">
                    Bienvenido, <span className="text-primary-600/80">{user?.firstName}</span>
                </p>
            </div>

            {/* Invitaciones a Procesos */}
            {myInvitations && myInvitations.length > 0 && (
                <>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-50 px-4 text-sm font-semibold text-purple-600">Invitaciones a Procesos</span>
                        </div>
                    </div>

                    <div className="glass-white rounded-2xl p-4 sm:p-6 border-2 border-purple-200/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Mail className="w-6 h-6 text-purple-600" />
                            <h2 className="text-xl font-bold text-gray-900">
                                Tienes {myInvitations.length} invitación{myInvitations.length > 1 ? 'es' : ''} pendiente{myInvitations.length > 1 ? 's' : ''}
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {myInvitations.map((invitation) => {
                                const daysLeft = Math.ceil(
                                    (new Date(invitation.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                );
                                const isExpiringSoon = daysLeft <= 2;

                                return (
                                    <div
                                        key={invitation.id}
                                        className={`p-4 rounded-xl border transition-all duration-300 ${
                                            isExpiringSoon
                                                ? "bg-red-50/50 border-red-300/50"
                                                : "bg-purple-50/30 border-purple-200/50"
                                        }`}
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    {isExpiringSoon && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-xl flex-shrink-0">
                                                            ⏰ ¡VENCE PRONTO!
                                                        </span>
                                                    )}
                                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                                        {invitation.processName || "Proceso"}
                                                    </h3>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            Vence en {daysLeft} día{daysLeft !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 self-start lg:self-center">
                                                <button
                                                    onClick={() => handleAcceptInvitation(invitation.id)}
                                                    disabled={acceptInvitationMutation.isPending}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-md whitespace-nowrap ${
                                                        isExpiringSoon
                                                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                                            : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                                                    } disabled:opacity-50`}
                                                >
                                                    {acceptInvitationMutation.isPending
                                                        ? "Aceptando..."
                                                        : "Aceptar Invitación"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-4 text-sm font-semibold text-gray-500">Acciones Rápidas</span>
                </div>
            </div>

            {/* Quick Access Buttons */}
            <QuickActions
                actions={[
                    {
                        id: "ver-postulaciones-pendientes",
                        label: "Ver Postulaciones Pendientes",
                        icon: (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ),
                        onClick: () => navigate("/trabajador/postulaciones?status=pending"),
                        color: "orange" as const,
                    },
                    {
                        id: "ver-postulaciones-proceso",
                        label: "Ver Postulaciones en Proceso",
                        icon: (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        ),
                        onClick: () => navigate("/trabajador/postulaciones?status=in_process"),
                        color: "turquoise" as const,
                    },
                    {
                        id: "ver-ofertas-disponibles",
                        label: "Ver Todas las Ofertas Disponibles",
                        icon: (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        ),
                        onClick: () => navigate("/trabajador/procesos"),
                        color: "orange" as const,
                    },
                    {
                        id: "ver-resultados",
                        label: "Ver Mis Resultados",
                        icon: (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ),
                        onClick: () => navigate("/trabajador/postulaciones?results=true"),
                        color: "turquoise" as const,
                    },
                ]}
                columns={2}
            />

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-50 px-4 text-sm font-semibold text-gray-500">Mis Procesos y Oportunidades</span>
                </div>
            </div>

            {/* Grid con Mis Aplicaciones y Ofertas Disponibles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mis Aplicaciones */}
                <div className="glass-white rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Mis Aplicaciones
                        </h2>
                        <SearchInput
                            value={searchApplications}
                            onChange={setSearchApplications}
                            placeholder="Buscar aplicaciones..."
                        />
                    </div>
                    {/* Alerta de procesos pendientes */}
                    {misAplicacionesCompletas.some(
                        (app) => app.estado === WorkerStatus.PENDING || app.estado === WorkerStatus.IN_PROCESS
                    ) && (
                        <div className="mb-4 p-3 rounded-xl border-2 border-orange-200 bg-orange-50/50">
                            <h2 className="text-sm sm:text-base font-bold text-orange-600">
                                ⚠️ Tienes procesos pendientes o en proceso
                            </h2>
                        </div>
                    )}
                <div className="space-y-4">
                    {misAplicaciones.map((app, index) => (
                        <div key={app.id}>
                            <div className="p-3 sm:p-4 rounded-xl border border-white/15 bg-white/8 transition-all duration-300">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                                {app.titulo}
                                            </h3>
                                            <span
                                                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-xl shadow-md flex-shrink-0 ${getEstadoColorClass(
                                                    app.estadoColor
                                                )}`}
                                            >
                                                {app.estadoLabel}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm font-bold text-gray-600 mt-1">
                                            {app.empresa}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                            Aplicado: {app.fechaAplicacion}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/trabajador/postulaciones/${app.id}`)}
                                        className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition-all duration-300 text-sm font-bold shadow-md self-start lg:self-center whitespace-nowrap"
                                    >
                                        {getButtonText(app.estado)}
                                    </button>
                                </div>
                            </div>
                            {index < misAplicaciones.length - 1 && (
                                <div className="my-3 border-t border-gray-200"></div>
                            )}
                        </div>
                    ))}
                </div>
                {/* Footer - Ver todas las aplicaciones */}
                {misAplicacionesFiltradas.length > 3 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate("/trabajador/postulaciones")}
                            className="text-sm font-bold text-gray-900 hover:scale-110 transition-transform duration-300"
                        >
                            Ver todas las aplicaciones ({misAplicacionesFiltradas.length}) →
                        </button>
                    </div>
                )}
                </div>

                {/* Ofertas Disponibles */}
                <div className="glass-white rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Ofertas Disponibles
                        </h2>
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Buscar ofertas..."
                        />
                    </div>
                    <div className="space-y-4">
                        {ofertasDisponibles.map((oferta, index) => (
                        <div key={oferta.id}>
                            <div className="p-3 sm:p-4 rounded-xl border border-white/15 bg-white/8 hover:bg-white/12 transition-all duration-300">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                                {oferta.titulo}
                                            </h3>
                                            {oferta.nuevo && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-xl flex-shrink-0">
                                                    🆕 NUEVA
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1 font-bold break-words">
                                            {oferta.empresa}
                                        </p>
                                        {oferta.descripcion && (
                                            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium break-words">
                                                {oferta.descripcion}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2 text-xs sm:text-sm text-gray-600">
                                            <span className="font-medium">{oferta.ubicacion}</span>
                                            <span className="text-green-600 font-bold">
                                                • {oferta.salario}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                                            <span className="font-medium">{oferta.vacantes} vacantes</span>
                                            <span className="font-medium">• Vence: {oferta.vence}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleApplyClick(oferta.id)}
                                        disabled={applyMutation.isPending}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md self-start lg:self-center whitespace-nowrap"
                                    >
                                        Postular
                                    </button>
                                </div>
                            </div>
                            {index < ofertasDisponibles.length - 1 && (
                                <div className="my-3 border-t border-gray-200"></div>
                            )}
                        </div>
                    ))}

                    {/* Mensaje cuando no hay ofertas */}
                    {ofertasDisponibles.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-4">
                                <svg
                                    className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600 mb-2 font-medium">
                                {debouncedSearch
                                    ? "No se encontraron ofertas con tu búsqueda"
                                    : "No hay ofertas disponibles en este momento"}
                            </p>
                            {debouncedSearch && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-xs sm:text-sm font-bold text-gray-900 hover:scale-110 transition-transform duration-300"
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer - Ver todas las ofertas */}
                {ofertasDisponibles.length > 0 && ofertasDisponiblesFiltradas.length > 3 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate("/trabajador/procesos")}
                            className="text-sm font-bold text-gray-900 hover:scale-110 transition-transform duration-300"
                        >
                            Ver todas las ofertas ({ofertasDisponiblesFiltradas.length}) →
                        </button>
                    </div>
                )}
                </div>
            </div>

            {/* Modal de confirmación */}
            <ApplyProcessModal
                isOpen={isConfirmOpen}
                onClose={handleCancelApply}
                onConfirm={handleConfirmApply}
                process={
                    availableProcesses?.find(
                        (p) => p.id === selectedProcessId
                    ) || null
                }
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
