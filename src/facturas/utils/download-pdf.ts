/**
 * Descarga un archivo PDF desde un Blob y abre el diálogo de guardar archivo
 * @param blob - El Blob del PDF
 * @param filename - El nombre del archivo (ej: "recibo-FAC-000001.pdf")
 */
export const downloadPdf = (blob: Blob, filename: string) => {
  try {
    // Crear una URL temporal para el blob
    const url = window.URL.createObjectURL(blob);
    
    // Crear un elemento <a> temporal para descargar
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar la URL temporal después de un tiempo
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    throw new Error('No se pudo descargar el archivo PDF');
  }
};

