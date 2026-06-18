import React, { useState } from 'react';
import { Plus, Users, Calendar, AlertCircle, CheckCircle2, ChevronRight, BarChart3, TrendingUp, Sparkles, FolderOpen } from 'lucide-react';
import { Project } from '../types';

interface MisProyectosProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
  setScreen: (screen: 'mi-espacio' | 'mi-dia' | 'proyectos' | 'clientes', transition?: 'none' | 'push' | 'push_back') => void;
}

export default function MisProyectos({ projects, onAddProject, setScreen }: MisProyectosProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<Project['status']>('En progreso');
  const [date, setDate] = useState('');
  const [initials, setInitials] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !client) return;

    // Default colors for visual variety
    const colors = ['#674bb5', '#006b5f', '#a43b2f', '#db2777', '#2563eb'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddProject({
      name,
      client,
      status,
      deliveryDate: date || 'Sin fecha',
      members: initials ? initials.split(',').map((x) => x.trim().toUpperCase()) : ['LC'],
      color: randomColor,
    });

    // Reset fields
    setName('');
    setClient('');
    setStatus('En progreso');
    setDate('');
    setInitials('');
    setShowModal(false);
  };

  const getStatusClasses = (statusVal: Project['status']) => {
    switch (statusVal) {
      case 'En progreso':
        return 'bg-emerald-500/10 text-emerald-700 font-bold';
      case 'Revisión':
        return 'bg-amber-500/10 text-amber-700 font-bold';
      case 'Atrasado':
        return 'bg-rose-500/10 text-rose-700 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 font-bold';
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-28 animate-fade-in">
      
      {/* Page Title & Header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Mis Proyectos
        </h1>
        <p className="text-sm text-slate-500 font-medium font-sans">
          Gestiona el progreso de tus trabajos activos y mantén todo bajo control.
        </p>
      </div>

      {/* Modern Banner Button "+ Nuevo Proyecto" */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-secondary-fixed text-on-secondary-fixed-variant hover:opacity-90 active:scale-[0.99] font-black text-sm tracking-wide py-4 px-6 rounded-2xl mb-6 flex items-center justify-center gap-2 shadow-lg shadow-secondary-fixed/20 transition-all cursor-pointer"
        style={{ backgroundColor: '#62fae3' }}
      >
        <Plus className="w-5 h-5 stroke-[3px]" />
        Nuevo Proyecto
      </button>

      {/* Projects List Container */}
      <div className="space-y-4 mb-8">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden"
          >
            {/* Visual colored side-strip indicator */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1.5"
              style={{ backgroundColor: proj.color }}
            />

            <div className="flex justify-between items-start gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Cliente: <span className="text-slate-600">{proj.client}</span>
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] select-none ${getStatusClasses(proj.status)}`}>
                {proj.status}
              </span>
            </div>

            {/* Bottom info section */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              {/* Member Avatars */}
              <div className="flex -space-x-2">
                {proj.members.map((initial, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white text-[10px] font-black flex items-center justify-center text-white"
                    style={{
                      backgroundColor:
                        i === 0 ? '#ff7f6e' : i === 1 ? '#674bb5' : '#006b5f',
                    }}
                  >
                    {initial}
                  </div>
                ))}
              </div>

              {/* Delivery due date badge */}
              <span className="text-[11px] font-bold text-slate-500 bg-slate-50 py-1 px-2.5 rounded-lg flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Entrega: {proj.deliveryDate}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Card (Métricas Rápidas) */}
      <div className="bg-slate-100 border border-slate-200/60 rounded-2xl p-5 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          Métricas Rápidas
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase block tracking-wider">Activos</span>
            <span className="text-2xl font-black text-primary-coral mt-1 block">
              {projects.length}
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase block tracking-wider">Próx. Entrega</span>
            <span className="text-2xl font-black text-secondary-teal mt-1 block">
              3
            </span>
          </div>
        </div>
      </div>

      {/* Callout box (¿Nuevo desafío?) */}
      <div className="bg-gradient-to-tr from-slate-900 to-teal-950 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
        {/* Abstract blur accent */}
        <div className="absolute -right-16 -bottom-16 w-36 h-36 rounded-full bg-secondary-container-teal/20 blur-2xl"></div>
        <div className="relative z-10 space-y-3">
          <h4 className="text-base font-bold tracking-tight">¿Nuevo desafío?</h4>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Crea un nuevo proyecto para empezar a trackear tiempo y materiales automáticamente.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-secondary-container-teal text-secondary-teal hover:opacity-90 hover:scale-[1.01] transition-all px-4 py-2 bg-[#62fae3] rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer leading-none mt-2"
          >
            Crear ahora
            <ChevronRight className="w-4 h-4 stroke-[2.2px]" />
          </button>
        </div>
      </div>

      {/* Add Project Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-fade-in">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <FolderOpen className="w-5 h-5 text-tertiary-violet" />
                Registrar Nuevo Proyecto
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre del Proyecto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rediseño Web E-commerce"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl text-sm font-semibold focus:border-tertiary-violet focus:bg-white transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. InnovaTech"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl text-sm font-semibold focus:border-tertiary-violet focus:bg-white transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Project['status'])}
                    className="w-full bg-slate-50 border border-slate-200 outline-none p-2.5 rounded-xl text-xs font-bold focus:border-tertiary-violet"
                  >
                    <option value="En progreso">En progreso</option>
                    <option value="Revisión">Revisión</option>
                    <option value="Atrasado">Atrasado</option>
                    <option value="Planificado">Planificado</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Fecha de Entrega</label>
                  <input
                    type="text"
                    placeholder="Ej. 15 Oct"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none p-2.5 rounded-xl text-xs font-bold focus:border-tertiary-violet"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Miembros (Iniciales div. por coma)</label>
                <input
                  type="text"
                  placeholder="Ej. JD, ML, AR"
                  value={initials}
                  onChange={(e) => setInitials(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none p-2.5 rounded-xl text-xs font-semibold focus:border-tertiary-violet focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-primary-container-coral hover:bg-primary-coral text-white font-bold text-sm py-3 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Crear Proyecto
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
