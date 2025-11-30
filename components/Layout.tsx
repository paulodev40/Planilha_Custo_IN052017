import React from 'react';
import { Calculator, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'calculator' | 'config';
  onNavigate: (view: 'calculator' | 'config') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('calculator')}>
              <Calculator className="w-8 h-8 text-blue-300" />
              <div>
                <h1 className="text-xl font-bold leading-none">GovClean Cost Calc</h1>
                <p className="text-xs text-blue-200 mt-1 opacity-80">Calculadora de Terceirização (IN 5/2017)</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-1 bg-blue-800/50 p-1 rounded-lg">
              <button
                onClick={() => onNavigate('calculator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currentView === 'calculator' 
                    ? 'bg-white text-blue-900 shadow-sm' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Calculadora
              </button>
              <button
                onClick={() => onNavigate('config')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currentView === 'config' 
                    ? 'bg-white text-blue-900 shadow-sm' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                Parâmetros de Cálculo
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <div className="flex justify-center gap-6 mb-4">
             <span className="text-xs">Acórdão TCU nº 648/2016</span>
             <span className="text-xs">IN MPOG 05/2017</span>
          </div>
          <p>© {new Date().getFullYear()} GovClean Calc. Ferramenta auxiliar de cálculo.</p>
          <p className="mt-2 text-xs">Os valores de IRPJ e CSLL foram excluídos das composições de custo.</p>
        </div>
      </footer>
    </div>
  );
};