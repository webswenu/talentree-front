import { apiService } from "./api.service";
import {
    SelectionProcess,
    CreateProcessDto,
    UpdateProcessDto,
    AssignEvaluatorsDto,
    ProcessStats,
} from "../types/process.types";

export interface ProcessFilters {
    status?: string;
    companyId?: string;
    evaluatorId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface ProcessDetailStats {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    completionRate: number;
}

class ProcessesService {
    private basePath = "/processes";

    async findAll(
        params?: ProcessFilters
    ): Promise<PaginatedResult<SelectionProcess>> {
        const response = await apiService.get<
            PaginatedResult<SelectionProcess>
        >(this.basePath, { params });
        return response.data;
    }

    async findByCompany(
        companyId: string
    ): Promise<PaginatedResult<SelectionProcess>> {
        const response = await apiService.get<PaginatedResult<SelectionProcess>>(
            this.basePath,
            { params: { companyId } }
        );
        return response.data;
    }

    async findOne(id: string): Promise<SelectionProcess> {
        const response = await apiService.get<SelectionProcess>(
            `${this.basePath}/${id}`
        );
        return response.data;
    }

    async getById(id: string): Promise<SelectionProcess> {
        return this.findOne(id);
    }

    async getAll(
        params?: ProcessFilters
    ): Promise<PaginatedResult<SelectionProcess>> {
        return this.findAll(params);
    }

    async create(data: CreateProcessDto): Promise<SelectionProcess> {
        const response = await apiService.post<SelectionProcess>(
            this.basePath,
            data
        );
        return response.data;
    }

    async update(
        id: string,
        data: UpdateProcessDto
    ): Promise<SelectionProcess> {
        const response = await apiService.patch<SelectionProcess>(
            `${this.basePath}/${id}`,
            data
        );
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await apiService.delete(`${this.basePath}/${id}`);
    }

    async assignEvaluators(
        id: string,
        data: AssignEvaluatorsDto
    ): Promise<SelectionProcess> {
        const response = await apiService.post<SelectionProcess>(
            `${this.basePath}/${id}/evaluators`,
            data
        );
        return response.data;
    }

    async getEvaluators(id: string): Promise<unknown[]> {
        const response = await apiService.get<unknown[]>(
            `${this.basePath}/${id}/evaluators`
        );
        return response.data;
    }

    async getApplications(id: string): Promise<unknown[]> {
        const response = await apiService.get<unknown[]>(
            `${this.basePath}/${id}/applications`
        );
        return response.data;
    }

    async getAllStats(): Promise<ProcessStats> {
        const response = await apiService.get<ProcessStats>(
            `${this.basePath}/stats`
        );
        return response.data;
    }

    async getStats(id: string): Promise<ProcessDetailStats> {
        const response = await apiService.get<ProcessDetailStats>(
            `${this.basePath}/${id}/stats`
        );
        return response.data;
    }

    async updateStatus(id: string, status: string): Promise<SelectionProcess> {
        const response = await apiService.patch<SelectionProcess>(
            `${this.basePath}/${id}/status`,
            { status }
        );
        return response.data;
    }

    async publish(id: string): Promise<SelectionProcess> {
        const response = await apiService.post<SelectionProcess>(
            `${this.basePath}/${id}/publish`,
            {}
        );
        return response.data;
    }

    async close(id: string): Promise<SelectionProcess> {
        const response = await apiService.post<SelectionProcess>(
            `${this.basePath}/${id}/close`,
            {}
        );
        return response.data;
    }

    async archive(id: string): Promise<SelectionProcess> {
        const response = await apiService.post<SelectionProcess>(
            `${this.basePath}/${id}/archive`,
            {}
        );
        return response.data;
    }

    async addTest(id: string, testId: string): Promise<SelectionProcess> {
        const response = await apiService.post<SelectionProcess>(
            `${this.basePath}/${id}/tests`,
            { testId }
        );
        return response.data;
    }

    async removeTest(id: string, testId: string): Promise<SelectionProcess> {
        const response = await apiService.delete<SelectionProcess>(
            `${this.basePath}/${id}/tests/${testId}`
        );
        return response.data;
    }

    async getTests(id: string): Promise<unknown[]> {
        const response = await apiService.get<unknown[]>(
            `${this.basePath}/${id}/tests`
        );
        return response.data;
    }

    async duplicate(id: string): Promise<SelectionProcess> {
        const response = await apiService.post<SelectionProcess>(
            `${this.basePath}/${id}/duplicate`,
            {}
        );
        return response.data;
    }
}

export const processesService = new ProcessesService();
export default processesService;
