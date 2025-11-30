import React, { useState } from 'react';
import { Download, ChevronDown, ChevronUp, FileSpreadsheet, FileText } from 'lucide-react';
import { GlobalResult, CalculationResult, ModuleCost } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { exportToExcel } from '../services/excelExport';
import { exportToPDF } from '../services/pdfExport';

interface ResultsDisplayProps {
  data: GlobalResult;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedServiceId(expandedServiceId === id ? null : id);
  };

  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planilha_custos_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcel = () => {
    exportToExcel(data);
  };

  const handleDownloadPDF = () => {
    exportToPDF(data);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-2">Valor Mensal Total</h3>
          <p className="text-4xl font-bold">{formatCurrency(data.totalMonthlyAllServices)}</p>
          <p className="text-blue-200 text-sm mt-2">Soma de todos os {data.services.length} serviços</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
           <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Valor Global da Proposta</h3>
           <p className="text-4xl font-bold text-slate-800">{formatCurrency(data.globalProposalValue)}</p>
           <p className="text-slate-500 text-sm mt-2">Para contrato de {data.contractMonths} meses</p>
        </div>
      </div>

      {/* Detailed Breakdown Per Service */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Detalhamento por Posto</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-sm text-white bg-red-600 hover:bg-red-700 font-medium px-3 py-1.5 rounded transition-colors shadow-sm"
              title="Exportar para PDF"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button 
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 text-sm text-white bg-green-600 hover:bg-green-700 font-medium px-3 py-1.5 rounded transition-colors shadow-sm"
              title="Exportar para Excel"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button 
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded transition-colors border border-blue-200"
              title="Exportar dados JSON"
            >
              <Download className="w-4 h-4" /> JSON
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {data.services.map((result) => (
            <ServiceDetailRow 
              key={result.serviceId} 
              result={result} 
              isExpanded={expandedServiceId === result.serviceId} 
              onToggle={() => toggleExpand(result.serviceId)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ServiceDetailRow: React.FC<{ 
  result: CalculationResult; 
  isExpanded: boolean; 
  onToggle: () => void 
}> = ({ result, isExpanded, onToggle }) => {
  
  const chartData = [
    { name: 'M1. Remuneração', value: result.modules.m1.value },
    { name: 'M2. Encargos', value: result.modules.m2.value },
    { name: 'M3. Rescisão', value: result.modules.m3.value },
    { name: 'M4. Reposição', value: result.modules.m4.value },
    { name: 'M5. Insumos', value: result.modules.m5.value },
    { name: 'M6. Trib/Lucro', value: result.modules.m6.value },
  ];

  return (
    <div className="bg-white">
      <div 
        className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            <h4 className="font-semibold text-slate-800">{result.serviceName}</h4>
          </div>
          <p className="text-sm text-slate-500 ml-6 mt-1">Custo por empregado: <span className="font-medium text-slate-700">{formatCurrency(result.totalPerEmployee)}</span></p>
        </div>
        <div className="mt-2 md:mt-0 text-right">
          <p className="text-sm text-slate-500">Valor Mensal do Serviço</p>
          <p className="text-xl font-bold text-blue-700">{formatCurrency(result.totalMonthlyService)}</p>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-6 bg-slate-50 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Table Breakdown */}
          <div className="lg:col-span-2">
            <h5 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">Composição de Custos (Unitário)</h5>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-500">
                  <tr>
                    <th className="py-2 px-4 text-left font-medium">Módulo</th>
                    <th className="py-2 px-4 text-right font-medium">Valor (R$)</th>
                    <th className="py-2 px-4 text-right font-medium">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(Object.entries(result.modules) as [string, ModuleCost][]).map(([key, mod]) => (
                    <tr key={key}>
                      <td className="py-2 px-4 text-slate-700">
                        <span className="font-medium block">{key.toUpperCase()} - {mod.description}</span>
                        {mod.details && (
                          <div className="text-xs text-slate-500 mt-1 pl-2 border-l-2 border-slate-200 space-y-1">
                            {Object.entries(mod.details).map(([dKey, dVal]) => (
                              <div key={dKey} className="flex justify-between w-64">
                                <span>{dKey}:</span>
                                <span className="font-medium">{formatCurrency(dVal)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-900 font-medium align-top">{mod.value.toFixed(2)}</td>
                      <td className="py-2 px-4 text-right text-slate-500 align-top">{((mod.value / result.totalPerEmployee) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-bold border-t-2 border-blue-100">
                    <td className="py-2 px-4 text-blue-800">TOTAL POR EMPREGADO</td>
                    <td className="py-2 px-4 text-right text-blue-800">{result.totalPerEmployee.toFixed(2)}</td>
                    <td className="py-2 px-4 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
             <h5 className="text-sm font-semibold text-slate-700 mb-2">Distribuição de Custos</h5>
             <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};