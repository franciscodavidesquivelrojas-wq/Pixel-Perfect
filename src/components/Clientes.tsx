import React, { useState, useRef } from 'react';
import { AlertTriangle, Smile, Send, CheckCircle2, ChevronRight, UserCheck, BarChart2, Plus, MessageSquarePlus, BellRing, Upload, AlertCircle, FileText, Check, Copy, Sparkles } from 'lucide-react';
import { Feedback, AlertItem, ClientFinancialRow } from '../types';
import { formatCLP } from '../utils';

interface ClientesProps {
  alerts: AlertItem[];
  feedbacks: Feedback[];
  onAddFeedback: (feedback: Omit<Feedback, 'id'>) => void;
  onResolveAlert: (alertId: string) => void;
  setScreen: (screen: 'mi-espacio' | 'mi-dia' | 'proyectos' | 'clientes', transition?: 'none' | 'push' | 'push_back') => void;
  financials: ClientFinancialRow[];
  setFinancials: React.Dispatch<React.SetStateAction<ClientFinancialRow[]>>;
  onExportCSVReport: () => void;
}

export default function Clientes({ alerts, feedbacks, onAddFeedback, onResolveAlert, setScreen, financials, setFinancials, onExportCSVReport }: ClientesProps) {
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState<'happy' | 'action'>('happy');

  // CSV Drag and Drop states
  const [dragActive, setDragActive] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Intelligent CSV Validation & Merge States
  const [pendingParsedRows, setPendingParsedRows] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<{ rowIndex: number; columnName: string; originalValue: string; errorDescription: string }[]>([]);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [showMergeChoiceModal, setShowMergeChoiceModal] = useState(false);

  // Chart state for hover tooltips
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Template string for Lucía's reference
  const CSV_TEMPLATE = `id_cliente,nombre_cliente,esquema_cobro,nombre_proyecto,horas_totales,horas_admin,tarifa_pactada,costos_directos,facturado_mes,estatus_pago
c1,InnovaTech,fijo,Rediseño E-commerce,45,10,1500000,150000,1500000,pagado
c2,FitLife Pro,por_hora,App Mobile Fitness,60,8,30000,80000,1800000,pendiente
c3,Nexus Cloud,fijo,Branding Corporativo,30,12,800000,50000,800000,pendiente
c4,SaaSify,por_hora,SaaS Dashboard,40,5,35000,120000,1400000,pagado
c5,Rincón Orgánico,fijo,E-commerce Shopify,55,15,2000000,200000,2000000,pendiente`;

  // Parse CSV function with Deep Auditing
  const parseCSVData = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
      if (lines.length < 2) {
        throw new Error('El archivo CSV está vacío o le faltan registros.');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Required columns check
      const required = [
        'id_cliente', 'nombre_cliente', 'esquema_cobro', 'nombre_proyecto', 
        'horas_totales', 'horas_admin', 'tarifa_pactada', 'costos_directos', 
        'facturado_mes', 'estatus_pago'
      ];
      
      const missing = required.filter(col => !headers.includes(col));
      if (missing.length > 0) {
        throw new Error(`Columnas faltantes en el CSV: ${missing.join(', ')}`);
      }

      const rawRows: any[] = [];
      const errors: { rowIndex: number; columnName: string; originalValue: string; errorDescription: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;

        const rowObj: any = {};
        headers.forEach((header, idx) => {
          rowObj[header] = values[idx];
        });

        const rowNum = i + 1;

        // Perform Audits
        if (!rowObj.id_cliente) {
          errors.push({
            rowIndex: rowNum,
            columnName: 'id_cliente',
            originalValue: '',
            errorDescription: 'El identificador unico (id_cliente) no puede estar vacío.'
          });
        }
        if (!rowObj.nombre_cliente) {
          errors.push({
            rowIndex: rowNum,
            columnName: 'nombre_cliente',
            originalValue: '',
            errorDescription: 'El campo de nombre del cliente está vacío.'
          });
        }
        if (rowObj.esquema_cobro !== 'por_hora' && rowObj.esquema_cobro !== 'fijo' && rowObj.esquema_cobro !== 'suscripcion') {
          errors.push({
            rowIndex: rowNum,
            columnName: 'esquema_cobro',
            originalValue: rowObj.esquema_cobro || 'vacío',
            errorDescription: 'Esquema de cobro inválido (valores permitidos: "por_hora", "fijo" o "suscripcion").'
          });
        }
        if (rowObj.estatus_pago !== 'pendiente' && rowObj.estatus_pago !== 'pagado') {
          errors.push({
            rowIndex: rowNum,
            columnName: 'estatus_pago',
            originalValue: rowObj.estatus_pago || 'vacío',
            errorDescription: 'Estatus de facturación inválido (debe ser "pendiente" o "pagado").'
          });
        }

        // Numeric audits
        const numericColumns = ['horas_totales', 'horas_admin', 'tarifa_pactada', 'costos_directos', 'facturado_mes'];
        numericColumns.forEach(col => {
          const rawVal = rowObj[col];
          const hasError = rawVal === undefined || rawVal === '' || isNaN(Number(rawVal)) || Number(rawVal) < 0;
          if (hasError) {
            errors.push({
              rowIndex: rowNum,
              columnName: col,
              originalValue: rawVal || 'vacío',
              errorDescription: `El valor numérico "${rawVal || ''}" es inválido o negativo.`
            });
          }
        });

        rawRows.push({ ...rowObj, rowIndex: rowNum });
      }

      if (rawRows.length === 0) {
        throw new Error('No se encontraron filas válidas en el documento.');
      }

      setPendingParsedRows(rawRows);
      setCsvErrors(errors);

      if (errors.length > 0) {
        setShowDiagnosticModal(true);
      } else {
        // Safe to direct merge screen
        setShowMergeChoiceModal(true);
      }
      setCsvError(null);
    } catch (err: any) {
      setCsvError(err.message || 'Ocurrió un error al procesar el archivo CSV.');
      setCsvSuccess(null);
    }
  };

  // Autocorrect Strategy Handler
  const handleAutoCorrectAndProceed = () => {
    const cleaned: ClientFinancialRow[] = pendingParsedRows.map(row => {
      return {
        id_cliente: row.id_cliente || `c-auto-${Math.random().toString(36).substr(2, 5)}`,
        nombre_cliente: row.nombre_cliente || 'Cliente Temporal',
        esquema_cobro: (row.esquema_cobro === 'por_hora' || row.esquema_cobro === 'fijo' || row.esquema_cobro === 'suscripcion') ? row.esquema_cobro : 'fijo',
        nombre_proyecto: row.nombre_proyecto || 'Proyecto General',
        horas_totales: isNaN(Number(row.horas_totales)) || Number(row.horas_totales) < 0 ? 0 : Number(row.horas_totales),
        horas_admin: isNaN(Number(row.horas_admin)) || Number(row.horas_admin) < 0 ? 0 : Number(row.horas_admin),
        tarifa_pactada: isNaN(Number(row.tarifa_pactada)) || Number(row.tarifa_pactada) < 0 ? 0 : Number(row.tarifa_pactada),
        costos_directos: isNaN(Number(row.costos_directos)) || Number(row.costos_directos) < 0 ? 0 : Number(row.costos_directos),
        facturado_mes: isNaN(Number(row.facturado_mes)) || Number(row.facturado_mes) < 0 ? 0 : Number(row.facturado_mes),
        estatus_pago: (row.estatus_pago === 'pendiente' || row.estatus_pago === 'pagado') ? row.estatus_pago : 'pendiente',
      };
    });

    setPendingParsedRows(cleaned);
    setCsvErrors([]);
    setShowDiagnosticModal(false);
    setShowMergeChoiceModal(true);
  };

  // Discard Problematic Lines Strategy Handler
  const handleIgnoreErrorsAndProceed = () => {
    const errorRows = new Set(csvErrors.map(e => e.rowIndex));
    const pruned = pendingParsedRows
      .filter(row => !errorRows.has(row.rowIndex))
      .map(row => {
        return {
          id_cliente: row.id_cliente,
          nombre_cliente: row.nombre_cliente,
          esquema_cobro: row.esquema_cobro,
          nombre_proyecto: row.nombre_proyecto,
          horas_totales: Number(row.horas_totales) || 0,
          horas_admin: Number(row.horas_admin) || 0,
          tarifa_pactada: Number(row.tarifa_pactada) || 0,
          costos_directos: Number(row.costos_directos) || 0,
          facturado_mes: Number(row.facturado_mes) || 0,
          estatus_pago: row.estatus_pago,
        } as ClientFinancialRow;
      });

    if (pruned.length === 0) {
      setCsvError('No quedaron filas en el dataset después de eliminar las erróneas.');
      setShowDiagnosticModal(false);
      return;
    }

    setPendingParsedRows(pruned);
    setCsvErrors([]);
    setShowDiagnosticModal(false);
    setShowMergeChoiceModal(true);
  };

  // DB Overwrite Confirmation Handler
  const handleOverwriteConfirm = () => {
    setFinancials(pendingParsedRows);
    setCsvSuccess(`¡Sobrescrito! Se ha configurado tu workspace con el CSV contable analizado.`);
    setCsvError(null);
    setShowMergeChoiceModal(false);
    setPendingParsedRows([]);
  };

  // DB Incremental Merge Confirmation Handler
  const handleIncrementalMergeConfirm = () => {
    setFinancials(prev => {
      const dbMap = new Map(prev.map(p => [p.id_cliente, p]));
      pendingParsedRows.forEach(row => {
        dbMap.set(row.id_cliente, row);
      });
      return Array.from(dbMap.values());
    });
    setCsvSuccess(`¡Integrado! ${pendingParsedRows.length} clientes añadidos o actualizados en tu base de datos.`);
    setCsvError(null);
    setShowMergeChoiceModal(false);
    setPendingParsedRows([]);
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          parseCSVData(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          parseCSVData(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadDemoCSV = () => {
    parseCSVData(CSV_TEMPLATE);
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(CSV_TEMPLATE);
    alert('Plantilla CSV copiada al portapapeles. ¡Pégala en un archivo .csv!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !feedbackText) return;

    const initials = clientName
      .split(' ')
      .map((x) => x[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const bgColors = ['#ff7f6e', '#62fae3', '#af94ff', '#cebdff', '#3cddc7'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

    onAddFeedback({
      clientName,
      feedback: feedbackText,
      avatar: initials || 'CL',
      status,
      project: project || 'General',
      date: 'Hoy',
      avatarBg: randomBg,
    });

    setClientName('');
    setFeedbackText('');
    setProject('');
    setStatus('happy');
    setShowModal(false);
  };

  // Generate dynamic chart data based on current loaded financials
  const dynamicChartData = financials.map((f, i) => {
    const sumHoras = f.horas_totales + f.horas_admin;
    // Calculate a score/value for project health bar:
    // Ratio of paid invoices, higher paid/costs rating, positive status.
    let value = 50;
    if (f.estatus_pago === 'pagado') value += 30;
    if (sumHoras > 0) {
      const ter = (f.facturado_mes - f.costos_directos) / sumHoras;
      if (ter > 30000) value += 20;
      else if (ter < 15000) value -= 20;
    }
    // Crop between 10 and 100
    value = Math.max(15, Math.min(100, value));

    const colors = ['#62fae3', '#ff7f6e', '#af94ff', '#006b5f', '#ffc107', '#a43b2f'];
    return {
      id: i + 1,
      name: f.nombre_proyecto,
      client: f.nombre_cliente,
      value,
      color: colors[i % colors.length]
    };
  });

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-28 animate-fade-in space-y-6">
      
      {/* Interactive Top Actions Hub */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          Base de Datos Contable
        </span>
        <button
          onClick={onExportCSVReport}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <FileText className="w-3.5 h-3.5 text-primary-coral" /> Exportar Reporte Mensual
        </button>
      </div>

      {/* Screen Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Gestión y Carga de Clientes
        </h1>
        <p className="text-sm text-slate-500 font-medium font-sans">
          Arrastra tu planilla contable para auditar errores, corregir anomalías y actualizar tus proyectos.
        </p>
      </div>

      {/* DRAG AND DROP CSV DROPZONE AREA */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-secondary-teal" /> Importar CSV Contable
          </h3>
          <button 
            type="button" 
            onClick={loadDemoCSV}
            className="text-[10px] font-bold text-secondary-teal hover:underline flex items-center gap-1 cursor-pointer bg-secondary-container-teal/40 px-2.5 py-1 rounded-full border border-secondary-teal/10"
          >
            🔌 Cargar Datos Demo
          </button>
        </div>

        {/* Dropzone frame with Drag-Support / Click Selection */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
            dragActive 
              ? 'border-secondary-teal bg-secondary-container-teal/10 scale-[1.01]' 
              : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-1">
            <FileText className="w-6 h-6 text-slate-400 stroke-[1.8px]" />
          </div>

          <p className="text-xs font-bold text-slate-700 leading-tight">
            Arrastra tu planilla CSV aquí o haz clic para explorar
          </p>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Formatos soportados: .csv codificado UTF-8
          </p>
        </div>

        {/* Feedback Messages */}
        {csvError && (
          <div className="bg-rose-50 border border-rose-200/60 text-[#a43b2f] p-3 rounded-xl text-xs flex items-start gap-2 animate-scale-up">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{csvError}</span>
          </div>
        )}

        {csvSuccess && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3 rounded-xl text-xs flex items-start gap-2 animate-scale-up">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-bold leading-relaxed">{csvSuccess}</span>
          </div>
        )}

        {/* CSV Format Reference collapsible details */}
        <div className="border border-slate-150/60 bg-slate-50 rounded-xl p-3 text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-600 font-extrabold uppercase tracking-wide">
            <span>Estructura de Columnas Requerida:</span>
            <button 
              onClick={copyTemplate}
              type="button"
              className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> copiar esquema
            </button>
          </div>
          <code className="block bg-white p-2 rounded-lg border border-slate-100 overflow-x-auto text-[10px] font-mono leading-relaxed whitespace-pre font-semibold text-slate-600 select-all">
            {CSV_TEMPLATE}
          </code>
        </div>
      </div>

      {/* SVG Bar Chart Card (Panorama de Proyectos) */}
      <div className="bg-white border border-slate-200/95 shadow-sm rounded-3xl p-6">
        <h3 className="text-sm font-extrabold text-slate-800 mb-6 flex justify-between items-center">
          <span>Panorama de Proyectos</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">Rentabilidad Cruzada</span>
        </h3>

        {/* Visual Bar Columns */}
        <div className="flex items-end justify-around h-32 relative pt-4 pb-2 border-b border-slate-100">
          {dynamicChartData.map((data, index) => (
            <div
              key={data.id}
              className="flex flex-col items-center gap-2 group relative w-12"
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Tooltip on hover */}
              {hoveredBar === index && (
                <div className="absolute bottom-full mb-1 bg-slate-900 text-white font-semibold text-[10px] py-1.5 px-2.5 rounded-xl text-center shadow-xl w-36 z-20 animate-scale-up">
                  <strong className="block text-secondary-container-teal text-[11px] font-black">{data.name}</strong>
                  <span className="opacity-80">Cliente: {data.client}</span>
                  <span className="block text-[9px] text-slate-300 mt-0.5">Puntuación Salud: {data.value}/100</span>
                </div>
              )}

              {/* Bar volume column */}
              <div
                className="w-8 rounded-t-lg transition-all duration-300 group-hover:opacity-90 shadow-sm cursor-pointer"
                style={{
                  height: `${data.value}%`,
                  backgroundColor: data.color,
                }}
              />
              {/* Bar index label / initials */}
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                P{data.id}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase text-center mt-3">
          Leyenda: Los índices P corresponden a tus proyectos financieros activos ordenados por rentabilidad real calculada.
        </p>
      </div>

      {/* Section: Atención Requerida */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#a43b2f] flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-primary-coral" />
          Atención Requerida
        </h3>

        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-red-50/40 border border-[#dec0bb]/50 rounded-2xl p-5 shadow-sm relative space-y-4 animate-scale-up"
          >
            {/* Header message or customer initial */}
            {alert.client && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary-container-coral/20 text-primary-coral font-black text-xs flex items-center justify-center">
                  {alert.avatar || 'CL'}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 tracking-tight">{alert.client}</h4>
                  <p className="text-[10px] font-semibold text-slate-400">{alert.project}</p>
                </div>
                <span className="ml-auto bg-red-100 text-[#a43b2f] font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {alert.status}
                </span>
              </div>
            )}

            <p className="text-xs italic text-slate-700 leading-relaxed font-sans bg-white border border-[#dec0bb]/20 p-3 rounded-xl">
              "{alert.description}"
            </p>

            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100/50">
              <button
                onClick={() => onResolveAlert(alert.id)}
                className="text-primary-coral font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {alert.avatar ? (
                  <>
                    <BellRing className="w-3.5 h-3.5" /> Enviar Recordatorio
                  </>
                ) : (
                  <>Resolver Ahora →</>
                )}
              </button>
              <span className="font-bold text-slate-400 uppercase tracking-widest">
                {alert.stage}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Section: Clientes Felices */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-secondary-teal flex items-center gap-1.5">
          <Smile className="w-4 h-4 text-secondary-teal" />
          Clientes Felices
        </h3>

        <div className="space-y-3">
          {feedbacks.map((f) => (
            <div
              key={f.id}
              className="bg-emerald-50/30 border border-[#dec0bb]/10 rounded-2xl p-4 flex items-start gap-3 shadow-xs hover:shadow-sm"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-slate-800"
                style={{ backgroundColor: f.avatarBg || '#e2e8f0' }}
              >
                {f.avatar}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900">{f.clientName}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{f.date}</span>
                </div>
                <p className="text-xs italic text-slate-600 font-sans">
                  "{f.feedback}"
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-secondary-teal">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Proyecto: {f.project}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Feedback Action Button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full border-2 border-dashed border-slate-200 hover:border-slate-350 hover:bg-slate-50 transition-colors py-3.5 rounded-2xl text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Añadir Feedback
        </button>
      </div>

      {/* Add Feedback Drawer/Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-fade-in">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-150 space-y-4 animate-scale-up"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquarePlus className="w-5 h-5 text-secondary-teal" />
                Registrar Comentarios o Feedback
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-extrabold cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Marcos A. o Laura G."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl text-sm font-semibold focus:border-secondary-teal focus:bg-white transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Proyecto Asociado</label>
                <input
                  type="text"
                  placeholder="Ej. Rediseño Web E-commerce"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl text-sm font-semibold focus:border-secondary-teal focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado de Alerta o Felicidad</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('happy')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      status === 'happy'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Smile className="w-4 h-4 text-emerald-600" />
                    Cliente Feliz
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('action')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      status === 'action'
                        ? 'border-red-500 bg-red-50 text-red-100 text-red-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Atención Requerida
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Comentarios o Feedback</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Redacta la opinión del cliente o la alerta registrada en el proyecto..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl text-sm font-semibold focus:border-secondary-teal focus:bg-white transition-all duration-300 resize-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-secondary-teal hover:opacity-95 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Añadir Comentarios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CSV DIAGNOSTIC AND CORRECTION MODAL (Intelligent Auditing) */}
      {showDiagnosticModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-150 space-y-5 animate-scale-up max-h-[90vh] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Diagnóstico de Calidad: {csvErrors.length} alerta{csvErrors.length > 1 ? 's' : ''} encontrada{csvErrors.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Auditor de Integridad de Planilla
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                El motor de análisis de PixelPerfect detectó campos faltantes o valores erróneos en el archivo. Puedes resolverlos automáticamente ahora o ignorar los registros que contienen fallas.
              </p>
            </div>

            {/* List of discrepancies */}
            <div className="flex-1 overflow-y-auto bg-slate-50 border border-slate-200/60 rounded-2xl p-4 gap-2 space-y-2.5 max-h-[300px]">
              <div className="grid grid-cols-1 divide-y divide-slate-150 text-[11px]">
                {csvErrors.map((error, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1 font-sans">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-[#a43b2f] uppercase tracking-wider text-[9px] bg-red-50 border border-red-200/10 px-1.5 py-0.5 rounded">
                        Fila {error.rowIndex} • {error.columnName}
                      </span>
                      <span className="text-slate-400 font-mono">Valor: "{error.originalValue}"</span>
                    </div>
                    <p className="text-slate-700 italic font-medium">
                      {error.errorDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleAutoCorrectAndProceed}
                className="w-full bg-gradient-to-tr from-secondary-teal to-teal-500 text-white font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-secondary-teal/20 transition-all hover:opacity-95 active:scale-98"
              >
                <Sparkles className="w-4 h-4" /> Corregir automáticamente
              </button>
              
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={handleIgnoreErrorsAndProceed}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wide py-3 px-3 rounded-xl transition-all cursor-pointer"
                >
                  Ignorar esas filas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDiagnosticModal(false);
                    setPendingParsedRows([]);
                  }}
                  className="border border-slate-250 hover:bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-wide py-3 px-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar carga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV MERGE & DB WRITE OPTIONS MODAL (Incremental Database Option) */}
      {showMergeChoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-150 space-y-6 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-secondary-teal flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Check className="w-6 h-6 text-emerald-600 stroke-[3px]" />
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                Integración de Base de Datos
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                El archivo de clientes es válido. Selecciona la estrategia de persistencia para guardar los cambios:
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Incremental Update */}
              <button
                type="button"
                onClick={handleIncrementalMergeConfirm}
                className="w-full text-left bg-slate-50 hover:bg-slate-100 p-4 border border-slate-200 rounded-2xl transition-all flex items-start gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-secondary-container-teal/40 text-secondary-teal flex items-center justify-center shrink-0 font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-800">
                    Actualizar e Integrar (Recomendado)
                  </span>
                  <p className="text-[10px] text-slate-550 mt-1">
                    Carga e integra nuevos clientes a tu base de datos actual. Si el ID ya existe, se actualiza la facturación.
                  </p>
                </div>
              </button>

              {/* Option 2: Full Overwrite */}
              <button
                type="button"
                onClick={handleOverwriteConfirm}
                className="w-full text-left bg-rose-50/20 hover:bg-rose-50/50 p-4 border border-rose-100 rounded-2xl transition-all flex items-start gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-bold text-sm">
                  🗑
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-800">
                    Sobrescribir los datos actuales
                  </span>
                  <p className="text-[10px] text-slate-550 mt-1">
                    Elimina todos los clientes de tu base de datos actual y los reemplaza por completo por el nuevo listado.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowMergeChoiceModal(false);
                  setPendingParsedRows([]);
                }}
                className="text-[10px] font-black text-slate-400 hover:text-slate-650 uppercase tracking-widest cursor-pointer"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
