import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import companiesService, {
    CompanyFilters,
} from "../services/companies.service";
import { CreateCompanyDto, UpdateCompanyDto } from "../types/company.types";

export const companyKeys = {
    all: ["companies"] as const,
    lists: () => [...companyKeys.all, "list"] as const,
    list: (filters?: CompanyFilters) =>
        [...companyKeys.lists(), filters] as const,
    details: () => [...companyKeys.all, "detail"] as const,
    detail: (id: string) => [...companyKeys.details(), id] as const,
};

export const useCompanies = (filters?: CompanyFilters) => {
    return useQuery({
        queryKey: companyKeys.list(filters),
        queryFn: () => companiesService.getAll(filters),
    });
};

export const useCompany = (id: string) => {
    return useQuery({
        queryKey: companyKeys.detail(id),
        queryFn: () => companiesService.getOne(id),
        enabled: !!id,
    });
};

export const useCreateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (companyData: CreateCompanyDto) =>
            companiesService.create(companyData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
            // Invalidar usuarios porque pueden tener companyId actualizado
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

export const useUpdateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCompanyDto }) =>
            companiesService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: companyKeys.detail(variables.id),
            });
            queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
            // Invalidar usuarios porque pueden tener companyId actualizado
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

export const useDeleteCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => companiesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
        },
    });
};

export const useCompaniesStats = () => {
    return useQuery({
        queryKey: [...companyKeys.all, "stats"],
        queryFn: () => companiesService.getAllStats(),
    });
};

export const useCompanyDashboardStats = (companyId: string | undefined) => {
    return useQuery({
        queryKey: [...companyKeys.detail(companyId || ""), "dashboard-stats"],
        queryFn: () => companiesService.getDashboardStats(companyId!),
        enabled: !!companyId && companyId.length > 0,
    });
};

export const useUploadCompanyLogo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            companiesService.uploadLogo(id, file),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: companyKeys.detail(variables.id),
            });
            queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        },
    });
};

export const useDeleteCompanyLogo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => companiesService.deleteLogo(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: companyKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        },
    });
};
