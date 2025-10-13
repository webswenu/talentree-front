import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testResponsesService } from '../services/test-responses.service';
import { StartTestDto, SubmitTestDto, EvaluateAnswerDto } from '../types/test-response.types';

export const testResponseKeys = {
  all: ['test-responses'] as const,
  detail: (id: string) => [...testResponseKeys.all, 'detail', id] as const,
  byWorkerProcess: (workerProcessId: string) => [...testResponseKeys.all, 'worker-process', workerProcessId] as const,
  byTest: (testId: string) => [...testResponseKeys.all, 'test', testId] as const,
};

export const useTestResponse = (id: string) => {
  return useQuery({
    queryKey: testResponseKeys.detail(id),
    queryFn: () => testResponsesService.findOne(id),
    enabled: !!id,
  });
};

export const useTestResponsesByWorkerProcess = (workerProcessId: string) => {
  return useQuery({
    queryKey: testResponseKeys.byWorkerProcess(workerProcessId),
    queryFn: () => testResponsesService.findByWorkerProcess(workerProcessId),
    enabled: !!workerProcessId,
  });
};

export const useTestResponsesByTest = (testId: string) => {
  return useQuery({
    queryKey: testResponseKeys.byTest(testId),
    queryFn: () => testResponsesService.findByTest(testId),
    enabled: !!testId,
  });
};

export const useStartTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartTestDto) => testResponsesService.startTest(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: testResponseKeys.byWorkerProcess(variables.workerProcessId) });
    },
  });
};

export const useSubmitTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responseId, data }: { responseId: string; data: SubmitTestDto }) =>
      testResponsesService.submitTest(responseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: testResponseKeys.detail(variables.responseId) });
      queryClient.invalidateQueries({ queryKey: testResponseKeys.all });
    },
  });
};

export const useAutoEvaluate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseId: string) => testResponsesService.autoEvaluate(responseId),
    onSuccess: (_, responseId) => {
      queryClient.invalidateQueries({ queryKey: testResponseKeys.detail(responseId) });
    },
  });
};

export const useEvaluateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ answerId, data }: { answerId: string; data: EvaluateAnswerDto }) =>
      testResponsesService.evaluateAnswer(answerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testResponseKeys.all });
    },
  });
};

export const useRecalculateScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseId: string) => testResponsesService.recalculateScore(responseId),
    onSuccess: (_, responseId) => {
      queryClient.invalidateQueries({ queryKey: testResponseKeys.detail(responseId) });
    },
  });
};
