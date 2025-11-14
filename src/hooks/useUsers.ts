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

export const useUsers = () => {
    return useQuery({
        queryKey: userKeys.lists(),
        queryFn: () => usersService.getAll(),
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
