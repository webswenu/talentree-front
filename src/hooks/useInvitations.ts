import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    invitationsService,
    CreateInvitationDto,
    AcceptInvitationDto,
} from "../services/invitations.service";
import { toast } from "../utils/toast";
import { getApiErrorMessage } from "../utils/apiError";

export const useInvitations = (companyId: string) => {
    return useQuery({
        queryKey: ["invitations", companyId],
        queryFn: () => invitationsService.getInvitations(companyId),
        enabled: !!companyId,
    });
};

export const useCreateInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInvitationDto) =>
            invitationsService.createInvitation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            toast.success("Invitación enviada exitosamente");
        },
        onError: (error: unknown) => {
            toast.error(
                getApiErrorMessage(error, "Error al enviar la invitación")
            );
        },
    });
};

export const useResendInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => invitationsService.resendInvitation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            toast.success("Invitación reenviada exitosamente");
        },
        onError: (error: unknown) => {
            toast.error(
                getApiErrorMessage(error, "Error al reenviar la invitación")
            );
        },
    });
};

export const useCancelInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => invitationsService.cancelInvitation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            toast.success("Invitación cancelada exitosamente");
        },
        onError: (error: unknown) => {
            toast.error(
                getApiErrorMessage(error, "Error al cancelar la invitación")
            );
        },
    });
};

export const useDeactivateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) =>
            invitationsService.deactivateUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            toast.success("Usuario desactivado exitosamente");
        },
        onError: (error: unknown) => {
            toast.error(
                getApiErrorMessage(error, "Error al desactivar el usuario")
            );
        },
    });
};

export const useReactivateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) =>
            invitationsService.reactivateUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            toast.success("Usuario reactivado exitosamente");
        },
        onError: (error: unknown) => {
            toast.error(
                getApiErrorMessage(error, "Error al reactivar el usuario")
            );
        },
    });
};

export const useAcceptInvitation = () => {
    return useMutation({
        mutationFn: (data: AcceptInvitationDto) =>
            invitationsService.acceptInvitation(data),
        onSuccess: () => {
            toast.success("¡Cuenta creada exitosamente! Puedes iniciar sesión.");
        },
        onError: (error: unknown) => {
            toast.error(
                getApiErrorMessage(error, "Error al aceptar la invitación")
            );
        },
    });
};
