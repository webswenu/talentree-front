export enum UserRole {
  ADMIN_TALENTREE = 'admin_talentree',
  COMPANY = 'company',
  EVALUATOR = 'evaluator',
  WORKER = 'worker',
  GUEST = 'guest',
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
  company?: Company;           // Cuando el user ES dueño de una empresa (role=company)
  belongsToCompany?: Company;  // Cuando el user pertenece a una empresa (role=guest, evaluator, etc.)
  worker?: any;
  rut?: string;
  birthDate?: string | Date;
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
  // Datos de cuenta
  email: string;
  password: string;
  // Datos personales básicos
  firstName: string;
  lastName: string;
  rut: string;
  phone?: string;
  // Datos adicionales (opcionales)
  birthDate?: string;
  address?: string;
  city?: string;
  region?: string;
  education?: string;
  experience?: string;
}
