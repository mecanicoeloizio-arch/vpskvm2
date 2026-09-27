import React, { useState } from 'react';
import { SshCommandAuditLog } from './SshCommandAuditLog';
import { DeploymentProgressBar } from './DeploymentProgressBar';
import {
  Server,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  Shield,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HardDrive,
  History,
  Code2,
  Rocket,
} from 'lucide-react';

export const HostingerStudio: React.FC = () => {
  const [studioTab, setStudioTab] = useState<'generator' | 'ssh-audit'>('generator');
  const [selectedStack, setSelectedStack] = useState<string>('mapos-docker');
  const [domain, setDomain] = useState('oficina.seusite.com.br');
  const [vpsIp, setVpsIp] = useState('185.193.64.120');
  const [dbName, setDbName] = useState('mapos_producao');
  const [dbUser, setDbUser] = useState('mapos_user');
  const [dbPass, setDbPass] = useState('SenhaForteEloizio@2025');
  const [appPort, setAppPort] = useState('8080');
  const [enableSwap, setEnableSwap] = useState(true);
  const [enableFirewall, setEnableFirewall] = useState(true);
  const [customNotes, setCustomNotes] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  const stacks = [
    {
      id: 'mapos-docker',
      name: 'MapOS Oficial Docker + Nginx SSL',
      desc: 'Stack completa containerizada com Docker, MariaDB 10.11, Nginx e Certbot SSL automático.',
      badge: 'Recomendado Hostinger',
      color: 'border-purple-500 bg-purple-500/10 text-purple-300',
    },
    {
      id: 'mapos-lamp',
      name: 'MapOS Nativo (PHP 8.2 + MariaDB + Apache)',
      desc: 'Instalação nativa direta no Ubuntu 22.04/24.04 com Composer, extensões PHP e virtual host.',
      badge: 'Nativo LAMP',
      color: 'border-blue-500 bg-blue-500/10 text-blue-300',
    },
    {
      id: 'nodejs-pm2',
      name: 'Node.js / React Fullstack + PM2',
      desc: 'Deploy para aplicações Node.js modernas com PM2 Cluster, logs e Nginx Reverse Proxy com WebSockets.',
      badge: 'Modern JS',
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
    },
    {
      id: 'nginx-ssl',
      name: 'Nginx Proxy Reverso + Let\'s Encrypt SSL',
      desc: 'Arquivo de configuração Nginx ultra-otimizado com cache, compressão gzip e certificado SSL automático.',
      badge: 'Proxy & SSL',
      color: 'border-amber-500 bg-amber-500/10 text-amber-300',
    },
    {
      id: 'backup-cron',
      name: 'Rotina de Backup Diário Hostinger',
      desc: 'Script bash para dump de banco MySQL + compactação de arquivos com retenção de 7 dias e cron.',
      badge: 'Segurança & Dados',
      color: 'border-rose-500 bg-rose-500/10 text-rose-300',
    },
    {
      id: 'firewall-hardening',
      name: 'Hardening & Swap 4GB Hostinger',
      desc: 'Criação de Swapfile (evita OOM no KVM), configuração UFW, Fail2ban contra ataques de força bruta SSH.',
      badge: 'Anti-Invasão',
      color: 'border-indigo-500 bg-indigo-500/10 text-indigo-300',
    },
  ];

  // Generate Script via backend
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/vps/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stackType: selectedStack,
          domain,
          vpsIp,
          dbName,
          dbUser,
          dbPass,
          appPort,
          customRequirements: `${customNotes}. ${enableSwap ? 'Incluir criação de swap de 2GB/4GB.' : ''} ${enableFirewall ? 'Incluir regras UFW para Hostinger (80, 443, SSH).' : ''}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar o código da stack.');
      }

      setGeneratedResult(data.content);
    } catch (err: any) {
      console.error(err);
      setGeneratedResult(`Erro ao gerar: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    if (!generatedResult) return;
    const blob = new Blob([generatedResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deploy-hostinger-${selectedStack}.sh`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Title banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Server className="w-48 h-48 text-purple-400" />
        </div>
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Hostinger KVM VPS DevOps Studio
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Gerador de Códigos & Deploys para Hostinger VPS
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Gere scripts prontos para rodar no Ubuntu (22.04/24.04) do seu VPS Hostinger e monitore o histórico persistente de execução SSH para auditoria e depuração técnica.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setStudioTab('generator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              studioTab === 'generator'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Gerador de Scripts & Stacks</span>
          </button>

          <button
            onClick={() => setStudioTab('ssh-audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              studioTab === 'ssh-audit'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Histórico de Comandos SSH (Audit & Debug)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 font-mono">
              Persistente
            </span>
          </button>
        </div>
      </div>

      {studioTab === 'ssh-audit' ? (
        <SshCommandAuditLog vpsIp={vpsIp} />
      ) : (
        <>
          {/* Grid: Config Form & Stack Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stack Selection & Parameters */}
        <div className="lg:col-span-5 space-y-5">
          {/* Stacks Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              1. Selecione a Aplicação / Stack
            </h3>

            <div className="space-y-2">
              {stacks.map((st) => {
                const isSelected = selectedStack === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStack(st.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/40 text-white ring-1 ring-purple-500/30'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-100">{st.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{st.desc}</p>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap ${st.color}`}
                    >
                      {st.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VPS Parameters Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              2. Parâmetros da sua Hostinger VPS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Domínio ou Subdomínio
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="oficina.seusite.com.br"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  IP Público da VPS
                </label>
                <input
                  type="text"
                  value={vpsIp}
                  onChange={(e) => setVpsIp(e.target.value)}
                  placeholder="185.193.64.120"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Porta Interna da App
                </label>
                <input
                  type="text"
                  value={appPort}
                  onChange={(e) => setAppPort(e.target.value)}
                  placeholder="8080 ou 3000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Nome do Banco (MySQL/MariaDB)
                </label>
                <input
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="mapos_producao"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Usuário do Banco
                </label>
                <input
                  type="text"
                  value={dbUser}
                  onChange={(e) => setDbUser(e.target.value)}
                  placeholder="mapos_user"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Senha do Banco
                </label>
                <input
                  type="text"
                  value={dbPass}
                  onChange={(e) => setDbPass(e.target.value)}
                  placeholder="SenhaForteEloizio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={enableSwap}
                  onChange={(e) => setEnableSwap(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-950"
                />
                <span>Criar Swap de 2GB/4GB (Essencial para não travar o KVM da Hostinger)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={enableFirewall}
                  onChange={(e) => setEnableFirewall(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-950"
                />
                <span>Configurar UFW Firewall (Liberar portas 80, 443 e SSH)</span>
              </label>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Instruções ou Ajustes Específicos
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Ex: preciso de upload max de 100MB no Nginx, ou suporte a Redis..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-purple-500 text-xs resize-none"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando códigos com a Íris...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Script & Configuração para Hostinger</span>
                </>
              )}
            </button>

            {/* Iniciar Deploy Automatizado com Barra de Progresso Visual */}
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <Rocket className="w-4 h-4" />
              <span>Iniciar Deploy no Hostinger VPS (Progresso Visual)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Code Viewer & Terminal Execution Guide */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-lg min-h-[500px]">
            {/* Header of code viewer */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span className="font-mono font-semibold text-slate-200">
                  deploy-hostinger-{selectedStack}.sh
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  Bash / YAML / Nginx
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDeployModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-sm shadow-emerald-600/30"
                  title="Executar pipeline de deploy com barra de progresso visual"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Executar Deploy</span>
                </button>

                {generatedResult && (
                  <>
                    <button
                      onClick={copyCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Tudo</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={downloadScript}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Script</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-4 bg-slate-950 font-mono text-xs overflow-y-auto max-h-[600px] leading-relaxed scrollbar-thin">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                  <p className="text-slate-300 font-semibold">
                    Íris está escrevendo os scripts e validando para o ambiente da Hostinger...
                  </p>
                  <p className="text-slate-500 text-[11px] max-w-sm">
                    Incluindo configurações de segurança, regras de proxy reverso e comandos prontos para copiar e colar.
                  </p>
                </div>
              ) : generatedResult ? (
                <pre className="text-emerald-300 whitespace-pre-wrap selection:bg-purple-600 selection:text-white">
                  {generatedResult}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                  <FileCode className="w-12 h-12 text-slate-700" />
                  <p className="text-slate-400 font-medium">
                    Nenhum código gerado ainda.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md">
                    Selecione a stack à esquerda, configure o seu domínio e parâmetros da VPS Hostinger e clique no botão roxo para gerar.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Hostinger Execution Guide footer */}
            <div className="bg-slate-900 border-t border-slate-800 p-3 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-purple-300">Como rodar na Hostinger:</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  ssh root@{vpsIp || 'SEU_IP'} → nano deploy.sh → chmod +x deploy.sh → ./deploy.sh
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hostinger KVM 1/2/4 Testado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent SSH Command Audit Log Section */}
      <div className="mt-8">
        <SshCommandAuditLog vpsIp={vpsIp} />
      </div>
      </>
      )}

      {/* Visual Deployment Progress Bar & Status Modal */}
      <DeploymentProgressBar
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        domain={domain}
        vpsIp={vpsIp}
        stackName={stacks.find((s) => s.id === selectedStack)?.name || selectedStack}
        stackId={selectedStack}
      />
    </div>
  );
};
