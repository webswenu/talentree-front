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

    downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;");
};

export const exportToJSON = (data: unknown, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, "application/json");
};

export const exportToExcel = (data: Row[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);

    const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data
                .map(
                    (row) => `
              <tr>
                ${headers
                    .map((h) => `<td>${String(row[h] ?? "")}</td>`) 
                    .join("")}
              </tr>
            `
                )
                .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

    downloadFile(htmlContent, `${filename}.xls`, "application/vnd.ms-excel");
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
