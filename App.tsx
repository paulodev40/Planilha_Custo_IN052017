import React, { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { InputSection } from './components/InputSection';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ConfigurationPage } from './components/ConfigurationPage';
import { INITIAL_PARAMS } from './constants';
import { calculateGlobal } from './services/calculator';
import { ServiceInput, GlobalParams } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'calculator' | 'config'>('calculator');
  const [globalParams, setGlobalParams] = useState<GlobalParams>(INITIAL_PARAMS);
  
  const [services, setServices] = useState<ServiceInput[]>([
    {
      id: '1',
      name: 'Servente de Limpeza 44h',
      employeeCount: 2,
      baseSalary: 1412.00,
      hazardLevel: 0.20, // 20%
      nightShiftUnhealthy: 0,
      benefitsMonthly: 550.00, // VA + VT
      suppliesMonthly: 120.00
    }
  ]);

  // Real-time calculation
  const results = useMemo(() => {
    return calculateGlobal(services, globalParams);
  }, [services, globalParams]);

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      
      {currentView === 'calculator' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column: Inputs */}
          <div className="xl:col-span-5 space-y-6">
            <InputSection 
              params={globalParams}
              setParams={setGlobalParams}
              services={services}
              setServices={setServices}
              onNavigateToConfig={() => setCurrentView('config')}
            />
          </div>

          {/* Right Column: Results */}
          <div className="xl:col-span-7">
             <div className="sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                   <h2 className="text-xl font-bold text-slate-800">Resultados da Planilha</h2>
                   <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Calculado Automaticamente</span>
                </div>
                
                {services.length > 0 ? (
                  <ResultsDisplay data={results} />
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-sm">
                    <p className="text-slate-500">Adicione um posto de serviço para visualizar os cálculos.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      ) : (
        <ConfigurationPage 
          params={globalParams} 
          setParams={setGlobalParams} 
        />
      )}
      
    </Layout>
  );
};

export default App;