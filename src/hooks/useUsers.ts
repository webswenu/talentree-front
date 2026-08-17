import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import usersService from "../services/users.service";
import { CreateUserDto, UpdateUserDto } from "../types/user.types";

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
        [...userKeys.lists(), filters] as const,
    details: () => [...userKeys.all, "detail"] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Lista completa, para los combos de selección de usuario.
 * Para el listado paginado del panel, ver useUsersPaginated.
 */
export const useUsers = () => {
    return useQuery({
        queryKey: userKeys.list({ select: true }),
        queryFn: () => usersService.getAllForSelect(),
    });
};

/** P-69: listado del panel con búsqueda, filtros y paginación en el servidor. */
export const useUsersPaginated = (filters?: Record<string, unknown>) => {
    return useQuery({
        queryKey: userKeys.list(filters),
        queryFn: () => usersService.getAll(filters as never),
    });
};

export const useUser = (id: string) => {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => usersService.getOne(id),
        enabled: !!id,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: CreateUserDto) => usersService.create(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
            usersService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: userKeys.detail(variables.id),
            });
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            // Invalidar companies porque el usuario puede tener relación con empresa
            queryClient.invalidateQueries({ queryKey: ["companies"] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => usersService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: ({
            currentPassword,
            newPassword,
        }: {
            currentPassword: string;
            newPassword: string;
        }) => usersService.changePassword(currentPassword, newPassword),
    });
};

export const useUpdateNotificationPreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (preferences: {
            emailNotifications?: boolean;
            newProcesses?: boolean;
            applicationUpdates?: boolean;
            testReminders?: boolean;
            newEvaluations?: boolean;
            candidateUpdates?: boolean;
            processReminders?: boolean;
        }) => usersService.updateNotificationPreferences(preferences),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: userKeys.detail(data.id),
            });
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({
            userId,
            newPassword,
        }: {
            userId: string;
            newPassword: string;
        }) => usersService.resetPassword(userId, newPassword),
    });
};
