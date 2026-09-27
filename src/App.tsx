import React, { useState, useEffect } from 'react';
import { AssistantInfo, CallerRole } from './types';
import { Header } from './components/Header';
import { ChatTab } from './components/ChatTab';
import { HostingerStudio } from './components/HostingerStudio';
import { VisualDiagnosisTab } from './components/VisualDiagnosisTab';
import { MapOSHubTab } from './components/MapOSHubTab';
import { VpsTroubleshooterTab } from './components/VpsTroubleshooterTab';
import { VpsMetricsDashboard } from './components/VpsMetricsDashboard';
import { Heart, ShieldCheck, Terminal, Server, Sparkles } from 'lucide-react';

export default function App() {
  const [assistant, setAssistant] = useState<AssistantInfo | null>(null);
  const [callerRole, setCallerRole] = useState<CallerRole>('assinante');
  const [activeTab, setActiveTab] = useState<string>('chat');

  useEffect(() => {
    fetch('/api/system/assistant-info')
      .then((res) => res.json())
      .then((data) => setAssistant(data))
      .catch((err) => console.error('Error fetching assistant info:', err));
  }, []);

  const assistantName = assistant?.name || 'Íris';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <Header
        assistant={assistant}
        callerRole={callerRole}
        onRoleChange={setCallerRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'chat' && (
          <ChatTab assistant={assistant} callerRole={callerRole} />
        )}

        {activeTab === 'vps-metrics' && (
          <VpsMetricsDashboard />
        )}

        {activeTab === 'hostinger-studio' && (
          <HostingerStudio />
        )}

        {activeTab === 'vps-troubleshoot' && (
          <VpsTroubleshooterTab />
        )}

        {activeTab === 'visual-diagnosis' && (
          <VisualDiagnosisTab />
        )}

        {activeTab === 'mapos-hub' && (
          <MapOSHubTab callerRole={callerRole} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              {assistantName} • Hostinger VPS & MapOS AI Assistant
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-purple-400 font-medium">Ubuntu 22.04/24.04 KVM Ready</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
              Desenvolvido por <strong>Eloizio (21 987648727)</strong>
            </span>
            <span>•</span>
            <span>Grupo Eloizio (21 996134073)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
