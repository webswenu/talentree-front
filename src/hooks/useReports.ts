import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsService } from "../services/reports.service";
import { CreateReportDto, UpdateReportDto } from "../types/report.types";

export const reportKeys = {
    all: ["reports"] as const,
    lists: () => [...reportKeys.all, "list"] as const,
    detail: (id: string) => [...reportKeys.all, "detail", id] as const,
    byType: (type: string) => [...reportKeys.all, "type", type] as const,
    byProcess: (processId: string) =>
        [...reportKeys.all, "process", processId] as const,
    byWorker: (workerId: string) =>
        [...reportKeys.all, "worker", workerId] as const,
};

export const useReports = () => {
    return useQuery({
        queryKey: reportKeys.lists(),
        queryFn: () => reportsService.findAll(),
    });
};

export const useReport = (id: string) => {
    return useQuery({
        queryKey: reportKeys.detail(id),
        queryFn: () => reportsService.findOne(id),
        enabled: !!id,
    });
};

export const useReportsByType = (type: string) => {
    return useQuery({
        queryKey: reportKeys.byType(type),
        queryFn: () => reportsService.findByType(type),
        enabled: !!type,
    });
};

export const useReportsByProcess = (processId: string) => {
    return useQuery({
        queryKey: reportKeys.byProcess(processId),
        queryFn: () => reportsService.findByProcess(processId),
        enabled: !!processId,
    });
};

export const useReportsByWorker = (workerId: string) => {
    return useQuery({
        queryKey: reportKeys.byWorker(workerId),
        queryFn: () => reportsService.findByWorker(workerId),
        enabled: !!workerId,
    });
};

export const useCreateReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReportDto) => reportsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
        },
    });
};

export const useUpdateReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateReportDto }) =>
            reportsService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: reportKeys.detail(variables.id),
            });
        },
    });
};

export const useDeleteReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reportsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
        },
    });
};

export const useUploadReportFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            reportsService.uploadFile(id, file),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: reportKeys.detail(variables.id),
            });
            // Invalidate all worker-specific report queries
            queryClient.invalidateQueries({
                queryKey: ["reports", "worker"]
            });
            // Invalidate all process-specific report queries
            queryClient.invalidateQueries({
                queryKey: ["reports", "process"]
            });
        },
    });
};

export const useDownloadReportFile = () => {
    return useMutation({
        mutationFn: ({ id, format }: { id: string; format?: 'pdf' | 'docx' }) =>
            reportsService.downloadFile(id, format),
    });
};

export const useApproveReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: { status: string; rejectionReason?: string };
        }) => reportsService.approveReport(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: reportKeys.detail(variables.id),
            });
            // Invalidate all worker-specific report queries
            queryClient.invalidateQueries({
                queryKey: ["reports", "worker"]
            });
        },
    });
};

export const useGenerateReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (workerProcessId: string) =>
            reportsService.generateReport(workerProcessId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
        },
    });
};
