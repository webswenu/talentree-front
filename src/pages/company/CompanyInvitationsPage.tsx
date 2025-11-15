import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
    useInvitations,
    useResendInvitation,
    useCancelInvitation,
    useDeactivateUser,
    useReactivateUser,
} from "../../hooks/useInvitations";
import { InviteGuestModal } from "../../components/company/InviteGuestModal";
import { ConfirmModal } from "../../components/common/ConfirmModal";

type InvitationTab = "sent" | "registered" | "pending";

export const CompanyInvitationsPage = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<InvitationTab>("sent");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    const companyId = user?.company?.id || "";
    const { data: invitationsData, isLoading } = useInvitations(companyId);
    const resendMutation = useResendInvitation();
    const cancelMutation = useCancelInvitation();
    const deactivateMutation = useDeactivateUser();
    const reactivateMutation = useReactivateUser();

    const invitationsSent = invitationsData?.sent || [];
    const invitationsRegistered = invitationsData?.registered || [];
    const invitationsPending = invitationsData?.pending || [];

    // Filtrar solo usuarios activos para el KPI
    const activeUsers = invitationsRegistered.filter(
        (inv) => inv.user?.isActive !== false
    );

    const handleResend = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Reenviar Invitación",
            message: "¿Estás seguro de reenviar esta invitación?",
            onConfirm: () => {
                resendMutation.mutate(id);
                setConfirmModal({ ...confirmModal, isOpen: false });
            },
        });
    };

    const handleCancel = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Cancelar Invitación",
            message: `¿Estás seguro de cancelar la invitación de ${name}?`,
            onConfirm: () => {
                cancelMutation.mutate(id);
                setConfirmModal({ ...confirmModal, isOpen: false });
            },
        });
    };

    const handleDeactivate = (userId: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Desactivar Usuario",
            message: `¿Estás seguro de desactivar al usuario ${name}?`,
            onConfirm: () => {
                deactivateMutation.mutate(userId);
                setConfirmModal({ ...confirmModal, isOpen: false });
            },
        });
    };

    const handleReactivate = (userId: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Reactivar Usuario",
            message: `¿Estás seguro de reactivar al usuario ${name}?`,
            onConfirm: () => {
                reactivateMutation.mutate(userId);
                setConfirmModal({ ...confirmModal, isOpen: false });
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando invitaciones...</div>
            </div>
        );
    }

    const getTabs = () => [
        {
            id: "sent" as InvitationTab,
            label: "Enviadas",
            count: invitationsSent.length,
        },
        {
            id: "registered" as InvitationTab,
            label: "Registrados",
            count: invitationsRegistered.length,
        },
        {
            id: "pending" as InvitationTab,
            label: "Pendientes",
            count: invitationsPending.length,
        },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "sent":
                return (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Envío
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invitationsSent.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-8 text-center text-gray-500"
                                        >
                                            No hay invitaciones enviadas
                                        </td>
                                    </tr>
                                ) : (
                                    invitationsSent.map((invitation) => (
                                        <tr
                                            key={invitation.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {invitation.firstName}{" "}
                                                    {invitation.lastName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {invitation.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(
                                                        invitation.createdAt
                                                    ).toLocaleDateString("es-CL")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        invitation.status ===
                                                        "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : invitation.status ===
                                                                "expired"
                                                              ? "bg-red-100 text-red-800"
                                                              : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {invitation.status ===
                                                    "pending"
                                                        ? "Pendiente"
                                                        : invitation.status ===
                                                            "expired"
                                                          ? "Expirada"
                                                          : "Cancelada"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {invitation.status ===
                                                    "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleResend(
                                                                    invitation.id
                                                                )
                                                            }
                                                            disabled={
                                                                resendMutation.isPending
                                                            }
                                                            className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50"
                                                        >
                                                            Reenviar
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleCancel(
                                                                    invitation.id,
                                                                    `${invitation.firstName} ${invitation.lastName}`
                                                                )
                                                            }
                                                            disabled={
                                                                cancelMutation.isPending
                                                            }
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                );

            case "registered":
                return (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Registro
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Último Acceso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invitationsRegistered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-gray-500"
                                        >
                                            No hay usuarios registrados
                                        </td>
                                    </tr>
                                ) : (
                                    invitationsRegistered.map((invitation) => {
                                        const isActive =
                                            invitation.user?.isActive ?? true;
                                        return (
                                            <tr
                                                key={invitation.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invitation.firstName}{" "}
                                                        {invitation.lastName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {invitation.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {invitation.acceptedAt
                                                            ? new Date(
                                                                  invitation.acceptedAt
                                                              ).toLocaleDateString(
                                                                  "es-CL"
                                                              )
                                                            : "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {invitation.user
                                                            ?.lastLogin
                                                            ? new Date(
                                                                  invitation.user
                                                                      .lastLogin
                                                              ).toLocaleDateString(
                                                                  "es-CL"
                                                              )
                                                            : "Nunca"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                            isActive
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {isActive
                                                            ? "Activo"
                                                            : "Inactivo"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {isActive ? (
                                                        <button
                                                            onClick={() =>
                                                                handleDeactivate(
                                                                    invitation.userId!,
                                                                    `${invitation.firstName} ${invitation.lastName}`
                                                                )
                                                            }
                                                            disabled={
                                                                deactivateMutation.isPending
                                                            }
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                        >
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleReactivate(
                                                                    invitation.userId!,
                                                                    `${invitation.firstName} ${invitation.lastName}`
                                                                )
                                                            }
                                                            disabled={
                                                                reactivateMutation.isPending
                                                            }
                                                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                        >
                                                            Reactivar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                );

            case "pending":
                return (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Envío
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Días Transcurridos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invitationsPending.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-8 text-center text-gray-500"
                                        >
                                            No hay invitaciones pendientes
                                        </td>
                                    </tr>
                                ) : (
                                    invitationsPending.map((invitation) => {
                                        const daysAgo = Math.floor(
                                            (new Date().getTime() -
                                                new Date(
                                                    invitation.createdAt
                                                ).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                        );
                                        return (
                                            <tr
                                                key={invitation.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invitation.firstName}{" "}
                                                        {invitation.lastName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {invitation.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(
                                                            invitation.createdAt
                                                        ).toLocaleDateString(
                                                            "es-CL"
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                        {daysAgo} días
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() =>
                                                            handleResend(
                                                                invitation.id
                                                            )
                                                        }
                                                        disabled={
                                                            resendMutation.isPending
                                                        }
                                                        className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50"
                                                    >
                                                        Reenviar
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleCancel(
                                                                invitation.id,
                                                                `${invitation.firstName} ${invitation.lastName}`
                                                            )
                                                        }
                                                        disabled={
                                                            cancelMutation.isPending
                                                        }
                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Gestión de Invitaciones
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Administra las invitaciones a usuarios invitados de tu
                        empresa
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Nueva Invitación
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Enviadas
                            </p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {invitationsSent.length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📧</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Usuarios Activos
                            </p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {activeUsers.length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">✅</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Sin Respuesta
                            </p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">
                                {invitationsPending.length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">⏳</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {getTabs().map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    px-6 py-4 text-sm font-medium border-b-2 transition-colors
                                    ${
                                        activeTab === tab.id
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }
                                `}
                            >
                                {tab.label}
                                <span
                                    className={`
                                        ml-2 px-2 py-1 text-xs rounded-full
                                        ${
                                            activeTab === tab.id
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-gray-100 text-gray-600"
                                        }
                                    `}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">{renderContent()}</div>
            </div>

            {/* Modals */}
            <InviteGuestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() =>
                    setConfirmModal({ ...confirmModal, isOpen: false })
                }
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Confirmar"
                cancelText="Cancelar"
                isLoading={
                    resendMutation.isPending ||
                    cancelMutation.isPending ||
                    deactivateMutation.isPending ||
                    reactivateMutation.isPending
                }
            />
        </div>
    );
};
