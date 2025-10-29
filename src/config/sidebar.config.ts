import { UserRole } from '../types/user.types';

export interface SidebarSection {
  path: string;
  label: string;
  icon: string;
  roles: UserRole[];
  badge?: boolean; // Si debe mostrar badge de notificaciones
}

export const sidebarSections: SidebarSection[] = [
  // Dashboard - Todos los roles
  {
    path: '/admin',
    label: 'Inicio',
    icon: '📊',
    roles: [UserRole.ADMIN_TALENTREE],
  },
  {
    path: '/empresa',
    label: 'Inicio',
    icon: '📊',
    roles: [UserRole.COMPANY],
  },
  {
    path: '/evaluador',
    label: 'Inicio',
    icon: '📊',
    roles: [UserRole.EVALUATOR],
  },
  {
    path: '/trabajador',
    label: 'Inicio',
    icon: '📊',
    roles: [UserRole.WORKER],
  },
  {
    path: '/invitado',
    label: 'Inicio',
    icon: '📊',
    roles: [UserRole.GUEST],
  },

  // Empresas - Admin y Evaluator (evaluator en modo lectura)
  {
    path: '/admin/empresas',
    label: 'Empresas',
    icon: '🏢',
    roles: [UserRole.ADMIN_TALENTREE],
  },
  {
    path: '/evaluador/empresas',
    label: 'Empresas',
    icon: '🏢',
    roles: [UserRole.EVALUATOR],
  },

  // Procesos - Admin, Company, Evaluator, Worker (diferentes paths)
  {
    path: '/admin/procesos',
    label: 'Procesos',
    icon: '📋',
    roles: [UserRole.ADMIN_TALENTREE],
  },
  {
    path: '/empresa/procesos',
    label: 'Mis Procesos',
    icon: '📋',
    roles: [UserRole.COMPANY],
  },
  {
    path: '/evaluador/procesos',
    label: 'Procesos Asignados',
    icon: '📋',
    roles: [UserRole.EVALUATOR],
  },
  {
    path: '/trabajador/procesos',
    label: 'Ofertas Disponibles',
    icon: '🔍',
    roles: [UserRole.WORKER],
  },
  {
    path: '/invitado/procesos',
    label: 'Procesos',
    icon: '📋',
    roles: [UserRole.GUEST],
  },

  // Tests - Admin, Evaluator (evaluator en modo lectura)
  {
    path: '/admin/tests',
    label: 'Tests',
    icon: '📝',
    roles: [UserRole.ADMIN_TALENTREE],
  },
  {
    path: '/evaluador/tests',
    label: 'Tests',
    icon: '📝',
    roles: [UserRole.EVALUATOR],
  },

  // Mis Aplicaciones - Solo Worker
  {
    path: '/trabajador/postulaciones',
    label: 'Mis Aplicaciones',
    icon: '📝',
    roles: [UserRole.WORKER],
  },

  // Resultados - Solo Worker
  {
    path: '/trabajador/resultados',
    label: 'Mis Resultados',
    icon: '📊',
    roles: [UserRole.WORKER],
  },

  // Candidatos/Trabajadores - Admin, Company, Evaluator
  {
    path: '/admin/trabajadores',
    label: 'Trabajadores',
    icon: '👥',
    roles: [UserRole.ADMIN_TALENTREE],
  },
  {
    path: '/empresa/trabajadores',
    label: 'Candidatos',
    icon: '👥',
    roles: [UserRole.COMPANY],
  },
  {
    path: '/evaluador/trabajadores',
    label: 'Candidatos',
    icon: '👥',
    roles: [UserRole.EVALUATOR],
  },
  {
    path: '/invitado/trabajadores',
    label: 'Candidatos',
    icon: '👥',
    roles: [UserRole.GUEST],
  },

  // Usuarios - Admin y Evaluator (evaluator en modo lectura)
  {
    path: '/admin/usuarios',
    label: 'Usuarios',
    icon: '👤',
    roles: [UserRole.ADMIN_TALENTREE],
  },
  {
    path: '/evaluador/usuarios',
    label: 'Usuarios',
    icon: '👤',
    roles: [UserRole.EVALUATOR],
  },

  // Reportes - Admin y Evaluator (evaluator en modo lectura, COMPANY y GUEST NO tienen acceso)
  {
    path: '/admin/reportes',
    label: 'Reportes',
    icon: '📄',
    roles: [UserRole.ADMIN_TALENTREE],
  },
  {
    path: '/evaluador/reportes',
    label: 'Reportes',
    icon: '📄',
    roles: [UserRole.EVALUATOR],
  },

  // Auditoría - Solo Admin
  {
    path: '/admin/auditoria',
    label: 'Auditoría',
    icon: '🔍',
    roles: [UserRole.ADMIN_TALENTREE],
  },

  // Configuración - Admin, Company, Evaluator, Worker (Guest tiene solo perfil)
  {
    path: '/admin/configuracion',
    label: 'Configuración',
    icon: '⚙️',
    roles: [UserRole.ADMIN_TALENTREE],
  },
  {
    path: '/empresa/configuracion',
    label: 'Configuración',
    icon: '⚙️',
    roles: [UserRole.COMPANY],
  },
  {
    path: '/evaluador/configuracion',
    label: 'Configuración',
    icon: '⚙️',
    roles: [UserRole.EVALUATOR],
  },
  {
    path: '/trabajador/perfil',
    label: 'Mi Perfil',
    icon: '⚙️',
    roles: [UserRole.WORKER],
  },
  {
    path: '/invitado/perfil',
    label: 'Mi Perfil',
    icon: '⚙️',
    roles: [UserRole.GUEST],
  },
];

/**
 * Obtiene las secciones de sidebar visibles para un rol específico
 */
export const getSectionsForRole = (role: UserRole): SidebarSection[] => {
  return sidebarSections.filter(section => section.roles.includes(role));
};

/**
 * Obtiene el logo según el rol
 */
export const getLogoForRole = (role: UserRole, companyLogo?: string): string => {
  if ((role === UserRole.COMPANY || role === UserRole.GUEST) && companyLogo) {
    return companyLogo;
  }
  return '/talentreelogo.png';
};

/**
 * Obtiene el título de la sidebar según el rol
 */
export const getTitleForRole = (role: UserRole, companyName?: string, userName?: string): string => {
  switch (role) {
    case UserRole.ADMIN_TALENTREE:
      return 'Admin Talentree';
    case UserRole.COMPANY:
      return companyName || 'Mi Empresa';
    case UserRole.EVALUATOR:
      return 'Evaluador';
    case UserRole.WORKER:
      return userName || 'Trabajador';
    case UserRole.GUEST:
      return companyName || 'Invitado';
    default:
      return 'Talentree';
  }
};
