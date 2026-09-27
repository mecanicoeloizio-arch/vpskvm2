import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  RotateCw,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Server,
  ChevronDown,
  ChevronUp,
  Shield,
  Layers,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

export interface SshLogItem {
  id: string;
  timestamp: string;
  command: string;
  user: string;
  host: string;
  category: 'deploy' | 'docker' | 'nginx' | 'firewall' | 'system' | 'custom';
  status: 'success' | 'failed' | 'warning';
  output: string;
  durationMs: number;
}

interface SshCommandAuditLogProps {
  vpsIp?: string;
}

export const SshCommandAuditLog: React.FC<SshCommandAuditLogProps> = ({
  vpsIp = '185.193.64.120',
}) => {
  const [logs, setLogs] = useState<SshLogItem[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Fetch persisted logs on mount
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/vps/ssh-logs');
      if (!res.ok) return;
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching SSH logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Execute and record an SSH command
  const executeCommand = async (cmdToRun?: string) => {
    const cmd = (cmdToRun || commandInput).trim();
    if (!cmd) return;

    setIsRunning(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/vps/ssh-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          host: vpsIp,
          user: 'root',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao executar comando.');

      if (data.log) {
        setLogs((prev) => [data.log, ...prev]);
        setExpandedLogId(data.log.id);
        setFeedbackMsg(`Comando "${cmd}" executado e gravado no log persistente.`);
        setCommandInput('');
      }
    } catch (err: any) {
      setFeedbackMsg(`Erro: ${err.message}`);
    } finally {
      setIsRunning(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Clear all logs
  const clearLogs = async () => {
    if (!confirm('Deseja realmente limpar todo o histórico de comandos SSH persistido?')) return;
    try {
      await fetch('/api/vps/ssh-logs', { method: 'DELETE' });
      setLogs([]);
      setFeedbackMsg('Histórico de comandos limpo com sucesso.');
    } catch (err: any) {
      setFeedbackMsg(`Erro: ${err.message}`);
    }
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export logs to JSON
  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ssh-audit-logs-${vpsIp}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick preset commands for Hostinger VPS
  const quickCommands = [
    { label: 'docker compose ps', cmd: 'docker compose ps' },
    { label: 'nginx -t', cmd: 'nginx -t' },
    { label: 'ufw status', cmd: 'sudo ufw status verbose' },
    { label: 'free -h (RAM)', cmd: 'free -h' },
    { label: 'df -h (Disco)', cmd: 'df -h' },
    { label: 'systemctl status nginx', cmd: 'systemctl status nginx' },
  ];

  // Filtering
  const filteredLogs = logs.filter((item) => {
    const matchesSearch =
      item.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.output.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'docker':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'nginx':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'firewall':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'deploy':
        return 'bg-pink-500/10 text-pink-300 border-pink-500/30';
      case 'system':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              Histórico Persistente de Comandos SSH (Audit & Debug)
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
              Persistência Ativa
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro detalhado de cada comando executado no VPS Hostinger ({vpsIp}), com tempo de execução, saída do terminal e status para auditoria técnica.
          </p>
        </div>

        {/* Action Buttons: Export & Clear */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={exportLogs}
            disabled={logs.length === 0}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title="Exportar logs em formato JSON"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title="Limpar histórico persistido"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Interactive Terminal Runner */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-mono">root@{vpsIp}:~#</span>
            <span>Executar e Auditar Comando SSH</span>
          </span>
          <span className="text-[11px] text-slate-500">Hostinger KVM Shell</span>
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCommand();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Digite um comando SSH (ex: docker compose ps, nginx -t, ufw status)..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isRunning || !commandInput.trim()}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 shadow-md shadow-purple-600/20"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Executar no VPS</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Command Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 mr-1">Atalhos rápidos:</span>
          {quickCommands.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => executeCommand(q.cmd)}
              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-purple-300 font-mono text-[11px] border border-slate-800 transition-colors"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por comando ou saída..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 hidden sm:inline" />
          {[
            { id: 'all', label: 'Todos' },
            { id: 'docker', label: 'Docker' },
            { id: 'nginx', label: 'Nginx' },
            { id: 'firewall', label: 'Firewall' },
            { id: 'deploy', label: 'Deploy/SSL' },
            { id: 'system', label: 'Sistema' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Entries List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60">
            <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold text-slate-400">Nenhum comando encontrado no histórico.</p>
            <p className="text-[11px] text-slate-500">Execute um comando acima para iniciar o registro de auditoria.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden transition-all text-xs"
              >
                {/* Log Header Row */}
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/60 select-none"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${getCategoryBadge(
                        log.category
                      )}`}
                    >
                      {log.category}
                    </span>
                    <span className="font-mono text-emerald-300 font-semibold truncate">
                      {log.command}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 flex-shrink-0">
                    <span className="text-[11px] font-mono hidden md:inline text-slate-500">
                      {log.durationMs}ms
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      {log.timestamp}
                    </span>
                    <div className="text-slate-500 hover:text-slate-300 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Output and Execution Controls */}
                {isExpanded && (
                  <div className="p-3.5 bg-slate-950 border-t border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>Usuário: <strong className="text-slate-200 font-mono">{log.user}</strong></span>
                        <span>•</span>
                        <span>Host: <strong className="text-slate-200 font-mono">{log.host}</strong></span>
                        <span>•</span>
                        <span>Status: <strong className="text-emerald-400 font-semibold uppercase">{log.status}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(log.command, `${log.id}-cmd`);
                          }}
                          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === `${log.id}-cmd` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Comando Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar Comando</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(log.output, `${log.id}-out`);
                          }}
                          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === `${log.id}-out` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Saída Copiada!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar Saída</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            executeCommand(log.command);
                          }}
                          className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 flex items-center gap-1 transition-colors"
                          title="Re-executar comando no VPS"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Re-executar</span>
                        </button>
                      </div>
                    </div>

                    {/* Output Console Box */}
                    <div className="rounded-lg bg-black/60 border border-slate-800 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed">
                      <div className="text-slate-500 mb-1">$ {log.command}</div>
                      <pre className="text-emerald-300 whitespace-pre-wrap selection:bg-purple-600">
                        {log.output}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Total de Comandos Registrados: <strong>{logs.length}</strong></span>
        <span className="text-purple-400 font-medium">Auditoria em conformidade com o ambiente Hostinger VPS</span>
      </div>
    </div>
  );
};
