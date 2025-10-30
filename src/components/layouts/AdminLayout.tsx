import { Outlet } from "react-router-dom";
import { Sidebar } from "../common/Sidebar";

export const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="ml-64 p-8">
                <Outlet />
            </div>
        </div>
    );
};
