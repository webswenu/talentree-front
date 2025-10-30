import type { User } from "./user.types";

export enum NotificationType {
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error",
    PROCESS_UPDATE = "process_update",
    TEST_ASSIGNED = "test_assigned",
    EVALUATION_COMPLETED = "evaluation_completed",
    REPORT_READY = "report_ready",
}

export interface Notification {
    id: string;
    title: string;
    message?: string;
    type: NotificationType;
    isRead: boolean;
    read: boolean;
    link?: string;
    data?: Record<string, unknown>;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNotificationDto {
    title: string;
    message?: string;
    type: NotificationType;
    link?: string;
    data?: Record<string, unknown>;
    userId: string;
}

export const NotificationTypeColors: Record<NotificationType, string> = {
    [NotificationType.INFO]: "bg-blue-100 text-blue-800",
    [NotificationType.SUCCESS]: "bg-green-100 text-green-800",
    [NotificationType.WARNING]: "bg-yellow-100 text-yellow-800",
    [NotificationType.ERROR]: "bg-red-100 text-red-800",
    [NotificationType.PROCESS_UPDATE]: "bg-purple-100 text-purple-800",
    [NotificationType.TEST_ASSIGNED]: "bg-indigo-100 text-indigo-800",
    [NotificationType.EVALUATION_COMPLETED]: "bg-teal-100 text-teal-800",
    [NotificationType.REPORT_READY]: "bg-orange-100 text-orange-800",
};
