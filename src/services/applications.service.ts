import { apiService } from "./api.service";

export interface Application {
    id: string;
    workerId: string;
    processId: string;
    status: ApplicationStatus;
    appliedAt: Date;
    evaluatedAt?: Date;
    rejectedAt?: Date;
    notes?: string;
    score?: number;
    worker?: {
        id: string;
        firstName: string;
        lastName: string;
        rut: string;
        email: string;
    };
    process?: {
        id: string;
        name: string;
        position: string;
        status: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export enum ApplicationStatus {
    PENDING = "pending",
    IN_REVIEW = "in_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    HIRED = "hired",
}

interface CreateApplicationDto {
    processId: string;
    workerId: string;
    notes?: string;
}

interface UpdateApplicationDto {
    status?: ApplicationStatus;
    notes?: string;
    score?: number;
}

interface ApplicationFilters {
    status?: string;
    processId?: string;
    workerId?: string;
    dateFrom?: string;
    dateTo?: string;
}

class ApplicationsService {
    private basePath = "/applications";

    async findAll(params?: ApplicationFilters): Promise<Application[]> {
        const response = await apiService.get<Application[]>(this.basePath, {
            params,
        });
        return response.data;
    }

    async findOne(id: string): Promise<Application> {
        const response = await apiService.get<Application>(
            `${this.basePath}/${id}`
        );
        return response.data;
    }

    async create(data: CreateApplicationDto): Promise<Application> {
        const response = await apiService.post<Application>(
            this.basePath,
            data
        );
        return response.data;
    }

    async update(id: string, data: UpdateApplicationDto): Promise<Application> {
        const response = await apiService.patch<Application>(
            `${this.basePath}/${id}`,
            data
        );
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await apiService.delete(`${this.basePath}/${id}`);
    }

    async getByProcess(processId: string): Promise<Application[]> {
        const response = await apiService.get<Application[]>(
            `${this.basePath}/process/${processId}`
        );
        return response.data;
    }

    async getByWorker(workerId: string): Promise<Application[]> {
        const response = await apiService.get<Application[]>(
            `${this.basePath}/worker/${workerId}`
        );
        return response.data;
    }

    async approve(id: string, notes?: string): Promise<Application> {
        const response = await apiService.post<Application>(
            `${this.basePath}/${id}/approve`,
            { notes }
        );
        return response.data;
    }

    async reject(id: string, reason: string): Promise<Application> {
        const response = await apiService.post<Application>(
            `${this.basePath}/${id}/reject`,
            { reason }
        );
        return response.data;
    }

    async startReview(id: string): Promise<Application> {
        const response = await apiService.post<Application>(
            `${this.basePath}/${id}/start-review`,
            {}
        );
        return response.data;
    }

    async hire(id: string): Promise<Application> {
        const response = await apiService.post<Application>(
            `${this.basePath}/${id}/hire`,
            {}
        );
        return response.data;
    }

    async assignScore(id: string, score: number): Promise<Application> {
        const response = await apiService.patch<Application>(
            `${this.basePath}/${id}/score`,
            { score }
        );
        return response.data;
    }

    async getTestResults(id: string): Promise<unknown[]> {
        const response = await apiService.get<unknown[]>(
            `${this.basePath}/${id}/test-results`
        );
        return response.data;
    }

    async uploadDocument(
        id: string,
        file: File,
        documentType: string
    ): Promise<Application> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType);
        const response = await apiService.post<Application>(
            `${this.basePath}/${id}/documents`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    }

    async getDocuments(id: string): Promise<unknown[]> {
        const response = await apiService.get<unknown[]>(
            `${this.basePath}/${id}/documents`
        );
        return response.data;
    }

    async bulkUpdateStatus(
        applicationIds: string[],
        status: ApplicationStatus
    ): Promise<void> {
        await apiService.post(`${this.basePath}/bulk-update-status`, {
            applicationIds,
            status,
        });
    }
}

export const applicationsService = new ApplicationsService();
export default applicationsService;
