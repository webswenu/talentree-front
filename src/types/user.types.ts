export enum UserRole {
    ADMIN_TALENTREE = "admin_talentree",
    COMPANY = "company",
    EVALUATOR = "evaluator",
    WORKER = "worker",
    GUEST = "guest",
}

export interface Company {
    id: string;
    name: string;
    rut?: string;
    industry?: string;
    address?: string;
    city?: string;
    country?: string;
    logo?: string;
    isActive?: boolean;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    company?: Company;
    belongsToCompany?: Company;
    worker?: { id: string };
    rut?: string;
    birthDate?: string | Date;
    notificationPreferences?: {
        emailNotifications?: boolean;
        candidateUpdates?: boolean;
        processReminders?: boolean;
        newEvaluations?: boolean;
    };
}

export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    isActive?: boolean;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface RegisterWorkerDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    rut: string;
    phone?: string;
    birthDate?: string;
    address?: string;
    city?: string;
    region?: string;
    education?: string;
    experience?: string;
}
