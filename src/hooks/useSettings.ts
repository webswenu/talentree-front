import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settings.service";
import { UpdateSettingDto } from "../types/settings.types";

export const settingsKeys = {
    all: ["settings"] as const,
    lists: () => [...settingsKeys.all, "list"] as const,
    byKey: (key: string) => [...settingsKeys.all, "key", key] as const,
    general: () => [...settingsKeys.all, "general"] as const,
    notifications: () => [...settingsKeys.all, "notifications"] as const,
    public: () => [...settingsKeys.all, "public"] as const,
};

export const useSettings = () => {
    return useQuery({
        queryKey: settingsKeys.lists(),
        queryFn: () => settingsService.findAll(),
    });
};

export const usePublicSettings = () => {
    return useQuery({
        queryKey: settingsKeys.public(),
        queryFn: () => settingsService.findPublic(),
    });
};

export const useSetting = (key: string) => {
    return useQuery({
        queryKey: settingsKeys.byKey(key),
        queryFn: () => settingsService.findByKey(key),
        enabled: !!key,
    });
};

export const useGeneralSettings = () => {
    return useQuery({
        queryKey: settingsKeys.general(),
        queryFn: () => settingsService.getGeneralSettings(),
    });
};

export const useNotificationSettings = () => {
    return useQuery({
        queryKey: settingsKeys.notifications(),
        queryFn: () => settingsService.getNotificationSettings(),
    });
};

export const useUpsertSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateSettingDto) => settingsService.upsert(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
};

export const useUpsertSettingsBatch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (settings: UpdateSettingDto[]) =>
            settingsService.upsertBatch(settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
};

export const useDeleteSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (key: string) => settingsService.delete(key),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
};

export const useInitializeDefaults = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => settingsService.initializeDefaults(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
};
