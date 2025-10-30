import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import NotificationBell from "./NotificationBell";
import {
    getSectionsForRole,
    getLogoForRole,
    getTitleForRole,
} from "../../config/sidebar.config";

export const Sidebar = () => {
    const { user } = useAuthStore();
    const location = useLocation();
    const logoutMutation = useLogout();

    if (!user) return null;

    const sections = getSectionsForRole(user.role);
    const logo = getLogoForRole(user.role, user.company?.logo);
    const title = getTitleForRole(
        user.role,
        user.company?.name,
        `${user.firstName} ${user.lastName}`
    );

    const isActive = (path: string) => {
        return (
            location.pathname === path ||
            location.pathname.startsWith(path + "/")
        );
    };

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    return (
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-10">
            {/* Logo y título */}
            <div className="flex-col p-6 border-b flex justify-between items-center">
                <div className="flex flex-col items-center w-full">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-20 md:h-24 lg:h-32 w-auto mb-2"
                    />
                    <h2 className="text-sm font-semibold text-gray-700 text-center">
                        {title}
                    </h2>
                </div>
                <NotificationBell />
            </div>

            {/* Navegación */}
            <nav
                className="mt-2 overflow-y-auto"
                style={{ height: "calc(100vh - 220px)" }}
            >
                {sections.map((section) => (
                    <Link
                        key={section.path}
                        to={section.path}
                        className={`
              block px-6 py-3 text-sm font-medium transition-colors
              ${
                  isActive(section.path)
                      ? "bg-primary-50 text-primary-600 border-r-4 border-primary-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
              }
            `}
                    >
                        <span className="mr-3">{section.icon}</span>
                        {section.label}
                    </Link>
                ))}
            </nav>

            {/* User Menu */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user.email}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                    {logoutMutation.isPending ? "Saliendo..." : "Cerrar Sesión"}
                </button>
            </div>
        </div>
    );
};
