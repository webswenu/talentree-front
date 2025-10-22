import { Company } from './company.types';
import { User } from './user.types';

export enum ProcessStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export interface SelectionProcess {
  id: string;
  name: string;
  code: string;
  description?: string;
  position: string;
  department?: string;
  location?: string;
  status: ProcessStatus;
  startDate?: Date;
  endDate?: Date;
  maxWorkers?: number;
  vacancies?: number;
  requirements?: string;
  createdAt: Date;
  updatedAt: Date;
  company: Company;
  createdBy: User;
  evaluators?: User[];
}

export interface CreateProcessDto {
  name: string;
  code: string;
  description?: string;
  position: string;
  department?: string;
  location?: string;
  status?: ProcessStatus;
  startDate?: Date;
  endDate?: Date;
  maxWorkers?: number;
  companyId: string;
}

export interface UpdateProcessDto {
  name?: string;
  description?: string;
  position?: string;
  department?: string;
  location?: string;
  status?: ProcessStatus;
  endDate?: Date;
  maxWorkers?: number;
}

export interface AssignEvaluatorsDto {
  evaluatorIds: string[];
}

export const ProcessStatusLabels: Record<ProcessStatus, string> = {
  [ProcessStatus.DRAFT]: 'Borrador',
  [ProcessStatus.ACTIVE]: 'Activo',
  [ProcessStatus.PAUSED]: 'Pausado',
  [ProcessStatus.COMPLETED]: 'Completado',
  [ProcessStatus.CLOSED]: 'Cerrado',
  [ProcessStatus.ARCHIVED]: 'Archivado',
};

export const ProcessStatusColors: Record<ProcessStatus, string> = {
  [ProcessStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [ProcessStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ProcessStatus.PAUSED]: 'bg-yellow-100 text-yellow-800',
  [ProcessStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
  [ProcessStatus.CLOSED]: 'bg-purple-100 text-purple-800',
  [ProcessStatus.ARCHIVED]: 'bg-red-100 text-red-800',
};

export interface ProcessStats {
  total: number;
  byStatus: Record<string, number>;
  byMonth: Array<{ month: string; count: number }>;
}
