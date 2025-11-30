import { GlobalParams, ServiceInput, CalculationResult, GlobalResult, DetailedRates } from '../types';

/**
 * Calculates sum of M2.2 rates (Total Social Security burden)
 */
const getSocialSecurityTotalRate = (rates: DetailedRates) => {
  return (
    rates.m2_2_inss +
    rates.m2_2_salary_education +
    rates.m2_2_rat +
    rates.m2_2_sesc +
    rates.m2_2_senac +
    rates.m2_2_sebrae +
    rates.m2_2_incra +
    rates.m2_2_fgts
  );
};

export const calculateService = (service: ServiceInput, params: GlobalParams): CalculationResult => {
  const { rates } = params;
  const socialSecurityRate = getSocialSecurityTotalRate(rates);

  // --- Módulo 1: Composição da Remuneração ---
  const salary = service.baseSalary;
  const insalubrityValue = salary * service.hazardLevel;
  const m1Value = salary + insalubrityValue + service.nightShiftUnhealthy;

  // --- Módulo 2: Encargos e Benefícios ---
  
  // Sub 2.1: 13º e Férias (Composed of 13th + Vacation Bonus)
  // Note: Vacation Principal (Replacement) is in M4.1 usually in this model (9.075%)
  const m2_1_thirteenth = m1Value * rates.m2_1_thirteenth;
  const m2_1_vacationBonus = m1Value * rates.m2_1_vacationBonus;
  
  // Incidence of M2.2 on M2.1
  const m2_1_base = m2_1_thirteenth + m2_1_vacationBonus;
  const m2_1_incidence = m2_1_base * socialSecurityRate;
  
  const m2_1_total = m2_1_base + m2_1_incidence;

  // Sub 2.2: Encargos sobre M1
  const m2_2_total = m1Value * socialSecurityRate;

  // Sub 2.3: Benefícios
  const m2_3_total = service.benefitsMonthly;

  const m2Value = m2_1_total + m2_2_total + m2_3_total;

  // --- Módulo 3: Provisão para Rescisão ---
  // A: Aviso Indenizado (Usually only FGTS applies. 0.24% fine suggests it's 40% of 8% * months?)
  // D: Aviso Trabalhado (Full burden applies).
  
  const m3_api = m1Value * rates.m3_notice_indemnified;
  // According to sheet, incidence on API is small (~0.63 on 7.89 base => ~8%). Likely only FGTS.
  const m3_api_incidence = m3_api * rates.m2_2_fgts; 
  const m3_api_fgts_fine = m1Value * rates.m3_fine_fgts_indemnified;

  const m3_apt = m1Value * rates.m3_notice_worked;
  const m3_apt_incidence = m3_apt * socialSecurityRate; // Full burden
  const m3_apt_fgts_fine = m1Value * rates.m3_fine_fgts_worked;

  const m3Value = m3_api + m3_api_incidence + m3_api_fgts_fine + m3_apt + m3_apt_incidence + m3_apt_fgts_fine;

  // --- Módulo 4: Reposição do Profissional Ausente ---
  // Base cost of substitute (Vacation Replacement + Absences)
  const m4_rate_sum = 
    rates.m4_vacation_replace + 
    rates.m4_absences_legal + 
    rates.m4_paternity + 
    rates.m4_maternity + 
    rates.m4_accident + 
    rates.m4_sickness;

  const m4_base = m1Value * m4_rate_sum;
  // Incidence on M4
  const m4_incidence = m4_base * socialSecurityRate;

  const m4Value = m4_base + m4_incidence;

  // --- Módulo 5: Insumos ---
  const m5Value = service.suppliesMonthly;

  // --- Módulo 6: Custos Indiretos, Lucro e Tributos ---
  const baseCI = m1Value + m2Value + m3Value + m4Value + m5Value;
  const valCI = baseCI * rates.m6_indirect_costs;
  const baseProfit = baseCI + valCI;
  const valProfit = baseProfit * rates.m6_profit;
  
  // Gross up calculation logic as per sheet:
  // Price = (CostPreTax) / (1 - TaxRate)
  // Taxes = Price * TaxRate
  const baseTaxesPreGrossUp = baseProfit + valProfit;
  const taxRateTotal = rates.m6_pis + rates.m6_cofins + rates.m6_iss;
  
  // Avoid division by zero
  const grossPrice = taxRateTotal < 1 
    ? baseTaxesPreGrossUp / (1 - taxRateTotal) 
    : baseTaxesPreGrossUp;
    
  const totalTaxes = grossPrice * taxRateTotal;

  const m6Value = valCI + valProfit + totalTaxes;

  // --- Totals ---
  const totalPerEmployee = baseCI + m6Value;
  const totalMonthlyService = totalPerEmployee * service.employeeCount;

  return {
    serviceId: service.id,
    serviceName: service.name,
    modules: {
      m1: { description: 'Composição da Remuneração', value: m1Value },
      m2: { 
        description: 'Encargos e Benefícios', 
        value: m2Value,
        details: {
          '13º e Adic. Férias (Sub 2.1)': m2_1_base,
          'Incidência Sub 2.1': m2_1_incidence,
          'Encargos sobre M1 (Sub 2.2)': m2_2_total,
          'Benefícios (Sub 2.3)': m2_3_total
        }
      },
      m3: { 
        description: 'Provisão para Rescisão', 
        value: m3Value,
        details: {
          'Aviso Prévio Indenizado': m3_api,
          'Aviso Prévio Trabalhado': m3_apt,
          'Multas FGTS': m3_api_fgts_fine + m3_apt_fgts_fine,
          'Incidências': m3_api_incidence + m3_apt_incidence
        }
      },
      m4: { 
        description: 'Reposição Profissional', 
        value: m4Value,
        details: {
          'Férias e Ausências': m4_base,
          'Incidência Encargos': m4_incidence
        }
      },
      m5: { description: 'Insumos Diversos', value: m5Value },
      m6: { 
        description: 'Custos Ind., Lucro e Tributos', 
        value: m6Value,
        details: {
          'Custos Indiretos': valCI,
          'Lucro': valProfit,
          'Tributos (PIS/COFINS/ISS)': totalTaxes
        }
      },
    },
    totalPerEmployee,
    totalMonthlyService,
  };
};

export const calculateGlobal = (services: ServiceInput[], params: GlobalParams): GlobalResult => {
  const results = services.map(s => calculateService(s, params));
  
  const totalMonthlyAllServices = results.reduce((acc, curr) => acc + curr.totalMonthlyService, 0);
  const globalProposalValue = totalMonthlyAllServices * params.contractMonths;

  return {
    regime: params.regime,
    services: results,
    totalMonthlyAllServices,
    contractMonths: params.contractMonths,
    globalProposalValue
  };
};