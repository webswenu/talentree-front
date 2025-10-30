import { User } from "./user.types";
import { SelectionProcess } from "./process.types";
import { Worker } from "./worker.types";

export enum ReportType {
    WORKER_EVALUATION = "worker_evaluation",
    PROCESS_SUMMARY = "process_summary",
    TEST_RESULTS = "test_results",
    CUSTOM = "custom",
}

export interface Report {
    id: string;
    title: string;
    description?: string;
    type: ReportType;
    content?: Record<string, unknown>;
    fileUrl?: string;
    fileName?: string;
    generatedDate?: Date;
    createdBy: User;
    process?: SelectionProcess;
    worker?: Worker;
    createdAt: Date;
    updatedAt: Date;
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
