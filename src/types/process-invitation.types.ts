export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export enum ProcessInvitationStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",
}

export const ProcessInvitationStatusLabels: Record<ProcessInvitationStatus, string> = {
    [ProcessInvitationStatus.PENDING]: "Pendiente",
    [ProcessInvitationStatus.ACCEPTED]: "Aceptada",
    [ProcessInvitationStatus.EXPIRED]: "Expirada",
    [ProcessInvitationStatus.CANCELLED]: "Cancelada",
};

export const ProcessInvitationStatusColors: Record<ProcessInvitationStatus, string> = {
    [ProcessInvitationStatus.PENDING]: "bg-yellow-100 text-yellow-800",
    [ProcessInvitationStatus.ACCEPTED]: "bg-green-100 text-green-800",
    [ProcessInvitationStatus.EXPIRED]: "bg-gray-100 text-gray-800",
    [ProcessInvitationStatus.CANCELLED]: "bg-red-100 text-red-800",
};

export interface ProcessInvitation {
    id: string;
    processId: string;
    processName?: string;
    email: string;
    firstName: string;
    lastName: string;
    status: ProcessInvitationStatus;
    sentAt: Date | null;
    acceptedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
}

export interface CreateProcessInvitationDto {
    processId: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface InviteeDto {
    email: string;
    firstName: string;
    lastName: string;
}

export interface BulkInviteWorkersDto {
    processId: string;
    invitees: InviteeDto[];
}

export interface BulkInviteResult {
    successful: ProcessInvitation[];
    failed: {
        email: string;
        reason: string;
    }[];
}

export interface AcceptProcessInvitationDto {
    token: string;
}

export interface AcceptInvitationResponse {
    status: "needs_registration" | "needs_worker_profile" | "applied";
    message: string;
    invitation: ProcessInvitation;
    processId?: string;
}

export interface QueryProcessInvitationsDto {
    page?: number;
    limit?: number;
    processId?: string;
    status?: ProcessInvitationStatus;
    search?: string;
}

export type ProcessInvitationsPaginated = PaginatedResult<ProcessInvitation>;
