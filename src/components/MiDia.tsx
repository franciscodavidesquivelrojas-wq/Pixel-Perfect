import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, ChevronRight, Folder, MoreHorizontal, MessageSquare, Clock, CheckCircle2, CloudLightning } from 'lucide-react';
import { Activity, Project } from '../types';

interface MiDiaProps {
  activities: Activity[];
  projects: Project[];
  setScreen: (screen: 'mi-espacio' | 'mi-dia' | 'proyectos' | 'clientes', transition?: 'none' | 'push' | 'push_back') => void;
  onSaveInFolder: (activityId: string, folderName: string) => void;
  onAddActivityWithDetails: (activity: Omit<Activity, 'id'>) => void;
  interruptedSession: { title: string; seconds: number } | null;
  onConsumeInterruptedSession: () => void;
}

export default function MiDia({ 
  activities, 
  projects, 
  setScreen, 
  onSaveInFolder, 
  onAddActivityWithDetails,
  interruptedSession,
  onConsumeInterruptedSession
}: MiDiaProps) {
  // Initialize from 0 seconds, paused until clicked
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null);

  // Timer side-effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Handle format HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  // Dynamic percentage of a 1-hour (3600 seconds) target session completed
  const percentage = Math.min(100, (seconds / 3600) * 100);
  
  // Interpolate color from white (#FFFFFF) to a warm rich orange (#f26e56)
  const factor = percentage / 100;
  const red = 255;
  const green = Math.round(255 - (255 - 110) * factor);
  const blue = Math.round(255 - (255 - 86) * factor);
  const dynamicStrokeColor = `rgb(${red}, ${green}, ${blue})`;

  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-28 animate-fade-in relative">
      
      {/* Page Header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Tu día de un vistazo
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Aquí tienes un resumen de en qué has invertido tu tiempo hoy.
        </p>
      </div>

      {/* Ticking Time Tracking Card (SESIÓN EN CURSO) */}
      <div className="bg-white border border-slate-200/90 shadow-md shadow-slate-100 rounded-3xl p-6 mb-8 text-center relative overflow-hidden">
        {/* Ambient top tag */}
        <span className="block text-xs font-bold text-amber-700 tracking-wider uppercase mb-1">
          SESIÓN EN CURSO
        </span>
        <h2 className="text-lg font-bold text-slate-900 mb-6">
          Diseño UI Proyecto X
        </h2>

        {/* Choice box for starting method */}
        {interruptedSession && seconds === 0 && !isRunning && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 space-y-3 mx-auto max-w-sm animate-scale-up">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
              ¿Cómo deseas iniciar tu sesión hoy?
            </span>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSeconds(0);
                  setIsRunning(true);
                }}
                className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                ⏱ Empezar nuevo proyecto (desde 0)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSeconds(interruptedSession.seconds); // 9912 (2h 45m)
                  setIsRunning(true);
                  onConsumeInterruptedSession(); // clears in App.tsx
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                🔄 Continuar sesión interrumpida (2h 45m)
              </button>
            </div>
          </div>
        )}

        {/* Circular Countdown Progress SVG */}
        <div className="relative flex justify-center items-center mb-6">
          <svg
            className="w-48 h-48 drop-shadow-sm"
            viewBox="0 0 160 160"
          >
            {/* Background Grey Ring */}
            <circle
              className="text-slate-100"
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Accent Coral Progress Ring */}
            <circle
              className="progress-ring__circle"
              stroke={dynamicStrokeColor}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ 
                strokeDashoffset,
                transition: 'stroke-dashoffset 0.3s ease, stroke 0.4s ease'
              }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Centered Ticking Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-black text-slate-900 tracking-tight">
              {formatTime(seconds)}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
              Tiempo Total
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setIsRunning(false);
              setShowConfirmModal(true);
            }}
            className="bg-primary-container-coral hover:bg-primary-coral text-white font-bold text-sm py-3 px-8 rounded-full shadow-md shadow-primary-container-coral/20 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Square className="w-4 h-4 fill-current stroke-0" />
            Finalizar
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-11 h-11 border-2 border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 flex items-center justify-center rounded-full transition-all cursor-pointer active:scale-95"
            title={isRunning ? 'Pausar' : 'Reanudar'}
          >
            {isRunning ? (
              <Pause className="w-5 h-5 fill-current stroke-0" />
            ) : (
              <Play className="w-5 h-5 fill-current stroke-0" />
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal / Full slide-up container */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">¿Guardar sesión y cerrar el día?</h3>
              <p className="text-xs text-slate-500">
                Guardarás <strong className="text-slate-800">{formatTime(seconds)}</strong> en la bitácora unificada de actividades.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRunning(true);
                  setShowConfirmModal(false);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Continuar Trabajando
              </button>
              <button
                onClick={() => {
                  // Add this elapsed session to list
                  onAddActivityWithDetails({
                    title: 'Diseño UI Proyecto X',
                    time: '14:00 - 16:45',
                    duration: '2h 45m',
                    minutes: 165,
                    savedIn: 'Proyecto X',
                    type: 'figma'
                  });
                  setShowConfirmModal(false);
                  setScreen('mi-espacio', 'push_back');
                }}
                className="flex-1 bg-primary-coral hover:bg-red-800 text-white font-bold py-3 rounded-2xl text-xs transition-colors shadow-md shadow-primary-coral/20 cursor-pointer"
              >
                Confirmar Día
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline activities header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Actividades Registradas
        </h3>
        <span className="text-xs text-secondary-teal bg-secondary-container-teal/40 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> 3h 00m acumulado hoy
        </span>
      </div>

      {/* Activities list/timeline */}
      <div className="space-y-4 border-l-2 border-slate-100 pl-4 ml-2">
        {activities.map((act) => (
          <div key={act.id} className="relative group">
            {/* Timeline indicator node */}
            <div className="absolute -left-7 top-4 w-4.5 h-4.5 rounded-full border-4 border-white bg-slate-300 group-hover:bg-primary-container-coral group-hover:scale-110 transition-all shadow-sm"></div>

            <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 gap-3 transition-shadow hover:shadow-md">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{act.title}</h4>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5 capitalize flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
                    {act.type} • {act.time} ({act.duration})
                  </p>
                </div>
                
                {act.type === 'figma' && (
                  <span className="p-1 px-2 rounded bg-orange-100 text-orange-600 font-extrabold text-[9px] uppercase tracking-wide">
                    Design
                  </span>
                )}
                {act.type === 'slack' && (
                  <span className="p-1 px-2 rounded bg-indigo-100 text-indigo-600 font-extrabold text-[9px] uppercase tracking-wide">
                    Comm
                  </span>
                )}
              </div>

              {/* SAVE DIRECTORY SELECTOR CONTAINER */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                {act.savedIn ? (
                  <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-3 py-1.5 text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.2px]" />
                      Guardado en <strong className="font-bold">'{act.savedIn}'</strong>
                    </span>
                    <button 
                      onClick={() => onSaveInFolder(act.id, '')} 
                      className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2">¿Dónde guardamos esto?</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSaveInFolder(act.id, 'Proyecto X')}
                        className="bg-sky-50 text-sky-800 hover:bg-sky-100 px-3 py-1.5 rounded-lg text-xs font-bold leading-none flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Folder className="w-3.5 h-3.5 fill-current opacity-80" />
                        Proyecto X
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdownId(showDropdownId === act.id ? null : act.id)}
                          className="p-1.5 border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {showDropdownId === act.id && (
                          <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 shadow-xl rounded-xl p-1 w-44 z-20 animate-scale-up">
                            <span className="block px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase">Proyectos Activos</span>
                            {projects.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  onSaveInFolder(act.id, p.name);
                                  setShowDropdownId(null);
                                }}
                                className="w-full text-left font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 block transition-colors"
                              >
                                {p.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
