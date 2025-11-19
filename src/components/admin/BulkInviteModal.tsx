import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { InviteeDto } from "../../types/process-invitation.types";
import { useBulkCreateProcessInvitations } from "../../hooks/useProcessInvitations";

interface BulkInviteModalProps {
    isOpen: boolean;
    processId: string;
    onClose: () => void;
}

export const BulkInviteModal = ({ isOpen, processId, onClose }: BulkInviteModalProps) => {
    const [invitees, setInvitees] = useState<InviteeDto[]>([]);
    const [fileName, setFileName] = useState<string>("");
    const [parseError, setParseError] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bulkCreateMutation = useBulkCreateProcessInvitations();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setParseError("");
        setInvitees([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });

                // Leer la primera hoja
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

                // Validar que tenga al menos el header y una fila de datos
                if (jsonData.length < 2) {
                    setParseError("El archivo Excel debe tener al menos una fila de datos además del encabezado");
                    return;
                }

                // Parsear datos (asumiendo: Columna A = Nombre Completo, Columna B = Email)
                // O si tienen 3 columnas: A = Nombre, B = Apellido, C = Email
                const parsedInvitees: InviteeDto[] = [];
                const errors: string[] = [];

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];

                    // Saltar filas vacías
                    if (!row || row.length === 0 || !row[0]) continue;

                    let firstName = "";
                    let lastName = "";
                    let email = "";

                    // Caso 1: 3 columnas (Nombre, Apellido, Email)
                    if (row.length >= 3) {
                        firstName = String(row[0] || "").trim();
                        lastName = String(row[1] || "").trim();
                        email = String(row[2] || "").trim();
                    }
                    // Caso 2: 2 columnas (Nombre Completo, Email)
                    else if (row.length >= 2) {
                        const fullName = String(row[0] || "").trim();
                        const nameParts = fullName.split(" ");
                        firstName = nameParts[0] || "";
                        lastName = nameParts.slice(1).join(" ") || nameParts[0]; // Si solo tiene 1 palabra, usar como apellido también
                        email = String(row[1] || "").trim();
                    }
                    else {
                        errors.push(`Fila ${i + 1}: Formato inválido`);
                        continue;
                    }

                    // Validar email básico
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        errors.push(`Fila ${i + 1}: Email inválido (${email})`);
                        continue;
                    }

                    if (!firstName || !lastName) {
                        errors.push(`Fila ${i + 1}: Nombre o apellido vacío`);
                        continue;
                    }

                    parsedInvitees.push({ firstName, lastName, email });
                }

                if (errors.length > 0) {
                    setParseError(`Se encontraron ${errors.length} error(es):\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n... y ${errors.length - 5} más` : ""}`);
                }

                if (parsedInvitees.length === 0) {
                    setParseError("No se pudieron parsear datos válidos del archivo Excel");
                    return;
                }

                setInvitees(parsedInvitees);
            } catch (error) {
                console.error("Error parsing Excel:", error);
                setParseError("Error al leer el archivo Excel. Asegúrate de que sea un archivo válido.");
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleSubmit = async () => {
        if (invitees.length === 0) return;

        try {
            await bulkCreateMutation.mutateAsync({
                processId,
                invitees,
            });
            handleClose();
        } catch (error) {
            // Error manejado por el hook
        }
    };

    const handleClose = () => {
        setInvitees([]);
        setFileName("");
        setParseError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Invitación Masiva por Excel
                </h3>

                <div className="space-y-4">
                    {/* Instrucciones */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">📋 Formato del archivo Excel:</h4>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li><strong>Opción 1 (3 columnas):</strong> Columna A = Nombre, B = Apellido, C = Email</li>
                            <li><strong>Opción 2 (2 columnas):</strong> Columna A = Nombre Completo, B = Email</li>
                            <li>La primera fila puede ser encabezados (se ignora)</li>
                            <li>Los emails deben ser válidos</li>
                        </ul>
                    </div>

                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar archivo Excel
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                cursor-pointer"
                        />
                        {fileName && (
                            <p className="mt-2 text-sm text-gray-600">
                                Archivo seleccionado: <span className="font-medium">{fileName}</span>
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {parseError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 whitespace-pre-line">{parseError}</p>
                        </div>
                    )}

                    {/* Preview */}
                    {invitees.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                                Invitaciones a enviar ({invitees.length}):
                            </h4>
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Apellido</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {invitees.map((invitee, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{invitee.firstName}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{invitee.lastName}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600">{invitee.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={bulkCreateMutation.isPending || invitees.length === 0}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {bulkCreateMutation.isPending
                            ? `Enviando ${invitees.length} invitaciones...`
                            : `Enviar ${invitees.length} invitaciones`}
                    </button>
                    <button
                        onClick={handleClose}
                        disabled={bulkCreateMutation.isPending}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
