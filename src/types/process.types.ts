import { Company } from "./company.types";
import { User } from "./user.types";

export enum ProcessStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    PAUSED = "paused",
    COMPLETED = "completed",
    CLOSED = "closed",
    ARCHIVED = "archived",
}

export enum WorkerStatus {
    PENDING = "pending",
    IN_PROCESS = "in_process",
    APPROVED = "approved",
    REJECTED = "rejected",
    WITHDRAWN = "withdrawn",
}

interface BasicWorkerProcess {
    id: string;
    status: WorkerStatus;
    appliedAt?: Date;
    evaluatedAt?: Date;
    totalScore?: number;
    notes?: string;
    updatedAt?: Date;
    worker?: {
        id: string;
        firstName: string;
        lastName: string;
        rut: string;
        email: string;
        phone?: string;
    };
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
    tests?: Array<{ id: string; name: string }>;
    fixedTests?: Array<{ id: string; name: string; code: string }>;
    workers?: BasicWorkerProcess[];
}

export interface CreateProcessDto {
    name: string;
    code: string;
    description?: string;
    position: string;
    department?: string;
    location?: string;
    status?: ProcessStatus;
    startDate?: string | Date;
    endDate?: string | Date;
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
    endDate?: string | Date;
    maxWorkers?: number;
}

export interface AssignEvaluatorsDto {
    evaluatorIds: string[];
}

export const ProcessStatusLabels: Record<ProcessStatus, string> = {
    [ProcessStatus.DRAFT]: "Borrador",
    [ProcessStatus.ACTIVE]: "Activo",
    [ProcessStatus.PAUSED]: "Pausado",
    [ProcessStatus.COMPLETED]: "Completado",
    [ProcessStatus.CLOSED]: "Cerrado",
    [ProcessStatus.ARCHIVED]: "Archivado",
};

export const ProcessStatusColors: Record<ProcessStatus, string> = {
    [ProcessStatus.DRAFT]: "bg-gray-100 text-gray-800",
    [ProcessStatus.ACTIVE]: "bg-green-100 text-green-800",
    [ProcessStatus.PAUSED]: "bg-yellow-100 text-yellow-800",
    [ProcessStatus.COMPLETED]: "bg-blue-100 text-blue-800",
    [ProcessStatus.CLOSED]: "bg-purple-100 text-purple-800",
    [ProcessStatus.ARCHIVED]: "bg-red-100 text-red-800",
};

export interface ProcessStats {
    total: number;
    byStatus: Record<string, number>;
    byMonth: Array<{ month: string; count: number }>;
}

// Video Requirements Types

export interface VideoQuestion {
    order: number;
    question: string;
    displayAtSecond: number;
}

export interface ProcessVideoRequirement {
    id: string;
    processId: string;
    isRequired: boolean;
    maxDuration?: number; // in seconds
    questions?: VideoQuestion[];
    instructions?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProcessVideoRequirementDto {
    isRequired: boolean;
    maxDuration?: number;
    questions?: VideoQuestion[];
    instructions?: string;
}

export interface UpdateProcessVideoRequirementDto {
    isRequired?: boolean;
    maxDuration?: number;
    questions?: VideoQuestion[];
    instructions?: string;
}
