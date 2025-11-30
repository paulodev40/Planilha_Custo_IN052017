import React from 'react';
import { Plus, Trash2, Users, ArrowRight } from 'lucide-react';
import { GlobalParams, ServiceInput, TaxRegime } from '../types';
import { REGIME_RATES_MAP } from '../constants';

interface InputSectionProps {
  params: GlobalParams;
  setParams: React.Dispatch<React.SetStateAction<GlobalParams>>;
  services: ServiceInput[];
  setServices: React.Dispatch<React.SetStateAction<ServiceInput[]>>;
  onNavigateToConfig: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ params, setParams, services, setServices, onNavigateToConfig }) => {

  const handleRegimeChange = (newRegime: TaxRegime) => {
    // When changing regime, we must update the detailed rates to the new defaults
    setParams(prev => ({
      ...prev,
      regime: newRegime,
      rates: {
        ...REGIME_RATES_MAP[newRegime]
      }
    }));
  };

  const addService = () => {
    const newId = (Math.random() + 1).toString(36).substring(7);
    setServices([
      ...services,
      {
        id: newId,
        name: `Serviço ${services.length + 1}`,
        employeeCount: 1,
        baseSalary: 1412.00,
        hazardLevel: 0,
        nightShiftUnhealthy: 0,
        benefitsMonthly: 600.00,
        suppliesMonthly: 150.00
      }
    ]);
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const updateService = (id: string, field: keyof ServiceInput, value: any) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Settings Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start mb-4">
             <h2 className="text-lg font-semibold text-slate-800">Parâmetros Básicos</h2>
             <button 
                onClick={onNavigateToConfig}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
             >
                Ver todos os parâmetros <ArrowRight className="w-4 h-4" />
             </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Regime Tributário</label>
            <select
              value={params.regime}
              onChange={(e) => handleRegimeChange(e.target.value as TaxRegime)}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              {Object.values(TaxRegime).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Meses de Contrato</label>
            <input
              type="number"
              value={params.contractMonths}
              onChange={(e) => setParams({ ...params, contractMonths: parseInt(e.target.value) || 12 })}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
      </div>

      {/* Services Input Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Definição dos Postos de Serviço</h2>
          </div>
          <button onClick={addService} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800">
            <Plus className="w-4 h-4" /> Adicionar Posto
          </button>
        </div>

        <div className="space-y-6">
          {services.map((service) => (
            <div key={service.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative animate-fade-in transition-all hover:border-blue-200">
              <button 
                onClick={() => removeService(service.id)}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1"
                title="Remover serviço"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nome do Posto</label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => updateService(service.id, 'name', e.target.value)}
                    className="w-full rounded border-slate-300 text-sm p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Qtd. Empregados</label>
                  <input
                    type="number"
                    min="1"
                    value={service.employeeCount}
                    onChange={(e) => updateService(service.id, 'employeeCount', parseInt(e.target.value) || 0)}
                    className="w-full rounded border-slate-300 text-sm p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Salário Base (R$)</label>
                   <input
                    type="number"
                    step="0.01"
                    value={service.baseSalary}
                    onChange={(e) => updateService(service.id, 'baseSalary', parseFloat(e.target.value) || 0)}
                    className="w-full rounded border-slate-300 text-sm p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Insalubridade (%)</label>
                   <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="Ex: 20"
                    value={service.hazardLevel * 100}
                    onChange={(e) => updateService(service.id, 'hazardLevel', (parseFloat(e.target.value) || 0) / 100)}
                    className="w-full rounded border-slate-300 text-sm p-2 shadow-sm"
                  />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Adic. Noturno/Outros (R$)</label>
                   <input
                    type="number"
                    step="0.01"
                    value={service.nightShiftUnhealthy}
                    onChange={(e) => updateService(service.id, 'nightShiftUnhealthy', parseFloat(e.target.value) || 0)}
                    className="w-full rounded border-slate-300 text-sm p-2 shadow-sm"
                  />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Benefícios Mensais (R$)</label>
                   <input
                    type="number"
                    step="0.01"
                    value={service.benefitsMonthly}
                    onChange={(e) => updateService(service.id, 'benefitsMonthly', parseFloat(e.target.value) || 0)}
                    className="w-full rounded border-slate-300 text-sm p-2 shadow-sm"
                  />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Insumos/Mat. (R$)</label>
                   <input
                    type="number"
                    step="0.01"
                    value={service.suppliesMonthly}
                    onChange={(e) => updateService(service.id, 'suppliesMonthly', parseFloat(e.target.value) || 0)}
                    className="w-full rounded border-slate-300 text-sm p-2 shadow-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="text-center py-8 text-slate-500 italic bg-slate-50 rounded border border-dashed border-slate-300">
              Nenhum posto definido. Adicione um posto acima.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};