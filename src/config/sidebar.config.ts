import { UserRole } from "../types/user.types";
import {
    BarChart,
    Building2,
    ClipboardList,
    Search,
    FileText,
    Users,
    User,
    Settings,
    Mail,
    Home,
} from "lucide-react";


export interface SidebarSection {
    path: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    roles: UserRole[];
    badge?: boolean;
}

export const sidebarSections: SidebarSection[] = [
    {
        path: "/admin",
        label: "Inicio",
        icon: Home,
        roles: [UserRole.ADMIN_TALENTREE],
    },
    {
        path: "/empresa",
        label: "Inicio",
        icon: Home,
        roles: [UserRole.COMPANY],
    },
    {
        path: "/evaluador",
        label: "Inicio",
        icon: Home,
        roles: [UserRole.EVALUATOR],
    },
    {
        path: "/trabajador",
        label: "Inicio",
        icon: Home,
        roles: [UserRole.WORKER],
    },
    {
        path: "/invitado",
        label: "Inicio",
        icon: Home,
        roles: [UserRole.GUEST],
    },

    // Empresas
    {
        path: "/admin/empresas",
        label: "Empresas",
        icon: Building2,
        roles: [UserRole.ADMIN_TALENTREE],
    },
    {
        path: "/evaluador/empresas",
        label: "Empresas",
        icon: Building2,
        roles: [UserRole.EVALUATOR],
    },

    // Procesos
    {
        path: "/admin/procesos",
        label: "Procesos",
        icon: ClipboardList,
        roles: [UserRole.ADMIN_TALENTREE],
    },
    {
        path: "/empresa/procesos",
        label: "Mis Procesos",
        icon: ClipboardList,
        roles: [UserRole.COMPANY],
    },
    {
        path: "/evaluador/procesos",
        label: "Procesos Asignados",
        icon: ClipboardList,
        roles: [UserRole.EVALUATOR],
    },
    {
        path: "/trabajador/procesos",
        label: "Ofertas Disponibles",
        icon: Search,
        roles: [UserRole.WORKER],
    },
    {
        path: "/invitado/procesos",
        label: "Procesos",
        icon: ClipboardList,
        roles: [UserRole.GUEST],
    },

    // Tests
    {
        path: "/admin/tests",
        label: "Tests",
        icon: FileText,
        roles: [UserRole.ADMIN_TALENTREE],
    },
    {
        path: "/evaluador/tests",
        label: "Tests",
        icon: FileText,
        roles: [UserRole.EVALUATOR],
    },

    // Postulaciones
    {
        path: "/trabajador/postulaciones",
        label: "Mis Aplicaciones",
        icon: FileText,
        roles: [UserRole.WORKER],
    },

    // Trabajadores / Candidatos
    {
        path: "/admin/trabajadores",
        label: "Trabajadores",
        icon: Users,
        roles: [UserRole.ADMIN_TALENTREE],
    },
    {
        path: "/empresa/trabajadores",
        label: "Candidatos",
        icon: Users,
        roles: [UserRole.COMPANY],
    },
    {
        path: "/evaluador/trabajadores",
        label: "Candidatos",
        icon: Users,
        roles: [UserRole.EVALUATOR],
    },
    {
        path: "/invitado/trabajadores",
        label: "Candidatos",
        icon: Users,
        roles: [UserRole.GUEST],
    },

    // Invitaciones
    {
        path: "/empresa/invitaciones",
        label: "Invitaciones",
        icon: Mail,
        roles: [UserRole.COMPANY],
    },

    // Usuarios
    {
        path: "/admin/usuarios",
        label: "Usuarios",
        icon: User,
        roles: [UserRole.ADMIN_TALENTREE],
    },

    // Reportes
    {
        path: "/admin/reportes",
        label: "Reportes",
        icon: BarChart,
        roles: [UserRole.ADMIN_TALENTREE],
    },
    {
        path: "/empresa/reportes",
        label: "Reportes",
        icon: BarChart,
        roles: [UserRole.COMPANY],
    },
    {
        path: "/evaluador/reportes",
        label: "Reportes",
        icon: BarChart,
        roles: [UserRole.EVALUATOR],
    },
    {
        path: "/invitado/reportes",
        label: "Reportes",
        icon: BarChart,
        roles: [UserRole.GUEST],
    },

    // Auditoría
    {
        path: "/admin/auditoria",
        label: "Auditoría",
        icon: Search,
        roles: [UserRole.ADMIN_TALENTREE],
    },

    // Configuración
    {
        path: "/admin/configuracion",
        label: "Configuración",
        icon: Settings,
        roles: [UserRole.ADMIN_TALENTREE],
    },
    {
        path: "/empresa/configuracion",
        label: "Configuración",
        icon: Settings,
        roles: [UserRole.COMPANY],
    },
    {
        path: "/evaluador/configuracion",
        label: "Configuración",
        icon: Settings,
        roles: [UserRole.EVALUATOR],
    },
    {
        path: "/invitado/configuracion",
        label: "Configuración",
        icon: Settings,
        roles: [UserRole.GUEST],
    },
    {
        path: "/trabajador/perfil",
        label: "Mi Perfil",
        icon: User,
        roles: [UserRole.WORKER],
    },
];


/**
 * Obtiene las secciones de sidebar visibles para un rol específico
 */
export const getSectionsForRole = (role: UserRole): SidebarSection[] => {
    return sidebarSections.filter((section) => section.roles.includes(role));
};

/**
 * Obtiene el logo según el rol
 */
export const getLogoForRole = (
    role: UserRole,
    companyLogo?: string
): string => {
    if ((role === UserRole.COMPANY || role === UserRole.GUEST) && companyLogo) {
        return companyLogo;
    }
    return "/talentreelogo.png";
};

/**
 * Obtiene el título de la sidebar según el rol
 */
export const getTitleForRole = (
    role: UserRole,
    companyName?: string,
    userName?: string
): string => {
    switch (role) {
        case UserRole.ADMIN_TALENTREE:
            return "Admin Talentree";
        case UserRole.COMPANY:
            return companyName || "Mi Empresa";
        case UserRole.EVALUATOR:
            return "Evaluador";
        case UserRole.WORKER:
            return userName || "Trabajador";
        case UserRole.GUEST:
            return companyName || "Invitado";
        default:
            return "Talentree";
    }
};
