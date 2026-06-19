import React, { useState } from 'react';
import { LogIn, Sparkles, User, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { name: string; email: string; avatar: string; mode: 'google' | 'demo' }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [emailInput, setEmailInput] = useState('');
  const [showAccounts, setShowAccounts] = useState(false);
  const [customEmailMode, setCustomEmailMode] = useState(false);

  // Suggested user emails based on user data
  const suggestedEmails = [
    { name: 'Lucía Esquivel', email: 'franciscodavidesquivelrojas@gmail.com', avatar: 'LE' },
    { name: 'Lucía Creative', email: 'lucia.perfect@gmail.com', avatar: 'LC' }
  ];

  const handleDemoClick = () => {
    onLogin({
      name: 'Lucía (Modo Demo)',
      email: 'demo.creative@pixelperfect.cl',
      avatar: 'LD',
      mode: 'demo',
    });
  };

  const handleGoogleAccountClick = (account: typeof suggestedEmails[0]) => {
    onLogin({
      name: account.name,
      email: account.email,
      avatar: account.avatar,
      mode: 'google',
    });
  };

  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    const nameMatch = emailInput.split('@')[0];
    const capitalized = nameMatch.charAt(0).toUpperCase() + nameMatch.slice(1);
    onLogin({
      name: capitalized,
      email: emailInput,
      avatar: capitalized.substring(0, 2).toUpperCase(),
      mode: 'google',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary-container-coral/20 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-secondary-container-teal/20 blur-3xl -z-10"></div>

      {/* Top Header Logo */}
      <div className="flex flex-col items-center justify-center pt-4">
        {/* PixelPerfect Compound Mosaic Logo */}
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200/50 shadow-sm animate-fade-in">
          <div className="grid grid-cols-3 gap-[2px] w-9 h-9 p-1 bg-gradient-to-tr from-primary-coral to-primary-container-coral rounded-xl shadow-inner shadow-black/10">
            <div className="bg-white/95 rounded-[2px]" />
            <div className="bg-white/95 rounded-[2px]" />
            <div className="bg-secondary-container-teal rounded-[2px] animate-pulse" />
            <div className="bg-white/95 rounded-[2px]" />
            <div className="bg-slate-900 rounded-[2px]" />
            <div className="bg-white/95 rounded-[2px]" />
            <div className="bg-primary-container-coral rounded-[2px]" />
            <div className="bg-white/95 rounded-[2px]" />
            <div className="bg-white/95 rounded-[2px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black text-xl tracking-tight text-slate-800 leading-none">
              Pixel<span className="text-secondary-teal">Perfect</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
              Finanzas Creativas
            </span>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-15">
        <div className="bg-white py-10 px-6 sm:px-10 shadow-xl shadow-slate-200/50 border border-slate-150 rounded-3xl space-y-8 animate-scale-up">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Diseño de Interfaz & Balance Financiero
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Visualiza en tiempo real el valor neto de tus entregas y la Tarifa Efectiva Real de tu estudio de diseño gráfico.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* GOOGLE SIGN IN SIMULATION BUTTON */}
            {!showAccounts && !customEmailMode ? (
              <button
                type="button"
                onClick={() => setShowAccounts(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs tracking-wider uppercase py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer hover:shadow-lg hover:shadow-slate-900/10 active:scale-98"
              >
                {/* Simulated Google Logo Icon */}
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Iniciar Sesión con Google
              </button>
            ) : showAccounts ? (
              <div className="space-y-3 bg-slate-50 border border-slate-150 rounded-2xl p-4 animate-scale-up">
                <span className="block text-[10px] font-black text-slate-400 tracking-wider uppercase">
                  Selecciona una cuenta de Google
                </span>
                
                <div className="space-y-2">
                  {suggestedEmails.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => handleGoogleAccountClick(account)}
                      className="w-full bg-white hover:bg-slate-100 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-left transition-all hover:translate-x-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary-teal to-secondary-container-teal flex items-center justify-center font-black text-white text-xs">
                          {account.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{account.name}</p>
                          <p className="text-[10px] font-medium text-slate-500 font-mono">{account.email}</p>
                        </div>
                      </div>
                      <LogIn className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 text-[11px]">
                  <button
                    onClick={() => {
                      setCustomEmailMode(true);
                      setShowAccounts(false);
                    }}
                    className="text-secondary-teal font-extrabold hover:underline"
                  >
                    Usar otra cuenta diferente
                  </button>
                  <button
                    onClick={() => setShowAccounts(false)}
                    className="text-slate-400 font-bold hover:underline"
                  >
                    Volver
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCustomEmailSubmit} className="space-y-3 animate-scale-up">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">
                    Introduce tu correo de Google
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-secondary-teal transition-all font-mono"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomEmailMode(false);
                      setShowAccounts(true);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Cuentas guardadas
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-secondary-teal hover:opacity-90 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    Establecer <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* DIVIDER */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black tracking-wider text-slate-400 uppercase">Ó</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* ONE-CLICK DEMO BUTTON */}
            <button
              onClick={handleDemoClick}
              type="button"
              className="w-full bg-gradient-to-tr from-primary-coral to-primary-container-coral hover:opacity-95 text-white font-black text-xs tracking-wider uppercase py-4 px-4 rounded-xl flex items-center justify-center gap-2 border-none transition-all shadow-md shadow-primary-container-coral/20 cursor-pointer hover:shadow-lg active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-white p-0.5 bg-white/20 rounded-full animate-bounce" />
              Versión Demo "One-Click"
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal text-center bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Tus datos de producción quedarán almacenados de manera segura de manera local en el navegador (Zero-Serverless).</span>
          </p>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[10px] font-bold text-slate-400 tracking-wider uppercase pt-4">
        © 2026 PixelPerfect Studio. Hecho en Chile para freelancers.
      </div>

    </div>
  );
}
