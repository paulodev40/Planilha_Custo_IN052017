import * as XLSX from 'xlsx';
import { GlobalResult } from '../types';

/**
 * Export calculation results to Excel (XLSX) format
 * Creates multiple sheets: Summary, Services Detail, and Parameters
 */
export const exportToExcel = (data: GlobalResult) => {
  const workbook = XLSX.utils.book_new();

  // ===== SHEET 1: SUMMARY =====
  const summaryData: any[][] = [
    ['PLANILHA DE CUSTOS - TERCEIRIZAÇÃO DE SERVIÇOS'],
    ['Instrução Normativa MPOG 05/2017 - Acórdão TCU 648/2016'],
    [''],
    ['Regime Tributário:', data.regime],
    ['Duração do Contrato (meses):', data.contractMonths],
    [''],
    ['RESUMO EXECUTIVO'],
    ['Total Mensal (Todos os Serviços):', data.totalMonthlyAllServices],
    ['Valor Global da Proposta:', data.globalProposalValue],
    [''],
    ['SERVIÇOS CONTRATADOS'],
    ['Nome do Serviço', 'Qtd. Empregados', 'Custo por Empregado', 'Custo Mensal Total'],
  ];

  data.services.forEach(service => {
    // Calculate employee count from service input
    const employeeCount = service.totalMonthlyService / service.totalPerEmployee;
    summaryData.push([
      service.serviceName,
      employeeCount,
      service.totalPerEmployee,
      service.totalMonthlyService
    ]);
  });

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  summarySheet['!cols'] = [
    { wch: 35 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

  // ===== SHEET 2: DETAILED BREAKDOWN =====
  data.services.forEach((service, idx) => {
    const detailData: any[][] = [
      [service.serviceName],
      [''],
      ['COMPOSIÇÃO DE CUSTOS (POR EMPREGADO)'],
      ['Módulo', 'Descrição', 'Valor (R$)', '% do Total'],
      [''],
    ];

    const modules = [
      { key: 'M1', ...service.modules.m1 },
      { key: 'M2', ...service.modules.m2 },
      { key: 'M3', ...service.modules.m3 },
      { key: 'M4', ...service.modules.m4 },
      { key: 'M5', ...service.modules.m5 },
      { key: 'M6', ...service.modules.m6 },
    ];

    modules.forEach(mod => {
      const percentage = (mod.value / service.totalPerEmployee) * 100;
      detailData.push([
        mod.key,
        mod.description,
        mod.value,
        percentage
      ]);

      // Add sub-details if available
      if (mod.details) {
        Object.entries(mod.details).forEach(([detailKey, detailValue]) => {
          detailData.push([
            '',
            `  → ${detailKey}`,
            detailValue,
            ''
          ]);
        });
      }
    });

    detailData.push(['']);
    detailData.push(['TOTAL POR EMPREGADO', '', service.totalPerEmployee, '100%']);
    detailData.push(['TOTAL MENSAL DO SERVIÇO', '', service.totalMonthlyService, '']);

    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
    detailSheet['!cols'] = [
      { wch: 12 },
      { wch: 40 },
      { wch: 15 },
      { wch: 12 }
    ];

    const sheetName = `Serviço ${idx + 1}`.substring(0, 31); // Excel sheet name limit
    XLSX.utils.book_append_sheet(workbook, detailSheet, sheetName);
  });

  // ===== SHEET 3: PARAMETERS =====
  const paramsData: any[][] = [
    ['PARÂMETROS DE CÁLCULO UTILIZADOS'],
    [''],
    ['Regime Tributário:', data.regime],
    [''],
    ['MÓDULO 2 - ENCARGOS E BENEFÍCIOS'],
    ['Parâmetro', 'Valor (%)'],
  ];

  // Note: We don't have access to the detailed rates here, 
  // but we can add a note
  paramsData.push(['13º Salário', 'Conforme configuração']);
  paramsData.push(['Adicional de Férias', 'Conforme configuração']);
  paramsData.push(['Encargos Previdenciários', 'Conforme configuração']);
  paramsData.push(['']);
  paramsData.push(['MÓDULO 3 - PROVISÃO PARA RESCISÃO']);
  paramsData.push(['Aviso Prévio', 'Conforme configuração']);
  paramsData.push(['']);
  paramsData.push(['MÓDULO 4 - REPOSIÇÃO PROFISSIONAL']);
  paramsData.push(['Férias e Ausências', 'Conforme configuração']);
  paramsData.push(['']);
  paramsData.push(['MÓDULO 6 - TRIBUTOS E LUCRO']);
  paramsData.push(['Custos Indiretos, Lucro, PIS, COFINS, ISS', 'Conforme configuração']);

  const paramsSheet = XLSX.utils.aoa_to_sheet(paramsData);
  paramsSheet['!cols'] = [
    { wch: 35 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(workbook, paramsSheet, 'Parâmetros');

  // Generate and download
  const fileName = `Planilha_Custos_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
