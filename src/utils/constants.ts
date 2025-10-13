export const USER_ROLES = {
  ADMIN_TALENTREE: 'admin_talentree',
  COMPANY: 'company',
  EVALUATOR: 'evaluator',
  WORKER: 'worker',
  GUEST: 'guest'
} as const;

export const PROCESS_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
} as const;

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const TEST_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REVIEWED: 'reviewed'
} as const;

export const ROUTES = {
  PUBLIC: {
    LANDING: '/',
    LOGIN: '/login',
    REGISTER_WORKER: '/register/worker',
    UNAUTHORIZED: '/unauthorized'
  },
  ADMIN: {
    DASHBOARD: '/admin',
    COMPANIES: '/admin/empresas',
    COMPANY_DETAIL: (id: string) => `/admin/empresas/${id}`,
    PROCESSES: '/admin/procesos',
    PROCESS_DETAIL: (id: string) => `/admin/procesos/${id}`,
    TESTS: '/admin/tests',
    TEST_DETAIL: (id: string) => `/admin/tests/${id}`,
    WORKERS: '/admin/trabajadores',
    WORKER_DETAIL: (id: string) => `/admin/trabajadores/${id}`,
    USERS: '/admin/usuarios',
    REPORTS: '/admin/reportes',
    AUDIT: '/admin/auditoria',
    SETTINGS: '/admin/configuracion',
    PROFILE: '/admin/perfil'
  },
  COMPANY: {
    DASHBOARD: '/empresa',
    PROCESSES: '/empresa/procesos',
    PROCESS_DETAIL: (id: string) => `/empresa/procesos/${id}`,
    WORKERS: '/empresa/trabajadores',
    REPORTS: '/empresa/reportes',
    SETTINGS: '/empresa/configuracion',
    PROFILE: '/empresa/perfil'
  },
  EVALUATOR: {
    DASHBOARD: '/evaluador',
    PROCESSES: '/evaluador/procesos',
    PROCESS_DETAIL: (id: string) => `/evaluador/procesos/${id}`,
    TEST_REVIEW: (id: string) => `/evaluador/revisar/${id}`,
    WORKERS: '/evaluador/trabajadores',
    PROFILE: '/evaluador/perfil'
  },
  WORKER: {
    DASHBOARD: '/trabajador',
    PROCESSES: '/trabajador/procesos',
    APPLICATIONS: '/trabajador/postulaciones',
    TEST_TAKING: (id: string) => `/trabajador/test/${id}`,
    RESULTS: '/trabajador/resultados',
    PROFILE: '/trabajador/perfil'
  },
  GUEST: {
    DASHBOARD: '/invitado',
    PROCESS_VIEW: (id: string) => `/invitado/proceso/${id}`,
    REPORTS: '/invitado/reportes'
  }
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const;

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000
} as const;
