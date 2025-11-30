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
    <div className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</label>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="number"
          step="0.0001"
          value={(params.rates[rateKey] * 100).toFixed(4)}
          onChange={(e) => handleRateChange(rateKey, e.target.value)}
          className="w-28 text-right rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-2 font-bold text-blue-700 bg-blue-50"
        />
        <span className="text-slate-500 text-sm font-bold">%</span>
      </div>
      {desc && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
      )}
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
                    <RateInput 
                      label="13º Salário" 
                      rateKey="m2_1_thirteenth" 
                      desc="Art. 7º, VIII da CF/88 e Lei 4.090/62 - Gratificação natalina de 1/12 da remuneração por mês trabalhado" 
                    />
                    <RateInput 
                      label="Adicional de Férias" 
                      rateKey="m2_1_vacationBonus" 
                      desc="Art. 7º, XVII da CF/88 - Adicional de 1/3 (33,33%) sobre a remuneração de férias" 
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2.2</span>
                    Encargos Previdenciários (GPS e FGTS)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <RateInput 
                      label="INSS Patronal" 
                      rateKey="m2_2_inss" 
                      desc="Art. 22, I da Lei 8.212/91 - Contribuição previdenciária patronal de 20% sobre a folha de pagamento" 
                    />
                    <RateInput 
                      label="FGTS" 
                      rateKey="m2_2_fgts" 
                      desc="Art. 15 da Lei 8.036/90 - Depósito mensal de 8% sobre a remuneração do empregado" 
                    />
                    <RateInput 
                      label="RAT x FAP" 
                      rateKey="m2_2_rat" 
                      desc="Art. 22, II da Lei 8.212/91 - Seguro de Acidente de Trabalho (1%, 2% ou 3%) multiplicado pelo FAP" 
                    />
                    <RateInput 
                      label="Salário Educação" 
                      rateKey="m2_2_salary_education" 
                      desc="Art. 3º do Decreto 87.043/82 - Contribuição de 2,5% para financiamento da educação básica" 
                    />
                    <RateInput 
                      label="SESC / SESI" 
                      rateKey="m2_2_sesc" 
                      desc="Art. 30 da Lei 8.036/90 - Contribuição de 1,5% para serviços sociais (comércio/indústria)" 
                    />
                    <RateInput 
                      label="SENAC / SENAI" 
                      rateKey="m2_2_senac" 
                      desc="Decreto-Lei 9.403/46 - Contribuição de 1,0% para aprendizagem profissional" 
                    />
                    <RateInput 
                      label="SEBRAE" 
                      rateKey="m2_2_sebrae" 
                      desc="Lei 8.029/90 e Lei 10.668/03 - Contribuição de 0,6% para apoio às micro e pequenas empresas" 
                    />
                    <RateInput 
                      label="INCRA" 
                      rateKey="m2_2_incra" 
                      desc="Decreto-Lei 1.146/70 - Contribuição de 0,2% para reforma agrária e colonização" 
                    />
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
                    <RateInput 
                      label="Provisão Mensal (API)" 
                      rateKey="m3_notice_indemnified" 
                      desc="Art. 487, §1º da CLT - Provisão mensal calculada com base no índice de rotatividade da empresa" 
                    />
                    <RateInput 
                      label="Multa FGTS (sobre API)" 
                      rateKey="m3_fine_fgts_indemnified" 
                      desc="Art. 18, §1º da Lei 8.036/90 - Multa de 40% (ou 50% conf. LC 110/01) sobre saldo do FGTS na demissão sem justa causa" 
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Aviso Prévio Trabalhado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RateInput 
                      label="Provisão Mensal (APT)" 
                      rateKey="m3_notice_worked" 
                      desc="Art. 487 da CLT e Lei 12.506/11 - Provisão para aviso trabalhado (30 dias + 3 dias/ano até 90 dias)" 
                    />
                    <RateInput 
                      label="Multa FGTS (sobre APT)" 
                      rateKey="m3_fine_fgts_worked" 
                      desc="Art. 18, §1º da Lei 8.036/90 - Multa de 40% sobre depósitos do FGTS durante o aviso prévio trabalhado" 
                    />
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
                    <RateInput 
                      label="Cobertura de Férias" 
                      rateKey="m4_vacation_replace" 
                      desc="Art. 129 e 130 da CLT - Custo do substituto durante 30 dias de férias do titular (aprox. 9,075%)" 
                    />
                    <RateInput 
                      label="Ausências Legais" 
                      rateKey="m4_absences_legal" 
                      desc="Art. 473 da CLT - Faltas justificadas (casamento, luto, doação sangue, alistamento, etc.)" 
                    />
                    <RateInput 
                      label="Ausência por Doença" 
                      rateKey="m4_sickness" 
                      desc="Art. 60, §3º da Lei 8.213/91 - Afastamento por doença até 15 dias pagos pelo empregador" 
                    />
                    <RateInput 
                      label="Licença Paternidade" 
                      rateKey="m4_paternity" 
                      desc="Art. 7º, XIX da CF/88 e Art. 10, §1º do ADCT - Licença de 5 dias corridos" 
                    />
                    <RateInput 
                      label="Licença Maternidade" 
                      rateKey="m4_maternity" 
                      desc="Art. 7º, XVIII da CF/88 - Licença de 120 dias (prorrogável para 180 dias) sem ônus ao empregador" 
                    />
                    <RateInput 
                      label="Acidente de Trabalho" 
                      rateKey="m4_accident" 
                      desc="Art. 60 da Lei 8.213/91 - Afastamento por acidente até 15 dias pagos pelo empregador" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'm6' && (
              <div className="space-y-8 animate-fade-in">
                 <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Custos Indiretos e Lucro</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RateInput 
                      label="Custos Indiretos" 
                      rateKey="m6_indirect_costs" 
                      desc="IN SLTI/MP 02/2008, Anexo I-A - Despesas operacionais, administrativas e gerenciais (máx. 3% orientativo)" 
                    />
                    <RateInput 
                      label="Lucro" 
                      rateKey="m6_profit" 
                      desc="IN SLTI/MP 02/2008, Anexo I-A - Remuneração do capital e margem de ganho da empresa contratada" 
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Tributos sobre Faturamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <RateInput 
                      label="PIS" 
                      rateKey="m6_pis" 
                      desc="Lei 10.637/02 (não-cumulativo: 1,65%) ou Lei 9.718/98 (cumulativo: 0,65%) - Contribuição social sobre faturamento" 
                    />
                    <RateInput 
                      label="COFINS" 
                      rateKey="m6_cofins" 
                      desc="Lei 10.833/03 (não-cumulativo: 7,6%) ou Lei 9.718/98 (cumulativo: 3,0%) - Financiamento da Seguridade Social" 
                    />
                    <RateInput 
                      label="ISS" 
                      rateKey="m6_iss" 
                      desc="LC 116/03 e Legislação Municipal - Imposto sobre serviços (varia conforme município, geralmente 2% a 5%)" 
                    />
                  </div>
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <strong>Atenção:</strong> IRPJ e CSLL não compõem a planilha de custos da Administração Pública (Acórdão TCU 648/2016 - Plenário).
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