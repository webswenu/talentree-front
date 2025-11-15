import apiService from "./api.service";
import { User, CreateUserDto, UpdateUserDto } from "../types/user.types";

class UsersService {
    async getAll(params?: {
        role?: string;
        status?: string;
        search?: string;
    }): Promise<User[]> {
        const { data } = await apiService.get<User[]>("/users", { params });
        return data;
    }

    async getOne(id: string): Promise<User> {
        const { data } = await apiService.get<User>(`/users/${id}`);
        return data;
    }

    async create(userData: CreateUserDto): Promise<User> {
        const { data } = await apiService.post<User>("/users", userData);
        return data;
    }

    async update(id: string, userData: UpdateUserDto): Promise<User> {
        const { data } = await apiService.patch<User>(`/users/${id}`, userData);
        return data;
    }

    async delete(id: string): Promise<void> {
        await apiService.delete(`/users/${id}`);
    }

    async activate(id: string): Promise<User> {
        const { data } = await apiService.patch<User>(`/users/${id}/activate`);
        return data;
    }

    async deactivate(id: string): Promise<User> {
        const { data } = await apiService.patch<User>(
            `/users/${id}/deactivate`
        );
        return data;
    }

    async changePassword(
        currentPassword: string,
        newPassword: string
    ): Promise<{ message: string }> {
        const { data } = await apiService.patch<{ message: string }>(
            "/users/change-password",
            {
                currentPassword,
                newPassword,
            }
        );
        return data;
    }

    async getByRole(role: string): Promise<User[]> {
        const { data } = await apiService.get<User[]>(`/users/by-role/${role}`);
        return data;
    }

    async getByCompany(companyId: string): Promise<User[]> {
        const { data } = await apiService.get<User[]>(
            `/users/by-company/${companyId}`
        );
        return data;
    }

    async updateNotificationPreferences(preferences: {
        emailNotifications?: boolean;
        newProcesses?: boolean;
        applicationUpdates?: boolean;
        testReminders?: boolean;
        newEvaluations?: boolean;
        candidateUpdates?: boolean;
        processReminders?: boolean;
    }): Promise<User> {
        const { data } = await apiService.patch<User>(
            "/users/notification-preferences",
            preferences
        );
        return data;
    }

    async resetPassword(userId: string, newPassword: string): Promise<{ message: string }> {
        const { data } = await apiService.patch<{ message: string }>(
            `/users/${userId}/reset-password`,
            { newPassword }
        );
        return data;
    }
}

export const usersService = new UsersService();
export default usersService;
