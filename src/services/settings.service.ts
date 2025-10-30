import { apiService } from "./api.service";
import {
    Setting,
    UpdateSettingDto,
    GeneralSettings,
    NotificationSettings,
} from "../types/settings.types";

class SettingsService {
    private basePath = "/settings";

    async findAll(): Promise<Setting[]> {
        const response = await apiService.get<Setting[]>(this.basePath);
        return response.data;
    }

    async findPublic(): Promise<Setting[]> {
        const response = await apiService.get<Setting[]>(
            `${this.basePath}/public`
        );
        return response.data;
    }

    async findByKey(key: string): Promise<Setting> {
        const response = await apiService.get<Setting>(
            `${this.basePath}/${key}`
        );
        return response.data;
    }

    async getGeneralSettings(): Promise<GeneralSettings> {
        const response = await apiService.get<GeneralSettings>(
            `${this.basePath}/general`
        );
        return response.data;
    }

    async getNotificationSettings(): Promise<NotificationSettings> {
        const response = await apiService.get<NotificationSettings>(
            `${this.basePath}/notifications`
        );
        return response.data;
    }

    async upsert(data: UpdateSettingDto): Promise<Setting> {
        const response = await apiService.put<Setting>(this.basePath, data);
        return response.data;
    }

    async upsertBatch(settings: UpdateSettingDto[]): Promise<Setting[]> {
        const response = await apiService.put<Setting[]>(
            `${this.basePath}/batch`,
            { settings }
        );
        return response.data;
    }

    async delete(key: string): Promise<void> {
        await apiService.delete(`${this.basePath}/${key}`);
    }

    async initializeDefaults(): Promise<void> {
        await apiService.post(`${this.basePath}/initialize`, {});
    }
}

export const settingsService = new SettingsService();
