import React, { useState } from 'react';
import { DollarSign, FileText, ArrowUpRight, Sparkles, Briefcase, Plus, Settings, Clock, AlertTriangle, HelpCircle, Flame, UserCheck, TrendingUp, RefreshCw } from 'lucide-react';
import { Project, ClientFinancialRow } from '../types';
import { formatCLP, getParetoCategorization, calculateTER } from '../utils';

interface MiEspacioProps {
  projects: Project[];
  setScreen: (screen: 'mi-espacio' | 'mi-dia' | 'proyectos' | 'clientes', transition?: 'none' | 'push' | 'push_back') => void;
  onAddActivity: (title: string, duration: string) => void;
  financials: ClientFinancialRow[];
  interruptedSession: { title: string; seconds: number } | null;
  onIgnoreInterruptedSession: () => void;
  onAssignInterruptedSession: () => void;
}

export default function MiEspacio({ 
  projects, 
  setScreen, 
  onAddActivity, 
  financials,
  interruptedSession,
  onIgnoreInterruptedSession,
  onAssignInterruptedSession
}: MiEspacioProps) {
  // Local state for interactive sandbox editing or simulating time adding
  const [localFinancials, setLocalFinancials] = useState<ClientFinancialRow[]>(financials);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<string | null>(null);

  // Sync state if prop changes
  React.useEffect(() => {
    setLocalFinancials(financials);
  }, [financials]);

  // Calculations
  // 1. ¿Cuánto he facturado este mes y cuánto me deben aún?
  const ingresoNetoReal = localFinancials
    .filter((f) => f.estatus_pago === 'pagado')
    .reduce((sum, f) => sum + f.facturado_mes, 0);

  const dineroEnCamino = localFinancials
    .filter((f) => f.estatus_pago === 'pendiente')
    .reduce((sum, f) => sum + f.facturado_mes, 0);

  // 2. ¿Qué cliente me genera más ingresos y cuál me consume más horas?
  let clienteMasGenera = { nombre: 'Sin datos', valor: 0 };
  let clienteMasHoras = { nombre: 'Sin datos', valor: 0 };

  localFinancials.forEach((f) => {
    const horasReales = f.horas_totales + f.horas_admin;
    if (f.facturado_mes > clienteMasGenera.valor) {
      clienteMasGenera = { nombre: f.nombre_cliente, valor: f.facturado_mes };
    }
    if (horasReales > clienteMasHoras.valor) {
      clienteMasHoras = { nombre: f.nombre_cliente, valor: horasReales };
    }
  });

  // Pareto categorization from helper
  const paretoData = getParetoCategorization(localFinancials);

  // 3. ¿Cuál es la tarifa efectiva por hora real?
  // Globally: sum of (Ingreso bruto - costos - impuestos) / total hours
  const totalBruto = localFinancials.reduce((sum, f) => sum + f.facturado_mes, 0);
  const totalCostos = localFinancials.reduce((sum, f) => sum + f.costos_directos, 0);
  const totalImpuestos = totalBruto * 0.153;
  const totalHorasReales = localFinancials.reduce((sum, f) => sum + (f.horas_totales + f.horas_admin), 0);
  const globalTER = totalHorasReales > 0 ? (totalBruto - totalCostos - totalImpuestos) / totalHorasReales : 0;

  // Single-click Smart Timer Simulation
  const handleSimulateHour = (id: string) => {
    setLocalFinancials((prev) =>
      prev.map((item) => {
        if (item.id_cliente === id) {
          return {
            ...item,
            horas_totales: item.horas_totales + 1,
          };
        }
        return item;
      })
    );
  };

  const handleUpdateStatus = (id: string, status: 'pagado' | 'pendiente') => {
    setLocalFinancials((prev) =>
      prev.map((item) => {
        if (item.id_cliente === id) {
          return {
            ...item,
            estatus_pago: status,
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-28 animate-fade-in space-y-6">
      
      {/* Top Welcome Profile Section */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-tertiary-violet/20 flex items-center justify-center text-tertiary-violet font-semibold text-lg select-none">
            LC
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-tertiary-violet/10 text-tertiary-violet flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" /> Workspace Premium • PixelPerfect
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              ¡Hola de nuevo, Lucía!
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Control total sobre tu tiempo, liquidez y valor real por hora.
            </p>
          </div>
        </div>
        
        {/* Workspace Quick Trigger buttons */}
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setScreen('clientes', 'none')}
            className="flex-1 md:flex-none border border-slate-250 text-slate-700 hover:bg-slate-50 transition-colors py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Subir CSV Datos
          </button>
          <button 
            onClick={() => {
              setScreen('mi-dia', 'push');
            }}
            className="flex-1 md:flex-none bg-gradient-to-r from-primary-container-coral to-[#fb7185] text-white hover:opacity-95 transition-opacity py-2 px-4 rounded-xl text-xs font-bold leading-none flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary-container-coral/25 active:scale-95 transition-transform"
          >
            <Clock className="w-3.5 h-3.5" /> Mi Día en Vivo
          </button>
        </div>
      </div>

      {/* Prominent Assign Time Event Block */}
      {interruptedSession && (
        <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-purple-100 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -right-12 -top-12 w-28 h-28 rounded-full bg-purple-200/20 blur-xl"></div>
          <div className="absolute -left-12 -bottom-12 w-28 h-28 rounded-full bg-indigo-200/20 blur-xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Sesión sin clasificar
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {interruptedSession.title} (En Curso)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tienes una sesión ininterrumpida de <strong className="text-slate-800 font-sans">2h 45m</strong> registrada hoy. ¿Confirmas tu asignación a la vista de actividades del día?
              </p>
            </div>
            
            <div className="flex gap-2.5 items-center self-end md:self-center">
              <button 
                onClick={onIgnoreInterruptedSession} 
                className="px-3.5 py-2 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 transition-colors"
              >
                Ignorar
              </button>
              <button
                onClick={onAssignInterruptedSession}
                className="bg-primary-container-coral text-white hover:bg-primary-coral transition-all px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary-container-coral/30 cursor-pointer active:scale-95"
              >
                Sí, asignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THREE CRITICAL ANSWERS GRID SECTION */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Tus Tres Preguntas Críticas Resueltas
        </h2>

        {/* QUESTION 1: Revenue Billing & Outstanding Cash */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-secondary-teal flex items-center justify-center font-bold text-sm">1</div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">¿Cuánto he facturado este mes y cuánto me deben aún?</h3>
              <p className="text-[11px] text-slate-400 font-medium">Control instantáneo de tu flujo de caja real y por cobrar.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Real Net income (Paid status) */}
            <div className="bg-emerald-50/40 border border-emerald-105 rounded-xl p-4 flex justify-between items-center relative overflow-hidden">
              <div>
                <span className="block text-[11px] text-emerald-800 font-extrabold uppercase tracking-wide">Ingreso Neto Real</span>
                <span className="block text-2xl font-black text-slate-900 mt-1">{formatCLP(ingresoNetoReal)}</span>
                <p className="text-[10px] text-emerald-700/80 mt-1 font-semibold">✓ Este dinero ya descansa seguro en tu cuenta bancaria.</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Money in progress (Pending status) */}
            <div className="bg-amber-50/45 border border-amber-200/60 rounded-xl p-4 flex justify-between items-center relative overflow-hidden">
              <div>
                <span className="block text-[11px] text-amber-800 font-extrabold uppercase tracking-wide">Dinero en Camino</span>
                <span className="block text-2xl font-black text-slate-900 mt-1">{formatCLP(dineroEnCamino)}</span>
                <p className="text-[10px] text-amber-700 mt-1 font-semibold">⚠ Pendiente de cobro. Recuerda enviar recordatorios amistosos.</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* QUESTION 2: Client Performance & Pareto ABC analysis */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-violet-50 text-tertiary-violet flex items-center justify-center font-bold text-sm">2</div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">¿Qué cliente me genera más ingresos y cuál me consume más horas?</h3>
              <p className="text-[11px] text-slate-400 font-medium">Clasificación de Pareto para detectar clientes estrella vs. ladrones de tiempo.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">CLIENTE ESTRELLA (Max Ingreso)</span>
              <span className="block text-lg font-black text-slate-800 mt-1">{clienteMasGenera.nombre}</span>
              <span className="inline-block mt-1 text-xs font-bold text-secondary-teal bg-secondary-container-teal/45 px-2 py-0.5 rounded-full">
                {formatCLP(clienteMasGenera.valor)} este mes
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">MAYOR CONSUMO DE TIEMPO</span>
              <span className="block text-lg font-black text-slate-800 mt-1">{clienteMasHoras.nombre}</span>
              <span className="inline-block mt-1 text-xs font-bold text-primary-coral bg-rose-50 px-2 py-0.5 rounded-full">
                {clienteMasHoras.valor} horas invertidas
              </span>
            </div>
          </div>

          {/* Pareto Categorization Display */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Clasificación Rentabilidad (ABC Pareto)</span>
            <div className="space-y-1.5">
              {paretoData.map((client) => {
                const isC = client.category === 'C';
                const isA = client.category === 'A';
                return (
                  <div 
                    key={client.nombre_cliente} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                      isA ? 'border-emerald-100 bg-emerald-500/5' : isC ? 'border-rose-100 bg-rose-500/5 text-rose-900' : 'bg-slate-50/50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isA ? 'bg-emerald-100 text-emerald-800' : isC ? 'bg-rose-100 text-[#a43b2f]' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {client.category}
                      </span>
                      <div>
                        <span className="font-extrabold text-slate-900 block">{client.nombre_cliente}</span>
                        <span className="text-[10px] text-slate-400">Tarifa Ef.: {formatCLP(Math.round(client.ter))}/h ({client.horasReales}h totales)</span>
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="font-black text-slate-850 block">{formatCLP(client.ingresos)}</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">{Math.round(client.percentageOfRevenue)}% de tu facturación</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* QUESTION 3: Tarifa Efectiva Real (TER) */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-md">
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white">¿Cuál es mi tarifa efectiva por hora real?</h3>
                  <p className="text-[11px] text-indigo-200 font-medium">Calculada restando costos directos y 15.3% de impuestos estimados.</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-2">
                Tu Tarifa Efectiva Real global te permite entender cuántos pesos chilenos limpios te guardas por cada hora que pasas diseñando o haciendo tareas administrativas.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[200px] self-stretch md:self-center flex flex-col justify-center">
              <span className="block text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">TARIFA REAL PROMEDIO</span>
              <span className="block text-3xl font-black text-secondary-container-teal mt-1">
                {formatCLP(Math.round(globalTER))}
              </span>
              <span className="text-[10px] text-slate-300 block font-bold mt-1.5 uppercase">Limpio por hora</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE SIMULATION & DRILL DOWN TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Control de Proyectos en Vivo
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Suma horas reales o edita estados para simular de inmediato.</p>
          </div>
          <button 
            onClick={() => setLocalFinancials(financials)}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 border border-slate-200 px-2 py-1 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Restaurar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">Cliente / Proyecto</th>
                <th className="py-2.5 px-3">Cobro</th>
                <th className="py-2.5 px-3 text-right">Horas (Tot+Adm)</th>
                <th className="py-2.5 px-3 text-right">Val. Bruto</th>
                <th className="py-2.5 px-3 text-right">Tarifa Efectiva Real (TER)</th>
                <th className="py-2.5 px-3 text-center">Estatus Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localFinancials.map((row) => {
                const totalHrs = row.horas_totales + row.horas_admin;
                const netTER = calculateTER(row.facturado_mes, row.costos_directos, row.horas_totales, row.horas_admin);
                
                // Red warning of margin cannibalization if total hours > 50 on fixed scheme
                const dangerHours = row.esquema_cobro === 'fijo' && totalHrs >= 40;

                return (
                  <tr key={row.id_cliente} className="text-xs hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-slate-900">{row.nombre_cliente}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">{row.nombre_proyecto}</div>
                    </td>
                    <td className="py-3 px-3 capitalize font-bold text-slate-500">
                      {row.esquema_cobro === 'fijo' ? 'Precio Fijo' : 'Por Hora'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`font-mono font-bold ${dangerHours ? 'text-red-600 bg-red-50 px-1.5 rounded animate-pulse' : 'text-slate-800'}`}>
                          {totalHrs}h
                        </span>
                        <button
                          onClick={() => handleSimulateHour(row.id_cliente)}
                          className="w-5 h-5 bg-slate-100 hover:bg-primary-container-coral hover:text-white rounded flex items-center justify-center font-bold text-slate-500 transition-all cursor-pointer"
                          title="Simular 1 Hora"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCLP(row.facturado_mes)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-850">
                      {formatCLP(Math.round(netTER))}/h
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleUpdateStatus(row.id_cliente, row.estatus_pago === 'pagado' ? 'pendiente' : 'pagado')}
                        className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide transition-colors cursor-pointer ${
                          row.estatus_pago === 'pagado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                        title="Cambiar Estado de Pago"
                      >
                        {row.estatus_pago}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
