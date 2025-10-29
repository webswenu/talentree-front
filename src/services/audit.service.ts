import { apiService } from './api.service';
import { AuditLog, AuditFilters, AuditStats } from '../types/audit.types';

class AuditService {
  private basePath = '/audit';

  async findAll(filters?: AuditFilters): Promise<{
    data: AuditLog[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.entityId) params.append('entityId', filters.entityId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await apiService.get<{
      data: AuditLog[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(url);
    return response.data;
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    const response = await apiService.get<AuditLog[]>(`${this.basePath}/user/${userId}`);
    return response.data;
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const response = await apiService.get<AuditLog[]>(`${this.basePath}/entity/${entityType}/${entityId}`);
    return response.data;
  }

  async getStats(): Promise<AuditStats> {
    const response = await apiService.get<AuditStats>(`${this.basePath}/stats`);
    return response.data;
  }
}

export const auditService = new AuditService();
