import { Outlet } from "react-router-dom";
import { Sidebar } from "../common/Sidebar";

export const GuestLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-100/15 via-secondary-100/15 to-primary-200/15 relative overflow-hidden">
            {/* Fondo animado con burbujas sutiles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-primary-400/8 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
                <div className="absolute top-40 right-20 w-[28rem] h-[28rem] bg-secondary-400/8 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-400/6 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            <Sidebar />
            <div className="lg:ml-72 p-6 md:p-8 lg:p-12 xl:p-16 pt-20 lg:pt-8 relative z-10">
                <Outlet />
            </div>
        </div>
    );
};
