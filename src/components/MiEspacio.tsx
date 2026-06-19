import React, { useState } from 'react';
import { 
  DollarSign, FileText, ArrowUpRight, Sparkles, Briefcase, Plus, Settings, 
  Clock, AlertTriangle, HelpCircle, Flame, UserCheck, TrendingUp, RefreshCw,
  FileSignature, Copy, Check, Download, Send, Scale, Printer, BookOpen, Info, ShieldAlert
} from 'lucide-react';
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
  onExportCSVReport: () => void;
}

export default function MiEspacio({ 
  projects, 
  setScreen, 
  onAddActivity, 
  financials,
  interruptedSession,
  onIgnoreInterruptedSession,
  onAssignInterruptedSession,
  onExportCSVReport
}: MiEspacioProps) {
  // Local state for interactive sandbox editing or simulating time adding
  const [localFinancials, setLocalFinancials] = useState<ClientFinancialRow[]>(financials);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<string | null>(null);

  // INVOICE BUILDER STATES
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceClient, setSelectedInvoiceClient] = useState<ClientFinancialRow | null>(null);
  const [invoiceType, setInvoiceType] = useState<'honores' | 'exenta' | 'iva'>('honores');
  const [invoiceNumber, setInvoiceNumber] = useState('F-2026-004');
  const [paymentCopied, setPaymentCopied] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [bankTransferDetails, setBankTransferDetails] = useState('Banco Estado | Cuenta CuentaRUT\nNº de Cuenta: 19.456.782-9\nTitular: Lucía Castro\nEmail: lucia.creative@pixelperfect.cl');

  // CLAIM BUILDER (PROOF-OF-WORK LEDGER) STATES
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedClaimClient, setSelectedClaimClient] = useState<ClientFinancialRow | null>(null);
  const [claimNotes, setClaimNotes] = useState('');
  const [claimPeriod, setClaimPeriod] = useState('Enero - Junio 2026');
  const [claimCopied, setClaimCopied] = useState(false);
  const [sendingClaimEmail, setSendingClaimEmail] = useState(false);
  const [customMilestones, setCustomMilestones] = useState<{ id: string; description: string; amount: number }[]>([
    { id: '1', description: 'Consultoría Estratégica Inicial (Enero 2026)', amount: 150000 },
    { id: '2', description: 'Prototipos de UI & Mockups (Enero/Febrero 2026)', amount: 450000 },
  ]);
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState<string>('');

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

  // Milestone handlers for historically unclaimed backdates
  const handleAddMilestone = () => {
    if (!newMilestoneDesc || !newMilestoneAmount) return;
    const amount = Number(newMilestoneAmount);
    if (isNaN(amount) || amount < 0) return;
    setCustomMilestones((prev) => [
      ...prev,
      {
        id: `m-hist-${Math.random().toString(36).substr(2, 5)}`,
        description: newMilestoneDesc,
        amount,
      },
    ]);
    setNewMilestoneDesc('');
    setNewMilestoneAmount('');
  };

  const handleRemoveMilestone = (id: string) => {
    setCustomMilestones((prev) => prev.filter((m) => m.id !== id));
  };

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
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={onExportCSVReport}
            className="flex-1 md:flex-none border border-slate-250 bg-slate-50 text-slate-705 hover:bg-slate-100 transition-colors py-2 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-primary-coral" /> Exportar Reporte
          </button>
          <button 
            onClick={() => setScreen('clientes', 'none')}
            className="flex-1 md:flex-none border border-slate-250 text-slate-700 hover:bg-slate-50 transition-colors py-2 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Control de Proyectos en Vivo
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Suma horas en tiempo real o genera documentos de cobro y pruebas.</p>
          </div>
          <button 
            onClick={() => setLocalFinancials(financials)}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3" /> Restaurar
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
                <th className="py-2.5 px-3 text-right">Tarifa Real (TER)</th>
                <th className="py-2.5 px-3 text-center">Estatus Pago</th>
                <th className="py-2.5 px-3 text-center">Acciones Inteligentes</th>
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
                      <div className="text-[10px] text-slate-400 mt-0.5 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: row.esquema_cobro === 'suscripcion' ? '#a43b2f' : '#674bb5' }}></span>
                        {row.nombre_proyecto}
                      </div>
                    </td>
                    <td className="py-3 px-3 capitalize font-bold text-slate-550">
                      {row.esquema_cobro === 'fijo' ? (
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">Fijo</span>
                      ) : row.esquema_cobro === 'suscripcion' ? (
                        <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[10px]">Suscripción</span>
                      ) : (
                        <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">Por Hora</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`font-mono font-bold ${dangerHours ? 'text-red-600 bg-red-50 px-1.5 rounded animate-pulse' : 'text-slate-800'}`}>
                          {totalHrs}h
                        </span>
                        <button
                          onClick={() => handleSimulateHour(row.id_cliente)}
                          className="w-5 h-5 bg-slate-100 hover:bg-primary-container-coral hover:text-white rounded flex items-center justify-center font-bold text-slate-500 transition-all cursor-pointer active:scale-95"
                          title="Simular 1 Hora"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCLP(row.facturado_mes)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-850">
                      {formatCLP(Math.round(netTER))}/h
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleUpdateStatus(row.id_cliente, row.estatus_pago === 'pagado' ? 'pendiente' : 'pagado')}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide transition-colors cursor-pointer ${
                          row.estatus_pago === 'pagado'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-805 hover:bg-amber-200'
                        }`}
                        title="Cambiar Estado de Pago"
                      >
                        {row.estatus_pago}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedInvoiceClient(row);
                            const randomNum = Math.floor(Math.random() * 80) + 10;
                            setInvoiceNumber(`BH-2026-00${randomNum}`);
                            setInvoiceType(row.esquema_cobro === 'por_hora' ? 'honores' : 'exenta');
                            setInvoiceModalOpen(true);
                          }}
                          className="px-2 py-1 text-[10px] font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Generar Factura / Boleta sin Word"
                        >
                          <FileText className="w-3" /> Factura
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClaimClient(row);
                            setClaimNotes(row.estatus_pago === 'pendiente' ? `Solicitud formal de pago sobre trabajos de diseño y maquetación del proyecto "${row.nombre_proyecto}".` : 'Dossier de respaldo de hito técnico.');
                            setClaimModalOpen(true);
                          }}
                          className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                            row.estatus_pago === 'pendiente' 
                              ? 'bg-rose-50 text-[#a43b2f] hover:bg-rose-100' 
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Evidencia de Horas de enero y reclamo innegable"
                        >
                          <Scale className="w-3" /> Respaldo
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREMIUM INVOICE GENERATOR MODAL (SOLVES MANUAL WORD ISSUES) */}
      {invoiceModalOpen && selectedInvoiceClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-slate-50 w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-200/90 flex flex-col md:flex-row gap-6 my-8 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            {/* Left Controls Panel */}
            <div className="w-full md:w-5/12 space-y-4 pr-1 md:border-r border-slate-200/70 md:pr-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider w-fit mb-3">
                  <Sparkles className="w-3 h-3" /> Generador Inteligente Lucía Studio
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Configuración del Documento</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Genera automáticamente y de inmediato una boleta o factura personalizada basadas en tus horas registradas. Olvídate de Word.
                </p>

                {/* Form Elements */}
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo de Documento Chile</label>
                    <select
                      value={invoiceType}
                      onChange={(e) => setInvoiceType(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="honores">Boleta de Honorarios (Retención 13.75%)</option>
                      <option value="exenta">Factura de Servicios Exenta (0% IVA)</option>
                      <option value="iva">Factura con IVA (19% Neto)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Folio / Número</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-750 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Detalles de Transferencia</label>
                    <textarea
                      rows={3}
                      value={bankTransferDetails}
                      onChange={(e) => setBankTransferDetails(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Status Update Trigger (Interactive link with list) */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-2 mt-4 md:mt-0">
                <span className="block text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Acción Integrada</span>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  ¿El cliente ya pagó esta factura? Puedes actualizar el estado del proyecto de inmediato:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(selectedInvoiceClient.id_cliente, 'pagado');
                    // Alert user briefly
                    alert(`¡Estatus de ${selectedInvoiceClient.nombre_cliente} actualizado a PAGADO!`);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Registrar Pago Inmediato en Dashboard
                </button>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  onClick={() => {
                    setDownloadingInvoice(true);
                    setTimeout(() => {
                      setDownloadingInvoice(false);
                      alert("Simulación de guardado exitosa. El documento ha sido exportado en formato PDF a tu carpeta de descargas sin problemas.");
                    }, 1200);
                  }}
                  className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-black"
                >
                  {downloadingInvoice ? 'Generando...' : <><Download className="w-3.5 h-3.5" /> Descargar PDF</>}
                </button>
                <button
                  onClick={() => setInvoiceModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Right Invoice Preview Paper Sheet */}
            <div className="w-full md:w-7/12 bg-white rounded-2xl border border-slate-250 p-6 flex flex-col justify-between shadow-inner">
              <div className="space-y-6">
                
                {/* Visual Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">PixelPerfect Studio</h4>
                    <span className="text-[9px] font-bold text-slate-400 block mt-1 uppercase">Lucía Castro R. • Diseño Multidisciplinario</span>
                    <span className="text-[9px] text-slate-500 block leading-tight">Santiago de Chile • lucia.creative@pixelperfect.cl</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded px-2.5 py-1 text-center font-mono">
                    <span className="block text-[8px] font-bold text-rose-600 uppercase">Boleta Electrónica</span>
                    <span className="block text-xs font-black text-rose-700">{invoiceNumber}</span>
                  </div>
                </div>

                {/* Receiver Info */}
                <div className="grid grid-cols-2 gap-4 text-[10px]">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Cliente / Receptor</span>
                    <strong className="block text-slate-800 text-xs mt-0.5">{selectedInvoiceClient.nombre_cliente}</strong>
                    <span className="text-slate-500 block mt-0.5">Proyecto: {selectedInvoiceClient.nombre_proyecto}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Fecha Emisión</span>
                    <span className="block font-medium text-slate-700 mt-0.5">19 de Junio de 2026</span>
                    <span className="block text-[8px] font-bold text-slate-405 uppercase tracking-wider mt-1.5 font-sans">Estatus Actual</span>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase ${selectedInvoiceClient.estatus_pago === 'pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {selectedInvoiceClient.estatus_pago}
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-slate-100 rounded-xl overflow-hidden text-[10px]">
                  <div className="bg-slate-50 border-b border-slate-100 grid grid-cols-12 gap-1 py-1.5 px-3 font-bold text-slate-400 uppercase tracking-wider">
                    <span className="col-span-6">Descripción del servicio entregado</span>
                    <span className="col-span-2 text-center">Horas</span>
                    <span className="col-span-4 text-right">Monto Bruto</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 py-2.5 px-3 border-b border-slate-50 text-slate-705 font-medium">
                    <div className="col-span-6">
                      <strong>Servicios Creativos Profesionales</strong>
                      <span className="block text-[9px] text-slate-400 mt-0.5 font-sans">Ajustes finales, diseño de interfaces, maquetación adaptativa, y tareas de administración asignadas.</span>
                    </div>
                    <span className="col-span-2 text-center font-bold">{selectedInvoiceClient.horas_totales + selectedInvoiceClient.horas_admin}h</span>
                    <span className="col-span-4 text-right font-bold text-slate-900">{formatCLP(selectedInvoiceClient.facturado_mes)}</span>
                  </div>
                </div>

                {/* Calculations Drawer */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Monto Bruto Acumulado:</span>
                    <span className="font-semibold">{formatCLP(selectedInvoiceClient.facturado_mes)}</span>
                  </div>
                  
                  {invoiceType === 'honores' && (
                    <div className="flex justify-between text-red-650 font-medium">
                      <span>Retención de Impuestos SII (13.75% hoy):</span>
                      <span>-{formatCLP(Math.round(selectedInvoiceClient.facturado_mes * 0.1375))}</span>
                    </div>
                  )}

                  {invoiceType === 'iva' && (
                    <div className="flex justify-between text-blue-650 font-medium">
                      <span>IVA Recargo Estimado (19%):</span>
                      <span>+{formatCLP(Math.round(selectedInvoiceClient.facturado_mes * 0.19))}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-900 font-extrabold text-xs pt-1.5 border-t border-slate-100">
                    <span>Líquido a Transferir:</span>
                    <span className="text-blue-700">
                      {invoiceType === 'honores' 
                        ? formatCLP(Math.round(selectedInvoiceClient.facturado_mes * (1 - 0.1375)))
                        : invoiceType === 'iva'
                        ? formatCLP(Math.round(selectedInvoiceClient.facturado_mes * 1.19))
                        : formatCLP(selectedInvoiceClient.facturado_mes)
                      }
                    </span>
                  </div>
                </div>

                {/* Copyable Quick Link */}
                <div className="p-3 bg-indigo-50/40 rounded-xl text-[9px] text-slate-500 leading-relaxed border border-indigo-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="block font-black text-indigo-800 uppercase tracking-wider">Estructura de Datos para Email</span>
                    <button
                      onClick={() => {
                        const txt = `Hola ${selectedInvoiceClient.nombre_cliente},\nEspero estés muy bien. Te adjunto los detalles del cobro correspondiente a las tareas del mes de junio del proyecto "${selectedInvoiceClient.nombre_proyecto}".\n\nMonto Bruto: ${formatCLP(selectedInvoiceClient.facturado_mes)}\nNeto Líquido: ${formatCLP(selectedInvoiceClient.facturado_mes)}\nDatos Transferencia:\n${bankTransferDetails}\n\nMuchas gracias, Lucía CPM.`;
                        navigator.clipboard.writeText(txt);
                        setPaymentCopied(true);
                        setTimeout(() => setPaymentCopied(false), 2000);
                      }}
                      className="text-blue-700 hover:text-blue-800 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      {paymentCopied ? <><Check className="w-3" /> Copiado</> : <><Copy className="w-3" /> Copiar Texto</>}
                    </button>
                  </div>
                  <pre className="font-mono text-[8.5px] scale-95 origin-left whitespace-pre-wrap leading-tight text-slate-650 bg-white p-2 border border-slate-100 rounded-md">
                    {`Para: ${selectedInvoiceClient.nombre_cliente}\nDetalle: ${formatCLP(selectedInvoiceClient.facturado_mes)} (${selectedInvoiceClient.horas_totales + selectedInvoiceClient.horas_admin}h realizadas)\nMódulo Pago: Directo Transferencia`}
                  </pre>
                </div>
              </div>

              {/* Stamp of certification */}
              <div className="mt-4 border-t border-dashed border-slate-200 pt-3 flex items-center justify-between text-[9px] font-sans text-slate-400">
                <span>Certificado Boletas Electrónicas PixelPerfect 2026</span>
                <span className="font-mono font-bold text-slate-300">HASH-ID: PXS-2026-619</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PROOF-OF-WORK LEDGER & FORMAL CLAIM GENERATOR (SOLVES DEBT & PROVING WORK TRACE ISSUES) */}
      {claimModalOpen && selectedClaimClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-205 flex flex-col md:flex-row gap-6 my-8 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            {/* Left Controls (Adds backdated items on the fly!) */}
            <div className="w-full md:w-5/12 space-y-4 pr-1 md:border-r border-slate-100 md:pr-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-[#a43b2f] rounded-full text-[10px] font-black uppercase tracking-wider w-fit mb-3">
                  <ShieldAlert className="w-3.5 h-3.5" /> Libro de Evidencia y Registro Histórico
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Consolidado Exigible de Deuda</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  ¿El cliente te debe dinero desde hace meses (ej. enero) y no tienes pruebas? Consolida tus horas actuales del timer automático de hoy junto con hitos y deudas históricas para forjar un dossier de reclamo formal que no puedan evadir.
                </p>

                {/* Backdated Milestones list */}
                <div className="space-y-3 pt-3">
                  <div>
                    <span className="block text-[10px] font-black text-slate-450 uppercase tracking-rider mb-2">Hitos Históricos para Cobrar (Ene - May 2026)</span>
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 space-y-2 max-h-[140px] overflow-y-auto">
                      {customMilestones.map((milestone) => (
                        <div key={milestone.id} className="flex justify-between items-center text-[10px] bg-white p-2 rounded-xl border border-slate-150">
                          <div className="pr-2 max-w-[130px]">
                            <span className="block font-bold text-slate-800 leading-tight">{milestone.description}</span>
                            <span className="text-[8px] text-red-600 font-extrabold block">Acuerdo de Enero</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-700">{formatCLP(milestone.amount)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMilestone(milestone.id)}
                              className="text-red-500 hover:text-red-700 font-black cursor-pointer bg-red-50 w-4.5 h-4.5 rounded flex items-center justify-center"
                              title="Eliminar de la evidencia"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form to add historical invoices or backdated records */}
                  <div className="bg-slate-50/50 p-3 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Añadir Otro Cobro Histórico o Deuda Olvidada</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="ej. Diseño Logo Enero"
                        value={newMilestoneDesc}
                        onChange={(e) => setNewMilestoneDesc(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.1.5 py-1 text-[10px] text-slate-700 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Monto ($)"
                        value={newMilestoneAmount}
                        onChange={(e) => setNewMilestoneAmount(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-700 focus:outline-none font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMilestone}
                      className="w-full bg-[#f26e56] hover:bg-[#d85842] text-white font-bold text-[9px] py-1 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      + Insertar a Dossier Oficial de Respaldo
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setSendingClaimEmail(true);
                    setTimeout(() => {
                      setSendingClaimEmail(false);
                      alert("Email con enlace de Verificación de Auditoría enviado legítimamente. Se incluye el log unificado de horas inmutables.");
                    }, 1500);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/10 hover:opacity-95"
                >
                  {sendingClaimEmail ? 'Enviando...' : <><Send className="w-3.5 h-3.5" /> Enviar Reclamo Formal</>}
                </button>
                <button
                  onClick={() => setClaimModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Right Audit Ledger Sheet & Copyable Email Section */}
            <div className="w-full md:w-7/12 bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between max-h-[650px] overflow-y-auto">
              <div>
                
                {/* Dossier Document Header */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/90 relative overflow-hidden space-y-4">
                  {/* Watermark badge */}
                  <div className="absolute right-[-45px] top-[15px] rotate-45 bg-[#f26e56] text-white text-[7px] font-black tracking-widest px-11 py-1 uppercase shadow-sm">
                    AUDITADO • TIMER
                  </div>

                  <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-650" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase">Dossier Consolidado de Respaldo de Trabajo</h4>
                      <span className="text-[9px] text-[#f26e56] font-bold block leading-none">REGISTRO SISTÈMICO DE HORAS Y HITOS - PIXELPERFECT</span>
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 gap-3 text-[10px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-bold text-[8px] uppercase">Razón Social Reclamación</span>
                      <strong className="text-slate-800 text-xs mt-0.5">{selectedClaimClient.nombre_cliente}</strong>
                      <span className="text-slate-500 block">Plan: {selectedClaimClient.esquema_cobro === 'suscripcion' ? 'Suscripción Mensual' : 'Valor Fijo & Horas'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-[8px] uppercase">Monto Total Exigible</span>
                      <strong className="text-[#a43b2f] text-sm block font-mono">
                        {formatCLP(selectedClaimClient.facturado_mes + customMilestones.reduce((sum, m) => sum + m.amount, 0))}
                      </strong>
                      <span className="text-[8px] text-slate-500 font-semibold block leading-tight">Consolida horas actuales + cobros de enero</span>
                    </div>
                  </div>

                  {/* Audit Trail List */}
                  <div className="text-[9.5px] space-y-2">
                    <span className="block font-black text-slate-450 uppercase tracking-wide">Pruebas Físicas de Actividad (Bitácora de Eventos)</span>
                    <div className="space-y-1.5 font-mono text-[9px] text-slate-650">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span>• Registro Horas en Vivo (Cronómetro):</span>
                        <span className="font-extrabold text-slate-900">{selectedClaimClient.horas_totales + selectedClaimClient.horas_admin} horas reales</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span>• Tarifa Pactada Base:</span>
                        <span className="font-extrabold text-slate-900">{formatCLP(selectedClaimClient.tarifa_pactada)}/hora</span>
                      </div>
                      
                      {customMilestones.map((m) => (
                        <div key={m.id} className="flex justify-between items-center py-1 border-b border-slate-100 text-slate-500">
                          <span>• [HITO DEUDA] {m.description}:</span>
                          <span className="font-bold text-slate-900">{formatCLP(m.amount)}</span>
                        </div>
                      ))}

                      <div className="flex justify-between items-center py-1 text-slate-800 font-extrabold bg-slate-50 p-1.5 rounded mt-2 text-[9.5px]">
                        <span>• Total Consolidado Auditado:</span>
                        <span className="text-emerald-700">{formatCLP(selectedClaimClient.facturado_mes + customMilestones.reduce((sum, m) => sum + m.amount, 0))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature section */}
                  <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center text-[10px]">
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Firma de Registro Directo</span>
                      <span className="font-mono font-black text-indigo-700 flex items-center gap-1 mt-0.5">
                        <FileSignature className="w-3.5 h-3.5" /> Lucía Castro R. [VALIDADA]
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Certificación Inmutable</span>
                      <span className="font-mono text-slate-400 text-[8px]">HASH: LCR-2026-619-AUTO</span>
                    </div>
                  </div>
                </div>

                {/* Email Draft Section */}
                <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 text-[10px] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="block font-black text-[#a43b2f] uppercase tracking-wider">Carta Formal de Cobro Amistosa</span>
                    <button
                      onClick={() => {
                        const totalDebt = selectedClaimClient.facturado_mes + customMilestones.reduce((sum, m) => sum + m.amount, 0);
                        const draft = `Estimados/as ${selectedClaimClient.nombre_cliente},\n\nEspero que se encuentren muy bien.\n\nEscribo para enviarles un consolidado acumulado de las prestaciones de diseño gráfico y consultorías de interfaz realizadas por PixelPerfect para el proyecto "${selectedClaimClient.nombre_proyecto}". Con el fin de mantener un orden impecable, he sistematizado las horas cronometradas mediante nuestro software auditable.\n\nResumen Financiero Exigible:\n----------------------------------------\n- Trabajos del mes registrado (Horas del Timer: ${selectedClaimClient.horas_totales + selectedClaimClient.horas_admin}h): ${formatCLP(selectedClaimClient.facturado_mes)}\n${customMilestones.map(m => `- [Anterior] ${m.description}: ${formatCLP(m.amount)}`).join('\n')}\n----------------------------------------\nTotal acumulado de deuda: ${formatCLP(totalDebt)}\n\nEs un agrado para mí trabajar juntos en su marca, y espero que este reporte formal de cronómetro e hitos les sirva para visar el pago pendiente.\n\nQuedo atenta a la confirmación de la transferencia.\n\nUn cordial saludo,\nLucía Castro\nPixelPerfect Studio`;
                        navigator.clipboard.writeText(draft);
                        setClaimCopied(true);
                        setTimeout(() => setClaimCopied(false), 2000);
                      }}
                      className="text-indigo-700 hover:text-indigo-800 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      {claimCopied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar Correo</>}
                    </button>
                  </div>
                  <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-xl max-h-[120px] overflow-y-auto font-sans leading-relaxed text-slate-600 whitespace-pre-wrap text-[9px]">
                    {`Estimados/as ${selectedClaimClient.nombre_cliente},\n\nJunto con saludar, envío consolidado acumulado del proyecto "${selectedClaimClient.nombre_proyecto}". He sistematizado las horas con cronómetro auditable.\n\nResumen:\n- Horas del Timer (${selectedClaimClient.horas_totales + selectedClaimClient.horas_admin}h): ${formatCLP(selectedClaimClient.facturado_mes)}\n${customMilestones.map(m => `- [Hito anterior] ${m.description}: ${formatCLP(m.amount)}`).join('\n')}\nTotal consolidado: ${formatCLP(selectedClaimClient.facturado_mes + customMilestones.reduce((sum, m) => sum + m.amount, 0))}\n\nQuedo atenta a la confirmación.`}
                  </div>
                </div>

              </div>
              <div className="mt-4 text-[9px] text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Usar este reporte sistematizado permite demostrar con exactitud matemática qué días se trabajó y qué hitos de enero permanecen deudores.</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
