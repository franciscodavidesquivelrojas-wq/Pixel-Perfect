/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_PROJECTS, INITIAL_ACTIVITIES, INITIAL_FEEDBACKS, INITIAL_ALERTS, INITIAL_FINANCIALS } from './data';
import { Project, Activity, Feedback, AlertItem, ClientFinancialRow } from './types';
import MiEspacio from './components/MiEspacio';
import MiDia from './components/MiDia';
import MisProyectos from './components/MisProyectos';
import Clientes from './components/Clientes';
import BottomNav from './components/BottomNav';
import { Sparkles, Clock, FileDown, CheckCircle, Bell, RotateCcw, Trash2, X, AlertTriangle } from 'lucide-react';

export default function App() {
  // Authentication & Demo User State - Fixed for Lucía Castro exclusively
  const [user] = useState<{ name: string; email: string; avatar: string; mode: 'google' | 'demo' }>({
    name: 'Lucía Castro',
    email: 'lucia.creative@pixelperfect.cl',
    avatar: 'LC',
    mode: 'demo'
  });

  const [currentScreen, setCurrentScreen] = useState<'mi-espacio' | 'mi-dia' | 'proyectos' | 'clientes'>('mi-espacio');
  const [transitionDirection, setTransitionDirection] = useState<'none' | 'push' | 'push_back'>('none');

  // Shared state engines loaded from localStorage (or initial default)
  const [projects, setProjects] = useState<Project[]>(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const saved = localStorage.getItem(`pixel_${u.email}_projects`);
        if (saved) return JSON.parse(saved);
        return u.mode === 'demo' ? INITIAL_PROJECTS : [];
      } catch {
        return INITIAL_PROJECTS;
      }
    }
    const saved = localStorage.getItem('pixel_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const saved = localStorage.getItem(`pixel_${u.email}_activities`);
        if (saved) return JSON.parse(saved);
        return u.mode === 'demo' ? INITIAL_ACTIVITIES : [];
      } catch {
        return INITIAL_ACTIVITIES;
      }
    }
    const saved = localStorage.getItem('pixel_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const saved = localStorage.getItem(`pixel_${u.email}_feedbacks`);
        if (saved) return JSON.parse(saved);
        return u.mode === 'demo' ? INITIAL_FEEDBACKS : [];
      } catch {
        return INITIAL_FEEDBACKS;
      }
    }
    const saved = localStorage.getItem('pixel_feedbacks');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const saved = localStorage.getItem(`pixel_${u.email}_alerts`);
        if (saved) return JSON.parse(saved);
        return u.mode === 'demo' ? INITIAL_ALERTS : [];
      } catch {
        return INITIAL_ALERTS;
      }
    }
    const saved = localStorage.getItem('pixel_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [financials, setFinancials] = useState<ClientFinancialRow[]>(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const saved = localStorage.getItem(`pixel_${u.email}_financials`);
        if (saved) return JSON.parse(saved);
        return u.mode === 'demo' ? INITIAL_FINANCIALS : [];
      } catch {
        return INITIAL_FINANCIALS;
      }
    }
    const saved = localStorage.getItem('pixel_financials');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIALS;
  });

  // Active / Interrupted session state
  const [interruptedSession, setInterruptedSession] = useState<{ title: string; seconds: number } | null>(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const saved = localStorage.getItem(`pixel_${u.email}_interrupted_session`);
        if (saved) return JSON.parse(saved);
        return u.mode === 'demo' ? { title: 'Diseño UI Proyecto X', seconds: 9912 } : null;
      } catch {
        return null;
      }
    }
    const saved = localStorage.getItem('pixel_interrupted_session');
    try {
      return saved ? JSON.parse(saved) : { title: 'Diseño UI Proyecto X', seconds: 9912 };
    } catch {
      return { title: 'Diseño UI Proyecto X', seconds: 9912 };
    }
  });

  // Passive Activity Tracker State (Memory Timeline)
  const [showPassiveAssistant, setShowPassiveAssistant] = useState(false);

  // Confirmation state for returning all data to 0
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Synchronize dynamic states with physical localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('pixel_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pixel_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pixel_projects', JSON.stringify(projects));
    if (user) {
      localStorage.setItem(`pixel_${user.email}_projects`, JSON.stringify(projects));
    }
  }, [projects, user]);

  useEffect(() => {
    localStorage.setItem('pixel_activities', JSON.stringify(activities));
    if (user) {
      localStorage.setItem(`pixel_${user.email}_activities`, JSON.stringify(activities));
    }
  }, [activities, user]);

  useEffect(() => {
    localStorage.setItem('pixel_feedbacks', JSON.stringify(feedbacks));
    if (user) {
      localStorage.setItem(`pixel_${user.email}_feedbacks`, JSON.stringify(feedbacks));
    }
  }, [feedbacks, user]);

  useEffect(() => {
    localStorage.setItem('pixel_alerts', JSON.stringify(alerts));
    if (user) {
      localStorage.setItem(`pixel_${user.email}_alerts`, JSON.stringify(alerts));
    }
  }, [alerts, user]);

  useEffect(() => {
    localStorage.setItem('pixel_financials', JSON.stringify(financials));
    if (user) {
      localStorage.setItem(`pixel_${user.email}_financials`, JSON.stringify(financials));
    }
  }, [financials, user]);

  useEffect(() => {
    if (interruptedSession) {
      localStorage.setItem('pixel_interrupted_session', JSON.stringify(interruptedSession));
      if (user) {
        localStorage.setItem(`pixel_${user.email}_interrupted_session`, JSON.stringify(interruptedSession));
      }
    } else {
      localStorage.removeItem('pixel_interrupted_session');
      if (user) {
        localStorage.removeItem(`pixel_${user.email}_interrupted_session`);
      }
    }
  }, [interruptedSession, user]);

  // Passive Activity Assistant triggers (Time Machine Simulation)
  useEffect(() => {
    if (!user) return; // Only trigger if logged in

    // Delayed trigger (7 seconds) inside the applet
    const delayTimer = setTimeout(() => {
      const isHandled = localStorage.getItem('pixel_passive_handled');
      if (!isHandled) {
        setShowPassiveAssistant(true);
      }
    }, 7000);

    // Event listener when coming back to the tab
    const handleFocus = () => {
      const isHandled = localStorage.getItem('pixel_passive_handled');
      if (!isHandled) {
        setShowPassiveAssistant(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      clearTimeout(delayTimer);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Handlers

  const handleSetScreen = (
    screen: 'mi-espacio' | 'mi-dia' | 'proyectos' | 'clientes',
    direction: 'none' | 'push' | 'push_back' = 'none'
  ) => {
    setTransitionDirection(direction);
    setCurrentScreen(screen);
  };

  const handleAddProject = (newProj: Omit<Project, 'id'>) => {
    const id = `p-${Date.now()}`;
    setProjects((prev) => [...prev, { ...newProj, id }]);
  };

  const handleAddActivity = (title: string, duration: string) => {
    const id = `act-${Date.now()}`;
    const newAct: Activity = {
      id,
      title,
      time: '13:00 - 14:15',
      duration,
      minutes: 75,
      savedIn: null,
      type: 'other',
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleAddActivityWithDetails = (details: Omit<Activity, 'id'>) => {
    const id = `act-${Date.now()}`;
    setActivities((prev) => [{ ...details, id }, ...prev]);
  };

  const handleSaveInFolder = (activityId: string, folderName: string) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === activityId ? { ...act, savedIn: folderName || null } : act
      )
    );
  };

  const handleAddFeedback = (newF: Omit<Feedback, 'id'>) => {
    const id = `f-${Date.now()}`;
    
    if (newF.status === 'action') {
      const alertId = `a-${Date.now()}`;
      const newAlert: AlertItem = {
        id: alertId,
        client: newF.clientName,
        project: newF.project,
        description: newF.feedback,
        stage: 'Fase Inicial',
        status: 'Crítico',
        avatar: newF.avatar,
        avatarBg: newF.avatarBg,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    } else {
      setFeedbacks((prev) => [{ ...newF, id }, ...prev]);
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const handleIgnoreInterruptedSession = () => {
    setInterruptedSession(null);
  };

  const handleAssignInterruptedSession = () => {
    handleAddActivity('Diseño UI Proyecto X', '2h 45m');
    setInterruptedSession(null);
    handleSetScreen('mi-dia', 'push');
  };

  const handleConsumeInterruptedSession = () => {
    setInterruptedSession(null);
  };

  // Triggered when Lucía accepts the Passive tracking pop-up
  const handleAcceptPassiveAsisstant = () => {
    // Add 45 minutes activity to the workspace
    handleAddActivityWithDetails({
      title: 'Diseño Refinamiento Web (Asignado por Sensor Pasivo)',
      time: '11:15 - 12:00',
      duration: '45m',
      minutes: 45,
      savedIn: 'Figma',
      type: 'figma'
    });
    
    // Simulate updating hours on Nexus Cloud (c3 in financials)
    setFinancials(prev => prev.map(f => {
      if (f.id_cliente === 'c3') {
        return { ...f, horas_totales: f.horas_totales + 1 };
      }
      return f;
    }));

    setShowPassiveAssistant(false);
    localStorage.setItem('pixel_passive_handled', 'true');
    handleSetScreen('mi-dia', 'push');
  };

  // PDF/CSV Monthly Financial Report Generation (TER & KPIs Download)
  const handleExportCSVReport = () => {
    const csvContent = [
      ['Cliente', 'Proyecto', 'Esquema de Cobro', 'Horas Totales', 'Horas Administrativas', 'Tarifa Pactada', 'Costos Directos', 'Facturado Mes', 'Tarifa Efectiva Real (TER)', 'Impuesto Retenido (15.3%)', 'Utilidad Neta Real'].join(','),
      ...financials.map(f => {
        const sumHoras = f.horas_totales + f.horas_admin;
        const terVal = sumHoras > 0 ? Math.round((f.facturado_mes - f.costos_directos) / sumHoras) : 0;
        const taxVal = Math.round(f.facturado_mes * 0.153);
        const netVal = f.facturado_mes - f.costos_directos - taxVal;
        return [
          `"${f.nombre_cliente}"`,
          `"${f.nombre_proyecto}"`,
          f.esquema_cobro === 'por_hora' ? 'Por Hora' : 'Tarifa Fija',
          f.horas_totales,
          f.horas_admin,
          f.tarifa_pactada,
          f.costos_directos,
          f.facturado_mes,
          terVal,
          taxVal,
          netVal
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PixelPerfect_Reporte_Financiero_Estudio_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset all workspace data to 0 (clean arrays/empty data state)
  const handleResetAllData = () => {
    setProjects([]);
    setActivities([]);
    setFeedbacks([]);
    setAlerts([]);
    setFinancials([]);
    setInterruptedSession(null);
    setShowResetConfirmModal(false);
  };

  // Framer motion screen entry animations
  const slideVariants = {
    initial: (dir: 'none' | 'push' | 'push_back') => {
      if (dir === 'push') return { x: 300, opacity: 0 };
      if (dir === 'push_back') return { x: -300, opacity: 0 };
      return { opacity: 0 };
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1], // modern custom cubic bezier
      },
    },
    exit: (dir: 'none' | 'push' | 'push_back') => {
      if (dir === 'push') return { x: -300, opacity: 0 };
      if (dir === 'push_back') return { x: 300, opacity: 0 };
      return { opacity: 0 };
    },
  };

  return (
    <div className="min-h-screen bg-background-slate text-on-surface flex flex-col relative antialiased selection:bg-secondary-container-teal/60">
      
      {/* GLOBAL PERSISTENT HEADER (PixelPerfect Corporate Branding & Logo) */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-250/50 py-3.5 px-4 z-40 shadow-sm shadow-slate-100 mb-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Logo element visible globally in all views */}
          <div className="flex items-center gap-2.5">
            <div className="grid grid-cols-3 gap-[1px] w-7.5 h-7.5 p-1 bg-gradient-to-tr from-primary-coral to-primary-container-coral rounded-lg shadow-sm shadow-black/5">
              <div className="bg-white/95 rounded-[1.5px]" />
              <div className="bg-white/95 rounded-[1.5px]" />
              <div className="bg-secondary-container-teal rounded-[1.5px]" />
              <div className="bg-white/95 rounded-[1.5px]" />
              <div className="bg-slate-900 rounded-[1.5px]" />
              <div className="bg-white/95 rounded-[1.5px]" />
              <div className="bg-primary-container-coral rounded-[1.5px]" />
              <div className="bg-white/95 rounded-[1.5px]" />
              <div className="bg-white/95 rounded-[1.5px]" />
            </div>
            
            <div className="flex flex-col">
              <span className="font-sans font-black text-base tracking-tight text-slate-800 leading-none">
                Pixel<span className="text-secondary-teal">Perfect</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
                Estudio de Diseño
              </span>
            </div>
          </div>

          {/* User profile state & logout buttons */}
          <div className="flex items-center gap-3">
            {/* Quick Export Monthly button on top-header */}
            <button
              onClick={handleExportCSVReport}
              title="Exportar Reporte Mensual (CSV)"
              className="hidden sm:flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold text-[10px] uppercase tracking-wide py-1.5 px-2.5 rounded-lg transition-all cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-secondary-teal" /> Exportar Reporte
            </button>

            {/* Volver a 0 (Reiniciar Datos de Base) button */}
            <button
              onClick={() => setShowResetConfirmModal(true)}
              title="Volver a 0 todos los datos (Reiniciar Workspace)"
              className="flex items-center gap-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200/60 text-slate-700 font-bold text-[10px] uppercase tracking-wide py-1.5 px-2.5 rounded-lg transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-500 animate-hover-spin" /> <span>Volver a 0</span>
            </button>

            {/* Profile pills & info */}
            <div className="flex items-center gap-2.5 bg-slate-100/90 hover:bg-slate-200/50 p-1.5 pr-3.5 rounded-full transition-all border border-slate-205">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-coral to-primary-container-coral flex items-center justify-center font-black text-white text-[10px] shadow-sm">
                {user.avatar}
              </div>
              
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black text-slate-800 leading-tight">
                  {user.name}
                </span>
                <span className="text-[8px] font-semibold text-secondary-teal leading-none tracking-tight uppercase mt-0.5">
                  Directora Creativa
                </span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Scrollable primary container */}
      <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-2">
        <AnimatePresence mode="wait" custom={transitionDirection}>
          <motion.div
            key={currentScreen}
            custom={transitionDirection}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
          >
            {currentScreen === 'mi-espacio' && (
              <MiEspacio
                projects={projects}
                setScreen={handleSetScreen}
                onAddActivity={handleAddActivity}
                financials={financials}
                interruptedSession={interruptedSession}
                onIgnoreInterruptedSession={handleIgnoreInterruptedSession}
                onAssignInterruptedSession={handleAssignInterruptedSession}
                onExportCSVReport={handleExportCSVReport}
              />
            )}

            {currentScreen === 'mi-dia' && (
              <MiDia
                activities={activities}
                projects={projects}
                setScreen={handleSetScreen}
                onSaveInFolder={handleSaveInFolder}
                onAddActivityWithDetails={handleAddActivityWithDetails}
                interruptedSession={interruptedSession}
                onConsumeInterruptedSession={handleConsumeInterruptedSession}
              />
            )}

            {currentScreen === 'proyectos' && (
              <MisProyectos
                projects={projects}
                onAddProject={handleAddProject}
                setScreen={handleSetScreen}
              />
            )}

            {currentScreen === 'clientes' && (
              <Clientes
                alerts={alerts}
                feedbacks={feedbacks}
                onAddFeedback={handleAddFeedback}
                onResolveAlert={handleResolveAlert}
                setScreen={handleSetScreen}
                financials={financials}
                setFinancials={setFinancials}
                onExportCSVReport={handleExportCSVReport}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* PASSIVE TIMELINE ASSISTANT MODAL OVERLAY (Sensor Simulation) */}
      {showPassiveAssistant && (
        <div className="fixed bottom-24 right-4 max-w-sm bg-white border border-slate-200 shadow-2xl rounded-3xl p-5 z-45 animate-bounce-in ring-4 ring-[#62fae3]/25">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary-teal to-secondary-container-teal text-white flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                  Sensor Pasivo <Sparkles className="w-3.5 h-3.5 text-secondary-teal animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Asistente de Tiempo Olvidado</p>
              </div>
              <button
                onClick={() => {
                  setShowPassiveAssistant(false);
                  localStorage.setItem('pixel_passive_handled', 'true');
                }}
                className="ml-auto text-slate-400 hover:text-slate-605 text-xs font-bold font-mono px-1.5 py-0.5 hover:bg-slate-100 rounded"
              >
                ×
              </button>
            </div>

            <p className="text-xs font-sans text-slate-650 leading-relaxed">
              Detectamos que estuviste inactiva en el navegador durante <strong className="text-slate-900 font-extrabold font-sans">45 minutos</strong> mientras diseñabas. ¿Deseas guardar y asignar estos 45 minutos al proyecto estrella <strong className="text-slate-900 font-bold">"Nexus Cloud"</strong> ahora?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPassiveAssistant(false);
                  localStorage.setItem('pixel_passive_handled', 'true');
                }}
                className="flex-1 py-2 text-center text-[10px] font-black text-slate-500 hover:bg-slate-100 bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                Ignorar
              </button>
              <button
                onClick={handleAcceptPassiveAsisstant}
                className="flex-1 py-2 text-center text-[10px] font-black bg-gradient-to-tr from-secondary-teal to-teal-500 text-white rounded-xl shadow-md cursor-pointer transition-all active:scale-95 hover:opacity-95"
              >
                Sí, asignar 45m
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM REINICIAR WORKSPACE / VOLVER A 0 CONFIRMATION MODAL */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-150 space-y-5 animate-scale-up">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-rose-600 animate-bounce" />
              </div>
              <h3 className="text-lg font-black text-slate-800 leading-tight">
                ¿Volver a cero en todos los datos?
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Esta acción limpiará por completo las métricas del dashboard. Se eliminarán de forma <strong className="text-rose-600">irreversible</strong> todos los proyectos estimulados, tus reportes de horas de hoy, los registros de clientes cargados por CSV y los feedbacks activos.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleResetAllData}
                className="w-full bg-gradient-to-tr from-rose-550 to-red-600 text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-500/20 transition-all hover:opacity-95 active:scale-98"
              >
                <Trash2 className="w-4 h-4" /> Sí, reiniciar datos a 0
              </button>
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancelar y conservar datos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav Container */}
      <BottomNav currentScreen={currentScreen} setScreen={handleSetScreen} />
    </div>
  );
}


