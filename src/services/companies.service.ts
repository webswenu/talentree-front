import apiService from './api.service';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '../types/company.types';

interface CompanyStats {
  totalProcesses: number;
  activeProcesses: number;
  totalWorkers: number;
  totalApplications: number;
}

interface CompanyFilters {
  status?: string;
  search?: string;
  industry?: string;
}

class CompaniesService {
  async getAll(params?: CompanyFilters): Promise<Company[]> {
    const { data } = await apiService.get<Company[]>('/companies', { params });
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
    const { data } = await apiService.post<Company>('/companies', companyData);
    return data;
  }

  async update(id: string, companyData: UpdateCompanyDto): Promise<Company> {
    const { data } = await apiService.patch<Company>(`/companies/${id}`, companyData);
    return data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/companies/${id}`);
  }

  async activate(id: string): Promise<Company> {
    const { data } = await apiService.patch<Company>(`/companies/${id}/activate`);
    return data;
  }

  async deactivate(id: string): Promise<Company> {
    const { data } = await apiService.patch<Company>(`/companies/${id}/deactivate`);
    return data;
  }

  async getStats(id: string): Promise<CompanyStats> {
    const { data } = await apiService.get<CompanyStats>(`/companies/${id}/stats`);
    return data;
  }

  async getProcesses(id: string): Promise<any[]> {
    const { data } = await apiService.get<any[]>(`/companies/${id}/processes`);
    return data;
  }

  async getUsers(id: string): Promise<any[]> {
    const { data } = await apiService.get<any[]>(`/companies/${id}/users`);
    return data;
  }

  async getReports(id: string): Promise<any[]> {
    const { data } = await apiService.get<any[]>(`/companies/${id}/reports`);
    return data;
  }

  async uploadLogo(id: string, file: File): Promise<Company> {
    const formData = new FormData();
    formData.append('logo', file);
    const { data } = await apiService.post<Company>(`/companies/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
}

export const companiesService = new CompaniesService();
export default companiesService;
