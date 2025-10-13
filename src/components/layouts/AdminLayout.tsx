import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';
import NotificationBell from '../common/NotificationBell';

export const AdminLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const logoutMutation = useLogout();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { path: '/admin', label: 'Inicio', icon: '📊' },
    { path: '/admin/empresas', label: 'Empresas', icon: '🏢' },
    { path: '/admin/procesos', label: 'Procesos', icon: '📋' },
    { path: '/admin/tests', label: 'Tests', icon: '📝' },
    { path: '/admin/trabajadores', label: 'Trabajadores', icon: '👥' },
    { path: '/admin/usuarios', label: 'Usuarios', icon: '👤' },
    { path: '/admin/auditoria', label: 'Auditoría', icon: '🔍' },
    { path: '/admin/reportes', label: 'Reportes', icon: '📄' },
    { path: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-10">
        <div className="flex-col p-6 border-b flex justify-between items-center">
          <div>
            <img src="/talentreelogo.png" alt="Talentree Logo" className="h-20 md:h-24 lg:h-40 w-auto" />
          </div>
          <NotificationBell />
        </div>

        <nav className="mt-2 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                block px-6 py-3 text-sm font-medium transition-colors
                ${isActive(item.path)
                  ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {logoutMutation.isPending ? 'Saliendo...' : 'Cerrar Sesión'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
};
