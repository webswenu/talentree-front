import { apiService } from "./api.service";
import {
    Worker,
    WorkerProcess,
    CreateWorkerDto,
    UpdateWorkerDto,
    ApplyToProcessDto,
    UpdateWorkerProcessStatusDto,
    WorkerStats,
} from "../types/worker.types";

export interface WorkerFilters {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    companyId?: string;
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

class WorkersService {
    private basePath = "/workers";

    async findAll(params?: WorkerFilters): Promise<PaginatedResult<Worker>> {
        const response = await apiService.get<PaginatedResult<Worker>>(
            this.basePath,
            { params }
        );
        return response.data;
    }

    async getAll(params?: WorkerFilters): Promise<PaginatedResult<Worker>> {
        return this.findAll(params);
    }

    async findOne(id: string): Promise<Worker> {
        const response = await apiService.get<Worker>(`${this.basePath}/${id}`);
        return response.data;
    }

    async getById(id: string): Promise<Worker> {
        return this.findOne(id);
    }

    async findByEmail(email: string): Promise<Worker> {
        const response = await apiService.get<Worker>(
            `${this.basePath}/email/${email}`
        );
        return response.data;
    }

    async create(data: CreateWorkerDto): Promise<Worker> {
        const response = await apiService.post<Worker>(this.basePath, data);
        return response.data;
    }

    async update(id: string, data: UpdateWorkerDto): Promise<Worker> {
        const response = await apiService.patch<Worker>(
            `${this.basePath}/${id}`,
            data
        );
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await apiService.delete(`${this.basePath}/${id}`);
    }

    async applyToProcess(data: ApplyToProcessDto): Promise<WorkerProcess> {
        const response = await apiService.post<WorkerProcess>(
            `${this.basePath}/apply-to-process`,
            data
        );
        return response.data;
    }

    async getWorkerProcesses(workerId: string): Promise<WorkerProcess[]> {
        const response = await apiService.get<WorkerProcess[]>(
            `${this.basePath}/${workerId}/processes`
        );
        return response.data;
    }

    async getProcessWorkers(processId: string): Promise<WorkerProcess[]> {
        const response = await apiService.get<WorkerProcess[]>(
            `${this.basePath}/process/${processId}/workers`
        );
        return response.data;
    }

    async updateWorkerProcessStatus(
        id: string,
        data: UpdateWorkerProcessStatusDto
    ): Promise<WorkerProcess> {
        const response = await apiService.patch<WorkerProcess>(
            `${this.basePath}/worker-process/${id}/status`,
            data
        );
        return response.data;
    }

    async getWorkerProcessById(id: string): Promise<WorkerProcess> {
        const response = await apiService.get<WorkerProcess>(
            `${this.basePath}/worker-process/${id}`
        );
        return response.data;
    }

    async getAllStats(): Promise<WorkerStats> {
        const response = await apiService.get<WorkerStats>(
            `${this.basePath}/stats`
        );
        return response.data;
    }

    async getDashboardStats(workerId: string): Promise<{
        aplicadas: number;
        enProceso: number;
        finalizadas: number;
        disponibles: number;
    }> {
        const response = await apiService.get<{
            aplicadas: number;
            enProceso: number;
            finalizadas: number;
            disponibles: number;
        }>(`${this.basePath}/${workerId}/dashboard-stats`);
        return response.data;
    }

    async uploadCV(workerId: string, file: File): Promise<Worker> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiService.post<Worker>(
            `${this.basePath}/${workerId}/upload-cv`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    }

    async downloadCV(workerId: string): Promise<Blob> {
        const response = await apiService.get<Blob>(
            `${this.basePath}/${workerId}/cv`,
            {
                responseType: "blob",
            }
        );
        return response.data;
    }

    async deleteCV(workerId: string): Promise<Worker> {
        const response = await apiService.delete<Worker>(
            `${this.basePath}/${workerId}/cv`
        );
        return response.data;
    }
}

export const workersService = new WorkersService();
