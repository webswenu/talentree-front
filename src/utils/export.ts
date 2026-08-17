import * as XLSX from "xlsx";

/**
 * P-62. Este módulo no lo usa nadie todavía (los casos de exportación quedaron
 * marcados "No aplica" en el QA), pero tenía dos defectos que iban a aparecer
 * el día que se conectara. Se corrigen ahora, que es barato, en vez de borrar
 * el archivo: la funcionalidad puede estar prevista y eliminarla no me
 * corresponde.
 */
type Row = Record<string, unknown>;

export const exportToCSV = (data: Row[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(","),
        ...data.map((row) =>
            headers
                .map((header) => {
                    const value = row[header];
                    if (
                        typeof value === "string" &&
                        (value.includes(",") || value.includes('"'))
                    ) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return String(value ?? "");
                })
                .join(",")
        ),
    ].join("\n");

    // P-62 (a): sin la marca de orden de bytes al principio, Excel abre el CSV
    // como ANSI y los acentos y la ñ salen corruptos ("Muñoz" -> "MuÃ±oz").
    // Es el defecto que TAB-08 iba a encontrar.
    downloadFile(
        "﻿" + csvContent,
        `${filename}.csv`,
        "text/csv;charset=utf-8;"
    );
};

export const exportToJSON = (data: unknown, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, "application/json");
};

export const exportToExcel = (data: Row[], filename: string) => {
    if (data.length === 0) return;

    /**
     * P-62 (b): antes esto generaba HTML y lo guardaba con extensión .xls.
     * Excel lo abre, pero mostrando una advertencia de formato, y otras
     * herramientas (LibreOffice, Google Sheets, cualquier lector de xlsx) lo
     * rechazan directamente. Además interpolaba los valores sin escapar, así
     * que un dato con "<" rompía la tabla.
     *
     * Se usa `xlsx`, que el proyecto YA tiene instalada, y que genera un
     * archivo real. De paso desaparece el problema del escapado.
     */
    const hoja = XLSX.utils.json_to_sheet(data);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Datos");

    XLSX.writeFile(libro, `${filename}.xlsx`);
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const printPage = () => {
    window.print();
};

export const exportToPDF = () => {
    window.print();
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error("Error copying to clipboard:", err);
        return false;
    }
};

export const downloadImage = async (url: string, filename: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } catch (err) {
        console.error("Error downloading image:", err);
    }
};
