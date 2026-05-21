import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exporta un arreglo de objetos a un archivo Excel (.xlsx)
   * @param data Arreglo de datos
   * @param filename Nombre del archivo (sin extensión)
   */
  exportToExcel(data: any[], filename: string): void {
    if (!data || data.length === 0) return;

    // Crear una hoja de cálculo
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Crear el libro de trabajo y añadir la hoja
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

    // Generar archivo y descargarlo
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  /**
   * Exporta datos a un archivo PDF
   * @param headers Cabeceras de la tabla
   * @param data Matriz (array de arrays) con los datos
   * @param filename Nombre del archivo (sin extensión)
   * @param title Título del documento
   */
  exportToPdf(headers: string[], data: any[][], filename: string, title: string): void {
    const doc = new jsPDF('landscape');

    // Título
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175); // Azul
    doc.text(title, 14, 22);

    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleString();
    doc.text(`Generado el: ${dateStr}`, 14, 30);

    // Renderizar tabla
    autoTable(doc, {
      startY: 36,
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235], // Azul primary
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Gris muy claro
      }
    });

    // Guardar documento
    doc.save(`${filename}.pdf`);
  }
}
