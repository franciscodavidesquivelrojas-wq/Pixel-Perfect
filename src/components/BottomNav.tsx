import React from 'react';
import { LayoutGrid, Calendar, FolderKanban, Users2 } from 'lucide-react';

interface BottomNavProps {
  currentScreen: 'mi-espacio' | 'mi-dia' | 'proyectos' | 'clientes';
  setScreen: (screen: 'mi-espacio' | 'mi-dia' | 'proyectos' | 'clientes', transition?: 'none' | 'push' | 'push_back') => void;
}

export default function BottomNav({ currentScreen, setScreen }: BottomNavProps) {
  const tabs = [
    { id: 'mi-espacio', label: 'Mi Espacio', icon: LayoutGrid },
    { id: 'mi-dia', label: 'Mi Día', icon: Calendar },
    { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
    { id: 'clientes', label: 'Clientes', icon: Users2 },
  ] as const;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-lg shadow-slate-200/40 rounded-full py-2 px-3 flex items-center justify-around gap-2 w-[calc(100%-2rem)] max-w-md z-40 transition-all">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentScreen === tab.id;
        
        return (
          <a
            key={tab.id}
            id={`nav-link-${tab.id}`}
            onClick={(e) => {
              e.preventDefault();
              setScreen(tab.id, 'none');
            }}
            href={`#${tab.id}`}
            className={`flex flex-col sm:flex-row items-center gap-1.5 py-2 px-4 rounded-full text-xs font-semibold select-none cursor-pointer transition-all duration-300 ${
              isActive
                ? 'bg-secondary-container-teal/40 text-secondary-teal scale-105 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            <span className="tracking-wide">{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
