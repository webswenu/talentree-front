import { apiService } from './api.service';
import { TestResponse, TestAnswer, StartTestDto, SubmitTestDto, EvaluateAnswerDto, TestResponseStats } from '../types/test-response.types';

class TestResponsesService {
  private basePath = '/test-responses';

  async findAll(): Promise<TestResponse[]> {
    const response = await apiService.get<TestResponse[]>(this.basePath);
    return response.data;
  }

  async startTest(data: StartTestDto): Promise<TestResponse> {
    const response = await apiService.post<TestResponse>(`${this.basePath}/start`, data);
    return response.data;
  }

  async submitTest(responseId: string, data: SubmitTestDto): Promise<TestResponse> {
    const response = await apiService.post<TestResponse>(`${this.basePath}/${responseId}/submit`, data);
    return response.data;
  }

  async autoEvaluate(responseId: string): Promise<TestResponse> {
    const response = await apiService.post<TestResponse>(`${this.basePath}/${responseId}/auto-evaluate`);
    return response.data;
  }

  async evaluateAnswer(answerId: string, data: EvaluateAnswerDto): Promise<TestAnswer> {
    const response = await apiService.patch<TestAnswer>(`${this.basePath}/answer/${answerId}/evaluate`, data);
    return response.data;
  }

  async recalculateScore(responseId: string): Promise<TestResponse> {
    const response = await apiService.post<TestResponse>(`${this.basePath}/${responseId}/recalculate`);
    return response.data;
  }

  async findOne(id: string): Promise<TestResponse> {
    const response = await apiService.get<TestResponse>(`${this.basePath}/${id}`);
    return response.data;
  }

  async getById(id: string): Promise<TestResponse> {
    return this.findOne(id);
  }

  async findByWorkerProcess(workerProcessId: string): Promise<TestResponse[]> {
    const response = await apiService.get<TestResponse[]>(`${this.basePath}/worker-process/${workerProcessId}`);
    return response.data;
  }

  async findByTest(testId: string): Promise<TestResponse[]> {
    const response = await apiService.get<TestResponse[]>(`${this.basePath}/test/${testId}`);
    return response.data;
  }

  async getAllStats(): Promise<TestResponseStats> {
    const response = await apiService.get<TestResponseStats>(`${this.basePath}/stats`);
    return response.data;
  }
}

export const testResponsesService = new TestResponsesService();
