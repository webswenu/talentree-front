import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processesService, ProcessFilters } from '../services/processes.service';
import { CreateProcessDto, UpdateProcessDto, AssignEvaluatorsDto } from '../types/process.types';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/user.types';

export const processKeys = {
  all: ['processes'] as const,
  lists: () => [...processKeys.all, 'list'] as const,
  list: (filters?: ProcessFilters) => [...processKeys.lists(), filters] as const,
  byCompany: (companyId: string) => [...processKeys.all, 'company', companyId] as const,
  detail: (id: string) => [...processKeys.all, 'detail', id] as const,
  evaluators: (id: string) => [...processKeys.all, 'evaluators', id] as const,
};

/**
 * Hook principal para obtener procesos con paginación y filtros.
 * Filtra automáticamente según el rol del usuario:
 * - ADMIN: Todos los procesos
 * - EVALUATOR: Todos los procesos (lectura)
 * - COMPANY: Solo procesos de su empresa
 * - GUEST: Solo procesos de su empresa
 */
export const useProcesses = (filters?: ProcessFilters) => {
  const { user } = useAuthStore();

  // Aplicar filtros automáticos por rol
  const finalFilters: ProcessFilters = { ...filters };

  // Solo COMPANY filtra por empresa propia
  // ADMIN y EVALUATOR ven todos los procesos
  if (user?.role === UserRole.COMPANY && user.company?.id) {
    finalFilters.companyId = user.company.id;
  }

  return useQuery({
    queryKey: processKeys.list(finalFilters),
    queryFn: () => processesService.findAll(finalFilters),
    enabled: !!user,
  });
};

export const useProcessesByCompany = (companyId: string) => {
  return useQuery({
    queryKey: processKeys.byCompany(companyId),
    queryFn: () => processesService.findByCompany(companyId),
    enabled: !!companyId,
  });
};

export const useProcess = (id: string) => {
  return useQuery({
    queryKey: processKeys.detail(id),
    queryFn: () => processesService.findOne(id),
    enabled: !!id,
  });
};

export const useProcessEvaluators = (id: string) => {
  return useQuery({
    queryKey: processKeys.evaluators(id),
    queryFn: () => processesService.getEvaluators(id),
    enabled: !!id,
  });
};

export const useCreateProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProcessDto) => processesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processKeys.lists() });
    },
  });
};

export const useUpdateProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProcessDto }) =>
      processesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: processKeys.lists() });
      queryClient.invalidateQueries({ queryKey: processKeys.detail(variables.id) });
    },
  });
};

export const useDeleteProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => processesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processKeys.lists() });
    },
  });
};

export const useAssignEvaluators = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignEvaluatorsDto }) =>
      processesService.assignEvaluators(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: processKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: processKeys.evaluators(variables.id) });
    },
  });
};

// Hook para obtener estadísticas globales de procesos
export const useProcessesStats = () => {
  return useQuery({
    queryKey: [...processKeys.all, 'stats'],
    queryFn: () => processesService.getAllStats(),
  });
};
