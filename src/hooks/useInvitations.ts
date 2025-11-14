import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    invitationsService,
    CreateInvitationDto,
    AcceptInvitationDto,
} from "../services/invitations.service";
import { toast } from "../utils/toast";

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
            let errorMessage = "Error al enviar la invitación";
            
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string | string[];
                        };
                    };
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMessage = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMessage = message[0];
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
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
            let errorMessage = "Error al reenviar la invitación";
            
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string | string[];
                        };
                    };
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMessage = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMessage = message[0];
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
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
            let errorMessage = "Error al cancelar la invitación";
            
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string | string[];
                        };
                    };
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMessage = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMessage = message[0];
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
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
            let errorMessage = "Error al desactivar el usuario";
            
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string | string[];
                        };
                    };
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMessage = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMessage = message[0];
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
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
            let errorMessage = "Error al reactivar el usuario";
            
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string | string[];
                        };
                    };
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMessage = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMessage = message[0];
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
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
            let errorMessage = "Error al aceptar la invitación";
            
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string | string[];
                        };
                    };
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMessage = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMessage = message[0];
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        },
    });
};
