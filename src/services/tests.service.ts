import { apiService } from "./api.service";
import {
    Test,
    CreateTestDto,
    UpdateTestDto,
    TestQuestion,
} from "../types/test.types";

interface TestFilters {
    type?: string;
    status?: string;
    search?: string;
}

interface AddQuestionDto {
    question: string;
    type: "multiple_choice" | "true_false" | "open_ended" | "scale";
    options?: string[];
    correctAnswer?: string;
    points: number;
}

class TestsService {
    private basePath = "/tests";

    async findAll(params?: TestFilters): Promise<Test[]> {
        const response = await apiService.get<Test[]>(this.basePath, {
            params,
        });
        return response.data;
    }

    async findByType(type: string): Promise<Test[]> {
        const response = await apiService.get<Test[]>(
            `${this.basePath}/type/${type}`
        );
        return response.data;
    }

    async findOne(id: string): Promise<Test> {
        const response = await apiService.get<Test>(`${this.basePath}/${id}`);
        return response.data;
    }

    async getById(id: string): Promise<Test> {
        return this.findOne(id);
    }

    async create(data: CreateTestDto): Promise<Test> {
        const response = await apiService.post<Test>(this.basePath, data);
        return response.data;
    }

    async update(id: string, data: UpdateTestDto): Promise<Test> {
        const response = await apiService.patch<Test>(
            `${this.basePath}/${id}`,
            data
        );
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await apiService.delete(`${this.basePath}/${id}`);
    }

    async getQuestions(id: string): Promise<TestQuestion[]> {
        const response = await apiService.get<TestQuestion[]>(
            `${this.basePath}/${id}/questions`
        );
        return response.data;
    }

    async addQuestion(
        id: string,
        questionData: AddQuestionDto
    ): Promise<TestQuestion> {
        const response = await apiService.post<TestQuestion>(
            `${this.basePath}/${id}/questions`,
            questionData
        );
        return response.data;
    }

    async updateQuestion(
        testId: string,
        questionId: string,
        questionData: Partial<AddQuestionDto>
    ): Promise<TestQuestion> {
        const response = await apiService.patch<TestQuestion>(
            `${this.basePath}/${testId}/questions/${questionId}`,
            questionData
        );
        return response.data;
    }

    async deleteQuestion(testId: string, questionId: string): Promise<void> {
        await apiService.delete(
            `${this.basePath}/${testId}/questions/${questionId}`
        );
    }

    async toggleActive(id: string): Promise<Test> {
        const response = await apiService.patch<Test>(
            `${this.basePath}/${id}/toggle-active`
        );
        return response.data;
    }

    async activate(id: string): Promise<Test> {
        const response = await apiService.patch<Test>(
            `${this.basePath}/${id}/activate`
        );
        return response.data;
    }

    async deactivate(id: string): Promise<Test> {
        const response = await apiService.patch<Test>(
            `${this.basePath}/${id}/deactivate`
        );
        return response.data;
    }

    async duplicate(id: string): Promise<Test> {
        const response = await apiService.post<Test>(
            `${this.basePath}/${id}/duplicate`,
            {}
        );
        return response.data;
    }

    async getStats(id: string): Promise<unknown> {
        const response = await apiService.get<unknown>(
            `${this.basePath}/${id}/stats`
        );
        return response.data;
    }

    async getResponses(id: string): Promise<unknown[]> {
        const response = await apiService.get<unknown[]>(
            `${this.basePath}/${id}/responses`
        );
        return response.data;
    }
}

export const testsService = new TestsService();
export default testsService;
