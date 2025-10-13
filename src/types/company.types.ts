import { User } from './user.types';

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
  rut: string;
  industry?: string;
  address?: string;
  city?: string;
  country?: string;
  logo?: string;
  userId: string; // ID del usuario que será el representante de la empresa
}

export interface UpdateCompanyDto {
  name?: string;
  industry?: string;
  address?: string;
  city?: string;
  logo?: string;
  isActive?: boolean;
  contractEndDate?: Date;
}
