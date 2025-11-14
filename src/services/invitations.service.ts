import api from "./api.service";
import { User } from "../types/user.types";

export interface Invitation {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: "pending" | "accepted" | "expired" | "cancelled";
    token: string;
    expiresAt: string;
    acceptedAt?: string;
    companyId: string;
    invitedById: string;
    userId?: string;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        lastLogin?: string;
        isActive: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateInvitationDto {
    email: string;
    firstName: string;
    lastName: string;
}

export interface AcceptInvitationDto {
    token: string;
    password: string;
}

export interface InvitationsResponse {
    sent: Invitation[];
    registered: Invitation[];
    pending: Invitation[];
}

class InvitationsService {
    async createInvitation(
        data: CreateInvitationDto
    ): Promise<{ data: Invitation }> {
        const response = await api.post<{ data: Invitation }>("/invitations", data);
        return response.data;
    }

    async getInvitations(companyId: string): Promise<InvitationsResponse> {
        const response = await api.get<InvitationsResponse>(`/invitations/company/${companyId}`);
        return response.data;
    }

    async getInvitationByToken(token: string): Promise<{ data: Invitation }> {
        const response = await api.get<{ data: Invitation }>(`/invitations/token/${token}`);
        return response.data;
    }

    async acceptInvitation(
        data: AcceptInvitationDto
    ): Promise<{ message: string; user: User }> {
        const response = await api.post<{ message: string; user: User }>("/invitations/accept", data);
        return response.data;
    }

    async resendInvitation(id: string): Promise<{ data: Invitation }> {
        const response = await api.patch<{ data: Invitation }>(`/invitations/${id}/resend`);
        return response.data;
    }

    async cancelInvitation(id: string): Promise<void> {
        await api.delete(`/invitations/${id}`);
    }

    async deactivateUser(userId: string): Promise<void> {
        await api.patch(`/invitations/user/${userId}/deactivate`);
    }

    async reactivateUser(userId: string): Promise<void> {
        await api.patch(`/invitations/user/${userId}/reactivate`);
    }
}

export const invitationsService = new InvitationsService();
