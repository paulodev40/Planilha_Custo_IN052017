import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GlobalResult } from '../types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

/**
 * Export calculation results to PDF format
 * Creates a comprehensive report with tables and summaries
 */
export const exportToPDF = (data: GlobalResult) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // ===== HEADER =====
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PLANILHA DE CUSTOS - TERCEIRIZAÇÃO DE SERVIÇOS', 105, yPosition, { align: 'center' });
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Instrução Normativa MPOG 05/2017 - Acórdão TCU 648/2016', 105, yPosition, { align: 'center' });
  
  yPosition += 10;
  
  // ===== SUMMARY BOX =====
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO EXECUTIVO', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const summaryLines = [
    `Regime Tributário: ${data.regime}`,
    `Duração do Contrato: ${data.contractMonths} meses`,
    `Valor Mensal Total: R$ ${data.totalMonthlyAllServices.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Valor Global da Proposta: R$ ${data.globalProposalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  ];
  
  summaryLines.forEach(line => {
    doc.text(line, 14, yPosition);
    yPosition += 5;
  });
  
  yPosition += 5;

  // ===== SERVICES SUMMARY TABLE =====
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVIÇOS CONTRATADOS', 14, yPosition);
  yPosition += 2;

  const servicesTableData = data.services.map(service => {
    const employeeCount = Math.round(service.totalMonthlyService / service.totalPerEmployee);
    return [
      service.serviceName,
      employeeCount.toString(),
      `R$ ${service.totalPerEmployee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `R$ ${service.totalMonthlyService.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Serviço', 'Qtd.', 'Custo/Empregado', 'Custo Mensal']],
    body: servicesTableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 45, halign: 'right' },
      3: { cellWidth: 45, halign: 'right' }
    }
  });

  // Get the final Y position after the table
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ===== DETAILED BREAKDOWN FOR EACH SERVICE =====
  data.services.forEach((service, index) => {
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${service.serviceName.toUpperCase()}`, 14, yPosition);
    yPosition += 2;

    // Modules breakdown
    const moduleData = [
      {
        module: 'M1',
        description: service.modules.m1.description,
        value: service.modules.m1.value,
        percentage: (service.modules.m1.value / service.totalPerEmployee * 100).toFixed(1)
      },
      {
        module: 'M2',
        description: service.modules.m2.description,
        value: service.modules.m2.value,
        percentage: (service.modules.m2.value / service.totalPerEmployee * 100).toFixed(1)
      },
      {
        module: 'M3',
        description: service.modules.m3.description,
        value: service.modules.m3.value,
        percentage: (service.modules.m3.value / service.totalPerEmployee * 100).toFixed(1)
      },
      {
        module: 'M4',
        description: service.modules.m4.description,
        value: service.modules.m4.value,
        percentage: (service.modules.m4.value / service.totalPerEmployee * 100).toFixed(1)
      },
      {
        module: 'M5',
        description: service.modules.m5.description,
        value: service.modules.m5.value,
        percentage: (service.modules.m5.value / service.totalPerEmployee * 100).toFixed(1)
      },
      {
        module: 'M6',
        description: service.modules.m6.description,
        value: service.modules.m6.value,
        percentage: (service.modules.m6.value / service.totalPerEmployee * 100).toFixed(1)
      }
    ];

    const tableBody = moduleData.map(mod => [
      mod.module,
      mod.description,
      `R$ ${mod.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${mod.percentage}%`
    ]);

    // Add total row
    tableBody.push([
      '',
      'TOTAL POR EMPREGADO',
      `R$ ${service.totalPerEmployee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      '100%'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Módulo', 'Descrição', 'Valor', '% Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [52, 73, 94], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 25, halign: 'center' }
      },
      footStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
      didParseCell: (data) => {
        // Highlight total row
        if (data.row.index === tableBody.length - 1) {
          data.cell.styles.fillColor = [41, 128, 185];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;
  });

  // ===== FOOTER ON LAST PAGE =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      285,
      { align: 'center' }
    );
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // ===== SAVE PDF =====
  const fileName = `Planilha_Custos_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};
