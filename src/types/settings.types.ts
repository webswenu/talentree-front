export interface Setting {
    id: string;
    key: string;
    value: unknown;
    description?: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateSettingDto {
    key: string;
    value: unknown;
    description?: string;
    isPublic?: boolean;
}

export interface GeneralSettings {
    system_name?: string;
    contact_email?: string;
    system_description?: string;
    timezone?: string;
    logo_url?: string;
}

export interface NotificationSettings {
    notifications_enabled?: boolean;
    email_notifications?: boolean;
    in_app_notifications?: boolean;
    notification_frequency?: "instant" | "daily" | "weekly";
}

export interface SettingsFormData {
    general: GeneralSettings;
    notifications: NotificationSettings;
}
