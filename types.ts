export enum TaxRegime {
  LucroReal = 'Lucro Real',
  LucroPresumido = 'Lucro Presumido',
  SimplesNacional = 'Simples Nacional',
}

export interface DetailedRates {
  // Módulo 2.1 - 13º e Férias
  m2_1_thirteenth: number; // 8.33%
  m2_1_vacationBonus: number; // 3.025% (Adicional de 1/3)
  
  // Módulo 2.2 - Encargos Previdenciários (Components)
  m2_2_inss: number; // 20%
  m2_2_salary_education: number; // 2.5%
  m2_2_rat: number; // 3.0% (Adjustable via RAT x FAP)
  m2_2_sesc: number; // 1.5%
  m2_2_senac: number; // 1.0%
  m2_2_sebrae: number; // 0.6%
  m2_2_incra: number; // 0.2%
  m2_2_fgts: number; // 8.0%

  // Módulo 3 - Provisão para Rescisão
  m3_notice_worked: number; // Aviso Prévio Trabalhado (e.g. 1.94%)
  m3_notice_indemnified: number; // Aviso Prévio Indenizado (e.g. 0.5%)
  m3_fine_fgts_worked: number; // Multa FGTS sobre Aviso Trabalhado (4.76%)
  m3_fine_fgts_indemnified: number; // Multa FGTS sobre Aviso Indenizado (0.24%)
  
  // Módulo 4 - Reposição
  m4_vacation_replace: number; // Férias (9.075%)
  m4_absences_legal: number; // Ausências Legais (~1%)
  m4_paternity: number; // Licença Paternidade
  m4_maternity: number; // Afastamento Maternidade
  m4_accident: number; // Acidente de Trabalho
  m4_sickness: number; // Ausência por Doença

  // Módulo 6 - Tributos e Lucro
  m6_indirect_costs: number; // 3.00%
  m6_profit: number; // 6.79%
  m6_pis: number; // 1.65% or 0.65%
  m6_cofins: number; // 7.60% or 3.00%
  m6_iss: number; // 2.50% or 5.00%
}

export interface GlobalParams {
  regime: TaxRegime;
  contractMonths: number;
  rates: DetailedRates;
}

export interface ServiceInput {
  id: string;
  name: string;
  employeeCount: number;
  baseSalary: number;
  hazardLevel: number; // 0 to 1
  nightShiftUnhealthy: number; // Monetary value
  benefitsMonthly: number; // M2.3
  suppliesMonthly: number; // M5
}

export interface ModuleCost {
  description: string;
  value: number;
  details?: Record<string, number>;
}

export interface CalculationResult {
  serviceId: string;
  serviceName: string;
  modules: {
    m1: ModuleCost;
    m2: ModuleCost;
    m3: ModuleCost;
    m4: ModuleCost;
    m5: ModuleCost;
    m6: ModuleCost;
  };
  totalPerEmployee: number;
  totalMonthlyService: number;
}

export interface GlobalResult {
  regime: TaxRegime;
  services: CalculationResult[];
  totalMonthlyAllServices: number;
  contractMonths: number;
  globalProposalValue: number;
}