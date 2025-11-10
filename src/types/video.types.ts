export enum VideoRequirementStatus {
    PENDING_REVIEW = "pending_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    RESUBMISSION_REQUIRED = "resubmission_required",
}

export interface WorkerVideoRequirement {
    id: string;
    workerId: string;
    processId: string;
    workerProcessId?: string;
    videoUrl: string;
    videoDuration?: number;
    videoSize?: number;
    status: VideoRequirementStatus;
    reviewNotes?: string;
    reviewedAt?: Date;
    recordedAt: Date;
    deviceInfo?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface UploadVideoDto {
    workerId: string;
    processId: string;
    workerProcessId?: string;
    videoUrl: string;
    videoDuration?: number;
    videoSize?: number;
    deviceInfo?: Record<string, any>;
}

export interface VideoStatusResponse {
    hasVideo: boolean;
    status: VideoRequirementStatus | null;
    video: WorkerVideoRequirement | null;
    canAccessTests: boolean;
}
