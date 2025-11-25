import { useAuthStore } from "../../store/authStore";

export const CompanyProfilePage = () => {
    const { user } = useAuthStore();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Mi Perfil</h1>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex flex-col sm:flex-row sm:space-x-8 space-y-2 sm:space-y-0">
                    <button className="border-b-2 border-blue-500 py-3 sm:py-4 px-3 sm:px-1 text-sm font-medium text-blue-600 text-left sm:text-center">
                        Información
                    </button>
                    <button className="py-3 sm:py-4 px-3 sm:px-1 text-sm font-medium text-gray-500 text-left sm:text-center">
                        Seguridad
                    </button>
                </nav>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        defaultValue={user?.firstName}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        defaultValue={user?.lastName}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        defaultValue={user?.email}
                        disabled
                    />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
};
