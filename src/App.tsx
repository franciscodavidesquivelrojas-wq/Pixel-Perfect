/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_PROJECTS, INITIAL_ACTIVITIES, INITIAL_FEEDBACKS, INITIAL_ALERTS, INITIAL_FINANCIALS } from './data';
import { Project, Activity, Feedback, AlertItem, ClientFinancialRow } from './types';
import MiEspacio from './components/MiEspacio';
import MiDia from './components/MiDia';
import MisProyectos from './components/MisProyectos';
import Clientes from './components/Clientes';
import BottomNav from './components/BottomNav';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'mi-espacio' | 'mi-dia' | 'proyectos' | 'clientes'>('mi-espacio');
  const [transitionDirection, setTransitionDirection] = useState<'none' | 'push' | 'push_back'>('none');

  // Shared state engines
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [financials, setFinancials] = useState<ClientFinancialRow[]>(INITIAL_FINANCIALS);

  // Active / Interrupted session state
  const [interruptedSession, setInterruptedSession] = useState<{ title: string; seconds: number } | null>({
    title: 'Diseño UI Proyecto X',
    seconds: 9912, // 2h 45m
  });

  // Set the screen with specified transition
  const handleSetScreen = (
    screen: 'mi-espacio' | 'mi-dia' | 'proyectos' | 'clientes',
    direction: 'none' | 'push' | 'push_back' = 'none'
  ) => {
    setTransitionDirection(direction);
    setCurrentScreen(screen);
  };

  // Actions handlers
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
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Nav Container */}
      <BottomNav currentScreen={currentScreen} setScreen={handleSetScreen} />
    </div>
  );
}

