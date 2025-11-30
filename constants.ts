import { TaxRegime, DetailedRates, GlobalParams } from './types';

// Based on the screenshots (Lucro Real)
export const RATES_LUCRO_REAL: DetailedRates = {
  // M2.1
  m2_1_thirteenth: 0.0833, // 1/12
  m2_1_vacationBonus: 0.03025, // 1/3 of Vacation (approx 3.025%)

  // M2.2 (Total ~36.8%)
  m2_2_inss: 0.20,
  m2_2_salary_education: 0.025,
  m2_2_rat: 0.03, // RAT x FAP (3 x 1)
  m2_2_sesc: 0.015,
  m2_2_senac: 0.01,
  m2_2_sebrae: 0.006,
  m2_2_incra: 0.002,
  m2_2_fgts: 0.08,

  // M3
  m3_notice_worked: 0.0194, // ~30.75/1581 (Example from sheet)
  m3_fine_fgts_worked: 0.0476, // 4.76%
  m3_notice_indemnified: 0.0050, // ~7.89/1581 (Example from sheet)
  m3_fine_fgts_indemnified: 0.0024, // 0.24%

  // M4
  m4_vacation_replace: 0.09075, // Screenshot Page 4
  m4_absences_legal: 0.0099, // ~15.66/1581
  m4_paternity: 0.0002, // 0.40/1581
  m4_maternity: 0.0007,
  m4_accident: 0.0004,
  m4_sickness: 0.0167,

  // M6
  m6_indirect_costs: 0.03,
  m6_profit: 0.0679,
  m6_pis: 0.0165,
  m6_cofins: 0.076,
  m6_iss: 0.025,
};

export const RATES_LUCRO_PRESUMIDO: DetailedRates = {
  ...RATES_LUCRO_REAL,
  m6_pis: 0.0065,
  m6_cofins: 0.03,
};

export const RATES_SIMPLES: DetailedRates = {
  ...RATES_LUCRO_REAL,
  // Approximate overrides for Simples Anexo IV
  m6_pis: 0.0055,
  m6_cofins: 0.0259,
  m6_iss: 0.05,
  // Encargos often differ (no "Sistema S" usually), but Anexo IV pays INSS patronal. 
  // We reduce System S to 0 for simplicity in this default.
  m2_2_sesc: 0,
  m2_2_senac: 0,
  m2_2_sebrae: 0,
  m2_2_incra: 0,
};

export const REGIME_RATES_MAP: Record<TaxRegime, DetailedRates> = {
  [TaxRegime.LucroReal]: RATES_LUCRO_REAL,
  [TaxRegime.LucroPresumido]: RATES_LUCRO_PRESUMIDO,
  [TaxRegime.SimplesNacional]: RATES_SIMPLES,
};

export const INITIAL_PARAMS: GlobalParams = {
  regime: TaxRegime.LucroReal,
  contractMonths: 12,
  rates: RATES_LUCRO_REAL,
};