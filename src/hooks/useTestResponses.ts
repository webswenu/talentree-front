import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testResponsesService } from "../services/test-responses.service";
import {
    StartTestDto,
    SubmitTestDto,
    EvaluateAnswerDto,
} from "../types/test-response.types";

export const testResponseKeys = {
    all: ["test-responses"] as const,
    detail: (id: string) => [...testResponseKeys.all, "detail", id] as const,
    byWorkerProcess: (workerProcessId: string) =>
        [...testResponseKeys.all, "worker-process", workerProcessId] as const,
    byTest: (testId: string) =>
        [...testResponseKeys.all, "test", testId] as const,
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
        queryFn: () =>
            testResponsesService.findByWorkerProcess(workerProcessId),
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
        mutationFn: (data: StartTestDto) =>
            testResponsesService.startTest(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: testResponseKeys.byWorkerProcess(
                    variables.workerProcessId
                ),
            });
        },
    });
};

export const useSubmitTest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            responseId,
            data,
        }: {
            responseId: string;
            data: SubmitTestDto;
        }) => testResponsesService.submitTest(responseId, data),
        onSuccess: (testResponse, variables) => {
            queryClient.invalidateQueries({
                queryKey: testResponseKeys.detail(variables.responseId),
            });
            queryClient.invalidateQueries({ queryKey: testResponseKeys.all });

            // Invalidate worker process to update test list
            const workerProcessId = typeof testResponse.workerProcess === 'string'
                ? testResponse.workerProcess
                : testResponse.workerProcess?.id;

            if (workerProcessId) {
                console.log('Invalidating worker process:', workerProcessId);
                queryClient.invalidateQueries({
                    queryKey: ["workers", "worker-process", workerProcessId],
                });
                // Also invalidate all worker process queries to be safe
                queryClient.invalidateQueries({
                    queryKey: ["workers", "worker-process"],
                });
            }

            // Invalidate all process tests queries to update test status badges
            console.log('Invalidating all process tests queries');
            queryClient.invalidateQueries({
                queryKey: ["processes", "tests"],
            });
        },
    });
};

export const useAutoEvaluate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (responseId: string) =>
            testResponsesService.autoEvaluate(responseId),
        onSuccess: (_, responseId) => {
            queryClient.invalidateQueries({
                queryKey: testResponseKeys.detail(responseId),
            });
        },
    });
};

export const useEvaluateAnswer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            answerId,
            data,
        }: {
            answerId: string;
            data: EvaluateAnswerDto;
        }) => testResponsesService.evaluateAnswer(answerId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testResponseKeys.all });
        },
    });
};

export const useRecalculateScore = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (responseId: string) =>
            testResponsesService.recalculateScore(responseId),
        onSuccess: (_, responseId) => {
            queryClient.invalidateQueries({
                queryKey: testResponseKeys.detail(responseId),
            });
        },
    });
};

export const useTestResponsesStats = () => {
    return useQuery({
        queryKey: [...testResponseKeys.all, "stats"],
        queryFn: () => testResponsesService.getAllStats(),
    });
};
