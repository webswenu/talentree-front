import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { processInvitationsService } from "../services/process-invitations.service";
import {
    CreateProcessInvitationDto,
    BulkInviteWorkersDto,
    AcceptProcessInvitationDto,
    QueryProcessInvitationsDto,
} from "../types/process-invitation.types";
import { toast } from "react-hot-toast";

export const processInvitationKeys = {
    all: ["process-invitations"] as const,
    lists: () => [...processInvitationKeys.all, "list"] as const,
    list: (filters?: QueryProcessInvitationsDto) =>
        [...processInvitationKeys.lists(), filters] as const,
    detail: (id: string) => [...processInvitationKeys.all, "detail", id] as const,
    byToken: (token: string) => [...processInvitationKeys.all, "token", token] as const,
    myInvitations: () => [...processInvitationKeys.all, "my-invitations"] as const,
};

/**
 * Hook para obtener invitaciones con filtros y paginación
 */
export const useProcessInvitations = (filters?: QueryProcessInvitationsDto) => {
    return useQuery({
        queryKey: processInvitationKeys.list(filters),
        queryFn: () => processInvitationsService.findAll(filters),
        placeholderData: (previousData) => previousData,
    });
};

/**
 * Hook para obtener una invitación por ID
 */
export const useProcessInvitation = (id: string) => {
    return useQuery({
        queryKey: processInvitationKeys.detail(id),
        queryFn: () => processInvitationsService.findOne(id),
        enabled: !!id,
    });
};

/**
 * Hook para obtener una invitación por token (público)
 */
export const useProcessInvitationByToken = (token: string) => {
    return useQuery({
        queryKey: processInvitationKeys.byToken(token),
        queryFn: () => processInvitationsService.findByToken(token),
        enabled: !!token,
    });
};

/**
 * Hook para obtener las invitaciones pendientes del trabajador logueado
 */
export const useMyProcessInvitations = () => {
    return useQuery({
        queryKey: processInvitationKeys.myInvitations(),
        queryFn: () => processInvitationsService.getMyInvitations(),
    });
};

/**
 * Hook para crear una invitación individual
 */
export const useCreateProcessInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateProcessInvitationDto) =>
            processInvitationsService.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: processInvitationKeys.lists() });
            toast.success("Invitación enviada exitosamente");
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message ||
                "Error al enviar la invitación";
            toast.error(message);
        },
    });
};

/**
 * Hook para crear invitaciones en masa
 */
export const useBulkCreateProcessInvitations = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: BulkInviteWorkersDto) =>
            processInvitationsService.bulkCreate(dto),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: processInvitationKeys.lists() });

            const { successful, failed } = data;

            if (successful.length > 0) {
                toast.success(
                    `${successful.length} invitación(es) enviada(s) exitosamente`
                );
            }

            if (failed.length > 0) {
                toast.error(
                    `${failed.length} invitación(es) fallaron. Revisa los detalles.`
                );
            }
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message ||
                "Error al enviar las invitaciones";
            toast.error(message);
        },
    });
};

/**
 * Hook para aceptar una invitación
 */
export const useAcceptProcessInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: AcceptProcessInvitationDto) =>
            processInvitationsService.accept(dto),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: processInvitationKeys.all });
            queryClient.invalidateQueries({ queryKey: processInvitationKeys.myInvitations() });
            queryClient.invalidateQueries({ queryKey: ["worker-processes"] });

            if (data.status === "applied") {
                toast.success(data.message);
            }
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message ||
                "Error al aceptar la invitación";
            toast.error(message);
        },
    });
};

/**
 * Hook para cancelar una invitación
 */
export const useCancelProcessInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            processInvitationsService.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: processInvitationKeys.lists() });
            toast.success("Invitación cancelada exitosamente");
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message ||
                "Error al cancelar la invitación";
            toast.error(message);
        },
    });
};

/**
 * Hook para reenviar una invitación
 */
export const useResendProcessInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            processInvitationsService.resend(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: processInvitationKeys.lists() });
            toast.success("Invitación reenviada exitosamente");
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message ||
                "Error al reenviar la invitación";
            toast.error(message);
        },
    });
};
