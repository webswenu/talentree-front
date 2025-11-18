import { User } from "./user.types";

export interface Company {
    id: string;
    name: string;
    businessName?: string;
    rut: string;
    industry?: string;
    address?: string;
    city?: string;
    country: string;
    logo?: string;
    isActive: boolean;
    contractStartDate?: Date;
    contractEndDate?: Date;
    email?: string;
    phone?: string;
    website?: string;
    description?: string;
    contactPerson?: {
        name: string;
        email: string;
        phone: string;
    };
    user?: User;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCompanyDto {
    name: string;
    rut?: string;
    industry?: string;
    address?: string;
    city?: string;
    country?: string;
    logo?: string;
    userId?: string;
}

export interface UpdateCompanyDto {
    name?: string;
    industry?: string;
    address?: string;
    city?: string;
    logo?: string;
    isActive?: boolean;
    contractEndDate?: Date;
    website?: string;
    description?: string;
    rut?: string;
    email?: string;
    phone?: string;
    userId?: string;
}

export interface CompanyStats {
    total: number;
    active: number;
    inactive: number;
}
