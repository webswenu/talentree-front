import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsService } from '../services/tests.service';
import { CreateTestDto, UpdateTestDto } from '../types/test.types';

export const testKeys = {
  all: ['tests'] as const,
  lists: () => [...testKeys.all, 'list'] as const,
  byType: (type: string) => [...testKeys.all, 'type', type] as const,
  detail: (id: string) => [...testKeys.all, 'detail', id] as const,
  questions: (id: string) => [...testKeys.all, 'questions', id] as const,
};

export const useTests = () => {
  return useQuery({
    queryKey: testKeys.lists(),
    queryFn: () => testsService.findAll(),
  });
};

export const useTestsByType = (type: string) => {
  return useQuery({
    queryKey: testKeys.byType(type),
    queryFn: () => testsService.findByType(type),
    enabled: !!type,
  });
};

export const useTest = (id: string) => {
  return useQuery({
    queryKey: testKeys.detail(id),
    queryFn: () => testsService.findOne(id),
    enabled: !!id,
  });
};

export const useTestQuestions = (id: string) => {
  return useQuery({
    queryKey: testKeys.questions(id),
    queryFn: () => testsService.getQuestions(id),
    enabled: !!id,
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestDto) => testsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestDto }) =>
      testsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
      queryClient.invalidateQueries({ queryKey: testKeys.detail(variables.id) });
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
    },
  });
};

export const useToggleTestActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testsService.toggleActive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
      queryClient.invalidateQueries({ queryKey: testKeys.detail(id) });
    },
  });
};
