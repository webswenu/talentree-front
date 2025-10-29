import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workersService, WorkerFilters } from '../services/workers.service';
import { CreateWorkerDto, UpdateWorkerDto, ApplyToProcessDto, UpdateWorkerProcessStatusDto } from '../types/worker.types';

export const workerKeys = {
  all: ['workers'] as const,
  lists: () => [...workerKeys.all, 'list'] as const,
  list: (filters?: WorkerFilters) => [...workerKeys.lists(), filters] as const,
  detail: (id: string) => [...workerKeys.all, 'detail', id] as const,
  processes: (workerId: string) => [...workerKeys.all, 'processes', workerId] as const,
  processWorkers: (processId: string) => [...workerKeys.all, 'process-workers', processId] as const,
  workerProcess: (id: string) => [...workerKeys.all, 'worker-process', id] as const,
};

export const useWorkers = (filters?: WorkerFilters) => {
  return useQuery({
    queryKey: workerKeys.list(filters),
    queryFn: () => workersService.findAll(filters),
  });
};

export const useWorker = (id: string) => {
  return useQuery({
    queryKey: workerKeys.detail(id),
    queryFn: () => workersService.findOne(id),
    enabled: !!id,
  });
};

export const useWorkerProcesses = (workerId: string) => {
  return useQuery({
    queryKey: workerKeys.processes(workerId),
    queryFn: () => workersService.getWorkerProcesses(workerId),
    enabled: !!workerId,
  });
};

export const useProcessWorkers = (processId: string) => {
  return useQuery({
    queryKey: workerKeys.processWorkers(processId),
    queryFn: () => workersService.getProcessWorkers(processId),
    enabled: !!processId,
  });
};

export const useWorkerProcess = (id: string) => {
  return useQuery({
    queryKey: workerKeys.workerProcess(id),
    queryFn: () => workersService.getWorkerProcessById(id),
    enabled: !!id,
  });
};

export const useCreateWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkerDto) => workersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
    },
  });
};

export const useUpdateWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkerDto }) =>
      workersService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workerKeys.detail(variables.id) });
    },
  });
};

export const useDeleteWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
    },
  });
};

export const useApplyToProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplyToProcessDto) => workersService.applyToProcess(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.processes(variables.workerId) });
      queryClient.invalidateQueries({ queryKey: workerKeys.processWorkers(variables.processId) });
    },
  });
};

export const useUpdateWorkerProcessStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkerProcessStatusDto }) =>
      workersService.updateWorkerProcessStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.workerProcess(variables.id) });
      queryClient.invalidateQueries({ queryKey: workerKeys.all });
    },
  });
};

// Hook para obtener estadísticas globales de trabajadores
export const useWorkersStats = () => {
  return useQuery({
    queryKey: [...workerKeys.all, 'stats'],
    queryFn: () => workersService.getAllStats(),
  });
};

// Hook para obtener estadísticas del dashboard de un worker específico
export const useWorkerDashboardStats = (workerId: string | undefined) => {
  return useQuery({
    queryKey: [...workerKeys.all, 'dashboard-stats', workerId],
    queryFn: () => workersService.getDashboardStats(workerId!),
    enabled: !!workerId && workerId.length > 0,
    retry: false,
  });
};

// Hooks para operaciones de CV
export const useUploadCV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workerId, file }: { workerId: string; file: File }) =>
      workersService.uploadCV(workerId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.detail(variables.workerId) });
    },
  });
};

export const useDeleteCV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workerId: string) => workersService.deleteCV(workerId),
    onSuccess: (_, workerId) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.detail(workerId) });
    },
  });
};
