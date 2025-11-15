import { User } from "./user.types";
import { SelectionProcess } from "./process.types";
import { Worker } from "./worker.types";

export enum ReportType {
    WORKER_EVALUATION = "worker_evaluation",
    PROCESS_SUMMARY = "process_summary",
    TEST_RESULTS = "test_results",
    CUSTOM = "custom",
}

export enum ReportStatus {
    PENDING_APPROVAL = "pending_approval", // Generado automáticamente, esperando descarga y edición
    REVISION_EVALUADOR = "revision_evaluador", // Evaluador subió PDF, esperando revisión de Admin
    REVISION_ADMIN = "revision_admin", // Admin debe revisar antes de aprobar
    APPROVED = "approved", // Aprobado por Admin, visible para Empresa
    REJECTED = "rejected", // Rechazado por Admin
}

export interface Report {
    id: string;
    title: string;
    description?: string;
    type: ReportType;
    status: ReportStatus;
    content?: Record<string, unknown>;
    // New fields for separate file storage
    docxFileUrl?: string;
    docxFileName?: string;
    pdfFileUrl?: string;
    pdfFileName?: string;
    // Deprecated fields (for backward compatibility)
    fileUrl?: string;
    fileName?: string;
    generatedDate?: Date;
    createdBy: User;
    process?: SelectionProcess;
    worker?: Worker;
    approvedBy?: User;
    approvedAt?: Date;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApproveReportDto {
    status: ReportStatus;
    rejectionReason?: string;
}

export interface CreateReportDto {
    title: string;
    description?: string;
    type: ReportType;
    content?: Record<string, unknown>;
    fileUrl?: string;
    fileName?: string;
    generatedDate?: string;
    processId?: string;
    workerId?: string;
}

export type UpdateReportDto = Partial<CreateReportDto>;

export const ReportTypeLabels: Record<ReportType, string> = {
    [ReportType.WORKER_EVALUATION]: "Evaluación de Trabajador",
    [ReportType.PROCESS_SUMMARY]: "Resumen de Proceso",
    [ReportType.TEST_RESULTS]: "Resultados de Tests",
    [ReportType.CUSTOM]: "Personalizado",
};

export const ReportTypeColors: Record<ReportType, string> = {
    [ReportType.WORKER_EVALUATION]: "bg-blue-100 text-blue-800",
    [ReportType.PROCESS_SUMMARY]: "bg-green-100 text-green-800",
    [ReportType.TEST_RESULTS]: "bg-purple-100 text-purple-800",
    [ReportType.CUSTOM]: "bg-gray-100 text-gray-800",
};

export const ReportStatusLabels: Record<ReportStatus, string> = {
    [ReportStatus.PENDING_APPROVAL]: "Pendiente",
    [ReportStatus.REVISION_EVALUADOR]: "Revisión Evaluador",
    [ReportStatus.REVISION_ADMIN]: "Revisión Admin",
    [ReportStatus.APPROVED]: "Aprobado",
    [ReportStatus.REJECTED]: "Rechazado",
};

export const ReportStatusColors: Record<ReportStatus, string> = {
    [ReportStatus.PENDING_APPROVAL]: "bg-gray-100 text-gray-800",
    [ReportStatus.REVISION_EVALUADOR]: "bg-blue-100 text-blue-800",
    [ReportStatus.REVISION_ADMIN]: "bg-purple-100 text-purple-800",
    [ReportStatus.APPROVED]: "bg-green-100 text-green-800",
    [ReportStatus.REJECTED]: "bg-red-100 text-red-800",
};
