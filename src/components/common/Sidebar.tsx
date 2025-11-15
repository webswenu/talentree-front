import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) return null;

    const sections = getSectionsForRole(user.role);
    const companyLogo = user.company?.logo || user.belongsToCompany?.logo;
    const companyName = user.company?.name || user.belongsToCompany?.name;
    const logo = getLogoForRole(user.role, companyLogo);
    const title = getTitleForRole(
        user.role,
        companyName,
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
        <>
            {/* Botón hamburguesa para mobile */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl glass-sidebar shadow-lg hover:scale-110 transition-transform"
            >
                <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Overlay para cerrar el menú mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-72 glass-sidebar shadow-2xl z-40 border-r border-gray-200 transition-transform duration-300 flex flex-col ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
                {/* Logo y título */}
                <div className="flex-col p-4 lg:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex-shrink-0">
                    <div className="flex flex-col items-center w-full">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-24 lg:h-36 w-auto mb-2 relative z-10 drop-shadow-2xl"
                            />
                        </div>
                        <h2 className="text-xs lg:text-sm font-bold text-gray-900 text-center mt-2 px-2">
                            {title}
                        </h2>
                    </div>
                    <NotificationBell />
                </div>

                {/* Navegación */}
                <nav className="flex-1 overflow-y-auto px-3 py-2">
                    {sections.map((section) => (
                        <Link
    key={section.path}
    to={section.path}
    onClick={() => setIsMobileMenuOpen(false)}
    className={`
        block px-4 py-3.5 my-1 text-sm font-bold rounded-xl transition-all duration-300
        ${
            isActive(section.path)
                ? "bg-gradient-to-r from-primary-500/70 to-secondary-500/70 text-black shadow-xl scale-105"
                : "text-gray-800 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-secondary-500/20 hover:text-primary-700 hover:scale-102 hover:shadow-md"
        }
    `}
>
    <div className="flex items-center gap-3">
        <section.icon size={20} className="text-gray-600" />
        <span>{section.label}</span>
    </div>
</Link>

                    ))}
                </nav>

                {/* User Menu */}
                <div className="flex-shrink-0 p-3 lg:p-4 border-t border-gray-200 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 backdrop-blur-lg">
                    <div className="flex items-center justify-between mb-2 bg-white/70 rounded-xl p-2 lg:p-3 shadow-md border border-gray-200">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs lg:text-sm font-bold text-gray-900 truncate">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-700 truncate font-semibold">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        {logoutMutation.isPending ? "Saliendo..." : "Cerrar Sesión"}
                    </button>
                </div>
            </div>
        </>
    );
};
