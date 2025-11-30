import React, { useState } from 'react';
import { GlobalParams, TaxRegime, DetailedRates } from '../types';
import { REGIME_RATES_MAP } from '../constants';
import { RotateCcw, Shield, Calculator, FileText, Users, AlertCircle } from 'lucide-react';

interface ConfigurationPageProps {
  params: GlobalParams;
  setParams: React.Dispatch<React.SetStateAction<GlobalParams>>;
}

export const ConfigurationPage: React.FC<ConfigurationPageProps> = ({ params, setParams }) => {
  const [activeTab, setActiveTab] = useState<'m2' | 'm3' | 'm4' | 'm6'>('m2');

  const handleRateChange = (key: keyof DetailedRates, value: string) => {
    const numValue = parseFloat(value) / 100;
    setParams(prev => ({
      ...prev,
      rates: { ...prev.rates, [key]: isNaN(numValue) ? 0 : numValue }
    }));
  };

  const handleRegimeChange = (newRegime: TaxRegime) => {
    if (window.confirm('Alterar o regime irá redefinir todas as alíquotas para o padrão desse regime. Continuar?')) {
      setParams(prev => ({
        ...prev,
        regime: newRegime,
        rates: {
          ...REGIME_RATES_MAP[newRegime]
        }
      }));
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Deseja restaurar todos os valores para o padrão do regime selecionado?')) {
        setParams(prev => ({
            ...prev,
            rates: {
                ...REGIME_RATES_MAP[prev.regime]
            }
        }));
    }
  };

  const RateInput = ({ label, rateKey, desc }: { label: string, rateKey: keyof DetailedRates, desc?: string }) => (
    <div className="bg-white p-3 rounded border border-slate-200 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{label}</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.0001"
          value={(params.rates[rateKey] * 100).toFixed(4)}
          onChange={(e) => handleRateChange(rateKey, e.target.value)}
          className="w-24 text-right rounded border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-1.5 font-medium"
        />
        <span className="text-slate-500 text-sm font-medium">%</span>
      </div>
      {desc && <p className="text-[10px] text-slate-400 mt-1 leading-tight">{desc}</p>}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header Panel */}
      <div className="bg-white border-b border-slate-200 p-6 rounded-t-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Parâmetros de Cálculo Detalhados</h2>
          <p className="text-slate-500 text-sm mt-1">
            Configuração granular das alíquotas de encargos, provisões e tributos conforme IN 5/2017.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
              onClick={resetToDefaults}
              className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
          >
              <RotateCcw className="w-4 h-4" />
              Restaurar Padrões
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Global Settings */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Configuração Geral</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Regime Tributário</label>
                  <select
                      value={params.regime}
                      onChange={(e) => handleRegimeChange(e.target.value as TaxRegime)}
                      className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 bg-slate-50"
                  >
                      {Object.values(TaxRegime).map(r => (
                          <option key={r} value={r}>{r}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Vigência (Meses)</label>
                  <input
                      type="number"
                      value={params.contractMonths}
                      onChange={(e) => setParams({ ...params, contractMonths: parseInt(e.target.value) || 12 })}
                      className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 bg-slate-50"
                  />
                </div>
              </div>
           </div>

           <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Resumo de Cargas</h3>
              <div className="space-y-2 text-sm text-blue-800">
                 <div className="flex justify-between">
                   <span>Encargos Sociais:</span>
                   <span className="font-bold">{((
                     params.rates.m2_2_inss + 
                     params.rates.m2_2_fgts + 
                     params.rates.m2_2_salary_education + 
                     params.rates.m2_2_rat + 
                     params.rates.m2_2_sesc + 
                     params.rates.m2_2_senac + 
                     params.rates.m2_2_sebrae + 
                     params.rates.m2_2_incra
                   ) * 100).toFixed(2)}%</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Tributos (Fat.):</span>
                   <span className="font-bold">{((
                     params.rates.m6_pis + 
                     params.rates.m6_cofins + 
                     params.rates.m6_iss
                   ) * 100).toFixed(2)}%</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Content: Module Tabs */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
          
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('m2')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'm2' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Shield className="w-4 h-4" /> Módulo 2
            </button>
            <button 
              onClick={() => setActiveTab('m3')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'm3' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <FileText className="w-4 h-4" /> Módulo 3
            </button>
            <button 
              onClick={() => setActiveTab('m4')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'm4' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Users className="w-4 h-4" /> Módulo 4
            </button>
            <button 
              onClick={() => setActiveTab('m6')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'm6' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Calculator className="w-4 h-4" /> Módulo 6
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'm2' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2.1</span>
                    13º Salário, Férias e Adicional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RateInput label="13º Salário" rateKey="m2_1_thirteenth" desc="Provisão mensal (1/12)" />
                    <RateInput label="Adicional de Férias" rateKey="m2_1_vacationBonus" desc="1/3 Constitucional (ou valor específico)" />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2.2</span>
                    Encargos Previdenciários (GPS e FGTS)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <RateInput label="INSS Patronal" rateKey="m2_2_inss" />
                    <RateInput label="FGTS" rateKey="m2_2_fgts" />
                    <RateInput label="RAT x FAP" rateKey="m2_2_rat" desc="Risco Acidente Trabalho" />
                    <RateInput label="Salário Educação" rateKey="m2_2_salary_education" />
                    <RateInput label="SESC / SESI" rateKey="m2_2_sesc" />
                    <RateInput label="SENAC / SENAI" rateKey="m2_2_senac" />
                    <RateInput label="SEBRAE" rateKey="m2_2_sebrae" />
                    <RateInput label="INCRA" rateKey="m2_2_incra" />
                  </div>
                  <div className="flex items-start gap-2 mt-4 p-3 bg-slate-50 rounded border border-slate-100">
                    <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                    <p className="text-xs text-slate-500 italic">
                       A soma destes percentuais incide sobre o Salário (M1), 13º/Férias (M2.1), Aviso Trabalhado (M3) e Reposição (M4), compondo o custo de encargos sociais da empresa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'm3' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                  <p className="text-sm text-amber-800">
                    O Módulo 3 trata das provisões para rescisão contratual. As alíquotas abaixo são aplicadas mensalmente sobre a remuneração para formar o fundo de reserva.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Aviso Prévio Indenizado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RateInput label="Provisão Mensal (API)" rateKey="m3_notice_indemnified" desc="Baseado na rotatividade anual" />
                    <RateInput label="Multa FGTS (sobre API)" rateKey="m3_fine_fgts_indemnified" desc="Indenização compensatória (40% ou 50%)" />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Aviso Prévio Trabalhado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RateInput label="Provisão Mensal (APT)" rateKey="m3_notice_worked" desc="Baseado na rotatividade anual" />
                    <RateInput label="Multa FGTS (sobre APT)" rateKey="m3_fine_fgts_worked" desc="Indenização compensatória" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'm4' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800">
                    O Módulo 4 calcula o custo do <strong>Substituto</strong> que cobre o posto durante as ausências do titular (Férias e Afastamentos).
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Submódulo 4.1 - Ausências Legais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <RateInput label="Cobertura de Férias" rateKey="m4_vacation_replace" desc="Substituto nas férias do titular" />
                    <RateInput label="Ausências Legais" rateKey="m4_absences_legal" desc="Faltas justificadas (CLT)" />
                    <RateInput label="Ausência por Doença" rateKey="m4_sickness" desc="Atestados médicos até 15 dias" />
                    <RateInput label="Licença Paternidade" rateKey="m4_paternity" />
                    <RateInput label="Licença Maternidade" rateKey="m4_maternity" />
                    <RateInput label="Acidente de Trabalho" rateKey="m4_accident" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'm6' && (
              <div className="space-y-8 animate-fade-in">
                 <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Custos Indiretos e Lucro</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RateInput label="Custos Indiretos" rateKey="m6_indirect_costs" desc="Despesas administrativas e operacionais" />
                    <RateInput label="Lucro" rateKey="m6_profit" desc="Margem de lucro da empresa" />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Tributos sobre Faturamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <RateInput label="PIS" rateKey="m6_pis" desc="Programa de Integração Social" />
                    <RateInput label="COFINS" rateKey="m6_cofins" desc="Financiamento da Seguridade Social" />
                    <RateInput label="ISS" rateKey="m6_iss" desc="Imposto Sobre Serviços (Municipal)" />
                  </div>
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <strong>Atenção:</strong> IRPJ e CSLL não compõem a planilha de custos da Administração Pública (Acórdão TCU 648/2016).
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};