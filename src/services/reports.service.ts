import { apiService } from "./api.service";
import {
    Report,
    CreateReportDto,
    UpdateReportDto,
} from "../types/report.types";

class ReportsService {
    private basePath = "/reports";

    async findAll(): Promise<Report[]> {
        const response = await apiService.get<Report[]>(this.basePath);
        return response.data;
    }

    async findOne(id: string): Promise<Report> {
        const response = await apiService.get<Report>(`${this.basePath}/${id}`);
        return response.data;
    }

    async findByType(type: string): Promise<Report[]> {
        const response = await apiService.get<Report[]>(
            `${this.basePath}/type/${type}`
        );
        return response.data;
    }

    async findByProcess(processId: string): Promise<Report[]> {
        const response = await apiService.get<Report[]>(
            `${this.basePath}/process/${processId}`
        );
        return response.data;
    }

    async findByWorker(workerId: string): Promise<Report[]> {
        const response = await apiService.get<Report[]>(
            `${this.basePath}/worker/${workerId}`
        );
        return response.data;
    }

    async create(data: CreateReportDto): Promise<Report> {
        const response = await apiService.post<Report>(this.basePath, data);
        return response.data;
    }

    async update(id: string, data: UpdateReportDto): Promise<Report> {
        const response = await apiService.patch<Report>(
            `${this.basePath}/${id}`,
            data
        );
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await apiService.delete(`${this.basePath}/${id}`);
    }
}

export const reportsService = new ReportsService();
