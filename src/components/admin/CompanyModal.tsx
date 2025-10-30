/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useCreateCompany, useUpdateCompany } from "../../hooks/useCompanies";
import { useUsers } from "../../hooks/useUsers";
import { Company } from "../../types/company.types";
import { UserRole } from "../../types/user.types";

interface CompanyModalProps {
    company: Company | null;
    onClose: () => void;
}

export const CompanyModal = ({ company, onClose }: CompanyModalProps) => {
    const isEditing = !!company;
    const createMutation = useCreateCompany();
    const updateMutation = useUpdateCompany();
    const { data: users } = useUsers();

    const [formData, setFormData] = useState({
        name: company?.name || "",
        rut: company?.rut || "",
        industry: company?.industry || "",
        address: company?.address || "",
        city: company?.city || "",
        country: company?.country || "Chile",
        userId: company?.user?.id || "",
    });

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name,
                rut: company.rut,
                industry: company.industry || "",
                address: company.address || "",
                city: company.city || "",
                country: company.country,
                userId: company.user?.id || "",
            });
        }
    }, [company]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditing) {
                const { userId, rut, ...updateData } = formData;
                await updateMutation.mutateAsync({
                    id: company.id,
                    data: updateData,
                });
            } else {
                await createMutation.mutateAsync(formData);
            }
            onClose();
        } catch (err) {
            console.error("Error al guardar la empresa:", err);
        }
    };

    const mutation = isEditing ? updateMutation : createMutation;

    const availableUsers =
        users?.filter((u) => u.role === UserRole.COMPANY) || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">
                        {isEditing ? "Editar Empresa" : "Nueva Empresa"}
                    </h2>
                </div>

                {mutation.isError && (
                    <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {mutation.error instanceof Error
                            ? mutation.error.message
                            : "Error al guardar la empresa"}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre de la Empresa *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input"
                                required
                                disabled={mutation.isPending}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                RUT *
                            </label>
                            <input
                                type="text"
                                name="rut"
                                value={formData.rut}
                                onChange={handleChange}
                                className="input"
                                placeholder="12345678-9"
                                required
                                disabled={mutation.isPending || isEditing}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Industria
                            </label>
                            <input
                                type="text"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className="input"
                                placeholder="ej: Minería"
                                disabled={mutation.isPending}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ciudad
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="input"
                                disabled={mutation.isPending}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                País
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="input"
                                disabled={mutation.isPending}
                            />
                        </div>

                        {!isEditing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Usuario Representante *
                                </label>
                                <select
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                    disabled={mutation.isPending}
                                >
                                    <option value="">
                                        Seleccionar usuario...
                                    </option>
                                    {availableUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} (
                                            {user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="input"
                                disabled={mutation.isPending}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={mutation.isPending}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary disabled:opacity-50"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Guardando...
                                </span>
                            ) : isEditing ? (
                                "Actualizar"
                            ) : (
                                "Crear Empresa"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
