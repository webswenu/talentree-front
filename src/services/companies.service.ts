import apiService from "./api.service";
import {
    Company,
    CreateCompanyDto,
    UpdateCompanyDto,
    CompanyStats,
} from "../types/company.types";

interface CompanyDetailStats {
    totalProcesses: number;
    activeProcesses: number;
    totalWorkers: number;
    totalApplications: number;
}

export interface CompanyDashboardStats {
    procesosActivos: {
        total: number;
        nuevos: number;
        texto: string;
    };
    candidatos: {
        total: number;
        nuevos: number;
        texto: string;
    };
    candidatosAprobados: {
        total: number;
        tasaAprobacion: string;
    };
    procesosCompletados: {
        total: number;
        texto: string;
    };
}

export interface CompanyFilters {
    active?: boolean;
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

class CompaniesService {
    async getAll(params?: CompanyFilters): Promise<PaginatedResult<Company>> {
        const { data } = await apiService.get<PaginatedResult<Company>>(
            "/companies",
            { params }
        );
        return data;
    }

    async getOne(id: string): Promise<Company> {
        const { data } = await apiService.get<Company>(`/companies/${id}`);
        return data;
    }

    async getById(id: string): Promise<Company> {
        return this.getOne(id);
    }

    async create(companyData: CreateCompanyDto): Promise<Company> {
        const { data } = await apiService.post<Company>(
            "/companies",
            companyData
        );
        return data;
    }

    async update(id: string, companyData: UpdateCompanyDto): Promise<Company> {
        const { data } = await apiService.patch<Company>(
            `/companies/${id}`,
            companyData
        );
        return data;
    }

    async delete(id: string): Promise<void> {
        await apiService.delete(`/companies/${id}`);
    }

    async activate(id: string): Promise<Company> {
        const { data } = await apiService.patch<Company>(
            `/companies/${id}/activate`
        );
        return data;
    }

    async deactivate(id: string): Promise<Company> {
        const { data } = await apiService.patch<Company>(
            `/companies/${id}/deactivate`
        );
        return data;
    }

    async getAllStats(): Promise<CompanyStats> {
        const { data } = await apiService.get<CompanyStats>("/companies/stats");
        return data;
    }

    async getStats(id: string): Promise<CompanyDetailStats> {
        const { data } = await apiService.get<CompanyDetailStats>(
            `/companies/${id}/stats`
        );
        return data;
    }

    async getDashboardStats(id: string): Promise<CompanyDashboardStats> {
        const { data } = await apiService.get<CompanyDashboardStats>(
            `/companies/${id}/dashboard-stats`
        );
        return data;
    }

    async getProcesses(id: string): Promise<unknown[]> {
        const { data } = await apiService.get<unknown[]>(
            `/companies/${id}/processes`
        );
        return data;
    }

    async getUsers(id: string): Promise<unknown[]> {
        const { data } = await apiService.get<unknown[]>(
            `/companies/${id}/users`
        );
        return data;
    }

    async getReports(id: string): Promise<unknown[]> {
        const { data } = await apiService.get<unknown[]>(
            `/companies/${id}/reports`
        );
        return data;
    }

    async uploadLogo(id: string, file: File): Promise<Company> {
        const formData = new FormData();
        formData.append("logo", file);
        const { data } = await apiService.post<Company>(
            `/companies/${id}/logo`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return data;
    }
}

export const companiesService = new CompaniesService();
export default companiesService;
