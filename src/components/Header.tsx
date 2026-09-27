import React from 'react';
import { AssistantInfo, CallerRole } from '../types';
import { Server, Sparkles, UserCheck, Heart, Clock, ShieldCheck, Activity } from 'lucide-react';

interface HeaderProps {
  assistant: AssistantInfo | null;
  callerRole: CallerRole;
  onRoleChange: (role: CallerRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  assistant,
  callerRole,
  onRoleChange,
  activeTab,
  onTabChange,
}) => {
  const assistantName = assistant?.name || 'Íris';
  const greeting = assistant?.currentGreeting || 'Olá';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top bar with creator credit & holiday if any */}
      <div className="bg-gradient-to-r from-violet-900/60 via-purple-900/50 to-slate-900 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20">
        <div className="flex items-center gap-2 text-purple-200">
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
          <span>Criada com carinho por <strong>Eloizio (21 987648727)</strong> • Grupo Eloizio (21 996134073)</span>
        </div>
        <div className="flex items-center gap-3">
          {assistant?.holiday && (
            <span className="bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-pink-400" />
              {assistant.holiday}
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-violet-400" />
            {greeting} • Horário Brasil
          </span>
        </div>
      </div>

      {/* Main navigation & assistant badge */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Branding & Avatar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/30">
              <span className="text-xl font-bold tracking-tight text-white font-serif">
                {assistantName[0]}
              </span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online no VPS" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent">
                {assistantName}
              </h1>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                Hostinger VPS & MapOS AI
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>Doce, meiga, direta e especialista em DevOps & Mecânica</span>
            </p>
          </div>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1 px-2 text-slate-400">
            <UserCheck className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Perfil:</span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => onRoleChange('assinante')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                callerRole === 'assinante'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Dono da Oficina/DevOps: acesso a senhas, custos, root e infra Hostinger"
            >
              Assinante [Dono]
            </button>
            <button
              onClick={() => onRoleChange('tecnico')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                callerRole === 'tecnico'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Colaborador Técnico: procedimentos técnicos, peças e comandos sem preços internos"
            >
              Colaborador [Técnico]
            </button>
            <button
              onClick={() => onRoleChange('cliente_final')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                callerRole === 'cliente_final'
                  ? 'bg-pink-600 text-white shadow-sm shadow-pink-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Cliente Final: diagnóstico amigável, prazos e garantia"
            >
              Cliente Final
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-slate-950/60 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 scrollbar-none text-xs">
          <button
            onClick={() => onTabChange('chat')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Chat com {assistantName}
          </button>

          <button
            onClick={() => onTabChange('vps-metrics')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap font-medium transition-all ${
              activeTab === 'vps-metrics'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-pink-400" />
            Métricas VPS (Recharts)
          </button>

          <button
            onClick={() => onTabChange('hostinger-studio')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap font-medium transition-all ${
              activeTab === 'hostinger-studio'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-blue-400" />
            Hostinger VPS Code Studio
          </button>

          <button
            onClick={() => onTabChange('vps-troubleshoot')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap font-medium transition-all ${
              activeTab === 'vps-troubleshoot'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Diagnóstico VPS & Logs
          </button>

          <button
            onClick={() => onTabChange('visual-diagnosis')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap font-medium transition-all ${
              activeTab === 'visual-diagnosis'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Diagnóstico de Máquinas & Peças
          </button>

          <button
            onClick={() => onTabChange('mapos-hub')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap font-medium transition-all ${
              activeTab === 'mapos-hub'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            MapOS Hub & Assinaturas
          </button>
        </div>
      </div>
    </header>
  );
};
