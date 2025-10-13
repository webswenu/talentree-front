import { User } from './user.types';
import { SelectionProcess } from './process.types';

export enum WorkerStatus {
  PENDING = 'pending',
  IN_PROCESS = 'in_process',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIRED = 'hired',
}

export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  rut: string;
  email: string;
  phone?: string;
  birthDate?: Date;
  address?: string;
  city?: string;
  region?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  cvUrl?: string;
  isActive?: boolean;
  user?: User;
  workerProcesses?: WorkerProcess[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerProcess {
  id: string;
  status: WorkerStatus;
  appliedAt?: Date;
  evaluatedAt?: Date;
  totalScore?: number;
  notes?: string;
  metadata?: Record<string, any>;
  worker: Worker;
  process: SelectionProcess;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkerDto {
  firstName: string;
  lastName: string;
  rut: string;
  email: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  region?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  cvUrl?: string;
}

export interface UpdateWorkerDto extends Partial<CreateWorkerDto> {}

export interface ApplyToProcessDto {
  workerId: string;
  processId: string;
  notes?: string;
}

export interface UpdateWorkerProcessStatusDto {
  status: WorkerStatus;
  totalScore?: number;
  notes?: string;
}

export const WorkerStatusLabels: Record<WorkerStatus, string> = {
  [WorkerStatus.PENDING]: 'Pendiente',
  [WorkerStatus.IN_PROCESS]: 'En Proceso',
  [WorkerStatus.APPROVED]: 'Aprobado',
  [WorkerStatus.REJECTED]: 'Rechazado',
  [WorkerStatus.HIRED]: 'Contratado',
};

export const WorkerStatusColors: Record<WorkerStatus, string> = {
  [WorkerStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [WorkerStatus.IN_PROCESS]: 'bg-blue-100 text-blue-800',
  [WorkerStatus.APPROVED]: 'bg-green-100 text-green-800',
  [WorkerStatus.REJECTED]: 'bg-red-100 text-red-800',
  [WorkerStatus.HIRED]: 'bg-purple-100 text-purple-800',
};
