import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import companiesService from '../services/companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from '../types/company.types';

// Keys para React Query
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (filters?: any) => [...companyKeys.lists(), filters] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};

// Hook para listar todas las empresas
export const useCompanies = () => {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: () => companiesService.getAll(),
  });
};

// Hook para obtener una empresa específica
export const useCompany = (id: string) => {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companiesService.getOne(id),
    enabled: !!id,
  });
};

// Hook para crear empresa
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyData: CreateCompanyDto) => companiesService.create(companyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};

// Hook para actualizar empresa
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyDto }) =>
      companiesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};

// Hook para eliminar empresa
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};

// Hook para obtener estadísticas globales de empresas
export const useCompaniesStats = () => {
  return useQuery({
    queryKey: [...companyKeys.all, 'stats'],
    queryFn: () => companiesService.getAllStats(),
  });
};
