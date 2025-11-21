import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { usePublicProcesses } from "../../hooks/useProcesses";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types/user.types";
import { workersService } from "../../services/workers.service";
import { toast } from "../../utils/toast";
import { Navbar } from "../../components/public/Navbar";
import { Footer } from "../../components/public/Footer";

export const OpportunitiesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [applyingProcessId, setApplyingProcessId] = useState<string | null>(null);
    const limit = 12;

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { data: processesData, isLoading: isLoadingProcesses } = usePublicProcesses({ page, limit });
    const allProcesses = processesData?.data || [];
   const totalPages = processesData?.meta?.totalPages || 1;


    // Filtrar procesos por búsqueda
    const filteredProcesses = allProcesses.filter((process: any) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            process.position?.toLowerCase().includes(search) ||
            process.company?.name?.toLowerCase().includes(search) ||
            process.location?.toLowerCase().includes(search) ||
            process.department?.toLowerCase().includes(search) ||
            process.description?.toLowerCase().includes(search)
        );
    });

    const handleApplyToProcess = async (processId: string) => {
        // Si no está logueado, redirigir a login con el processId como parámetro
        if (!user) {
            navigate(`/login?redirect=/oportunidades&process=${processId}`);
            return;
        }

        // Si está logueado pero no es WORKER, mostrar error
        if (user.role !== UserRole.WORKER) {
            toast.error("Solo los trabajadores pueden postular a procesos");
            return;
        }

        // Si es WORKER, postular directamente
        if (!user.worker?.id) {
            toast.error("No se encontró tu perfil de trabajador");
            return;
        }

        try {
            setApplyingProcessId(processId);
            await workersService.applyToProcess({
                workerId: user.worker.id,
                processId: processId,
            });
            toast.success("¡Postulación enviada exitosamente!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al postular al proceso");
        } finally {
            setApplyingProcessId(null);
        }
    };

    return (
        <div className="font-sans text-gray-800 min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-56 pb-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4 text-gray-900">
                            Oportunidades Laborales
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Explora todas las oportunidades disponibles y encuentra tu próximo desafío profesional
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8 max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por cargo, empresa, ubicación, departamento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-6 py-4 pr-12 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                            />
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoadingProcesses ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 mt-4">Cargando oportunidades...</p>
                        </div>
                    ) : filteredProcesses.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                            <p className="text-gray-500 text-lg mb-2">
                                {searchTerm
                                    ? "No se encontraron oportunidades que coincidan con tu búsqueda."
                                    : "No hay oportunidades activas en este momento."}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-orange-600 hover:text-orange-700 font-semibold mt-4"
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Results Count */}
                            <div className="mb-6 text-gray-600">
                                Mostrando <span className="font-semibold">{filteredProcesses.length}</span> oportunidad{filteredProcesses.length !== 1 ? 'es' : ''}
                            </div>

                            {/* Opportunities Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {filteredProcesses.map((process: any) => (
                                    <div
                                        key={process.id}
                                        className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                    {process.position}
                                                </h3>
                                                <p className="text-sm text-teal-600 font-medium">
                                                    {process.company?.name || "Empresa"}
                                                </p>
                                            </div>
                                        </div>

                                        {process.location && (
                                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                                <span className="mr-1">📍</span>
                                                <span>{process.location}</span>
                                            </div>
                                        )}

                                        {process.description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                {process.description}
                                            </p>
                                        )}

                                        {process.department && (
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                                    {process.department}
                                                </span>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleApplyToProcess(process.id)}
                                            disabled={applyingProcessId === process.id}
                                            className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 mt-auto ${
                                                applyingProcessId === process.id
                                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                                    : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 hover:shadow-lg hover:scale-105"
                                            }`}
                                        >
                                            {applyingProcessId === process.id ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                    Postulando...
                                                </span>
                                            ) : (
                                                "Postular →"
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {!searchTerm && totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        ← Anterior
                                    </button>
                                    <span className="text-gray-600">
                                        Página {page} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                        className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};
