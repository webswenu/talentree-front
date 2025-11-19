import { apiService } from "./api.service";
import {
    ProcessInvitation,
    CreateProcessInvitationDto,
    BulkInviteWorkersDto,
    BulkInviteResult,
    AcceptProcessInvitationDto,
    AcceptInvitationResponse,
    QueryProcessInvitationsDto,
    ProcessInvitationsPaginated,
} from "../types/process-invitation.types";

class ProcessInvitationsService {
    private basePath = "/process-invitations";

    /**
     * Crea una invitación individual
     */
    async create(
        dto: CreateProcessInvitationDto
    ): Promise<ProcessInvitation> {
        const response = await apiService.post<ProcessInvitation>(
            this.basePath,
            dto
        );
        return response.data;
    }

    /**
     * Crea invitaciones en masa
     */
    async bulkCreate(dto: BulkInviteWorkersDto): Promise<BulkInviteResult> {
        const response = await apiService.post<BulkInviteResult>(
            `${this.basePath}/bulk`,
            dto
        );
        return response.data;
    }

    /**
     * Acepta una invitación (endpoint público)
     */
    async accept(
        dto: AcceptProcessInvitationDto
    ): Promise<AcceptInvitationResponse> {
        const response = await apiService.post<AcceptInvitationResponse>(
            `${this.basePath}/accept`,
            dto
        );
        return response.data;
    }

    /**
     * Lista todas las invitaciones con filtros
     */
    async findAll(
        params?: QueryProcessInvitationsDto
    ): Promise<ProcessInvitationsPaginated> {
        const response = await apiService.get<ProcessInvitationsPaginated>(
            this.basePath,
            { params }
        );
        return response.data;
    }

    /**
     * Obtiene una invitación por token (endpoint público)
     */
    async findByToken(token: string): Promise<ProcessInvitation> {
        const response = await apiService.get<ProcessInvitation>(
            `${this.basePath}/by-token/${token}`
        );
        return response.data;
    }

    /**
     * Obtiene una invitación por ID
     */
    async findOne(id: string): Promise<ProcessInvitation> {
        const response = await apiService.get<ProcessInvitation>(
            `${this.basePath}/${id}`
        );
        return response.data;
    }

    /**
     * Cancela una invitación
     */
    async cancel(id: string): Promise<ProcessInvitation> {
        const response = await apiService.patch<ProcessInvitation>(
            `${this.basePath}/${id}/cancel`
        );
        return response.data;
    }

    /**
     * Reenvía una invitación
     */
    async resend(id: string): Promise<ProcessInvitation> {
        const response = await apiService.patch<ProcessInvitation>(
            `${this.basePath}/${id}/resend`
        );
        return response.data;
    }
}

export const processInvitationsService = new ProcessInvitationsService();
