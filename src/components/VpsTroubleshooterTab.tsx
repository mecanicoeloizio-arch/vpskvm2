import React, { useState } from 'react';
import {
  Terminal,
  AlertOctagon,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Server,
  Wrench,
} from 'lucide-react';

export const VpsTroubleshooterTab: React.FC = () => {
  const [logInput, setLogInput] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisOutput, setDiagnosisOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const commonIssues = [
    {
      title: '502 Bad Gateway no Nginx',
      desc: 'PHP-FPM socket inacessível ou container do MapOS fora do ar.',
      sampleLog: `nginx: [error] 1420#1420: *1 connect() to unix:/run/php/php8.2-fpm.sock failed (2: No such file or directory) while connecting to upstream, client: 177.18.29.1, server: oficina.seusite.com.br, request: "GET / HTTP/1.1", upstream: "fastcgi://unix:/run/php/php8.2-fpm.sock:"`,
    },
    {
      title: 'Erro de Conexão MySQL / MariaDB',
      desc: 'SQLSTATE[HY000] [2002] Connection refused no MapOS.',
      sampleLog: `Fatal error: Uncaught PDOException: SQLSTATE[HY000] [2002] Connection refused in /var/www/html/mapos/application/config/database.php:84
Stack trace: #0 /var/www/html/mapos/system/database/drivers/pdo/pdo_driver.php(145): PDO->__construct('mysql:host=127....')`,
    },
    {
      title: 'Processo Morto por Falta de RAM (OOM)',
      desc: 'Kernel do Linux na Hostinger matou o MySQL/Node por falta de Swap.',
      sampleLog: `[10482.112] Out of memory: Kill process 2841 (mysqld) score 512 or sacrifice child
[10482.113] Killed process 2841 (mysqld) total-vm:1894212kB, anon-rss:920144kB
docker compose ps: mapos_db exited with code 137`,
    },
    {
      title: 'Let\'s Encrypt SSL Falhou na Hostinger',
      desc: 'Porta 80 bloqueada no UFW ou DNS A ainda propagando.',
      sampleLog: `Certbot failed to authenticate some domains (authenticator: nginx).
Domain: oficina.seusite.com.br
Type: connection
Detail: Fetching http://oficina.seusite.com.br/.well-known/acme-challenge/XYZ: Timeout during connect (likely firewall problem)`,
    },
  ];

  const handleDiagnose = async (customText?: string) => {
    const textToAnalyze = customText || logInput;
    if (!textToAnalyze.trim()) return;

    setIsDiagnosing(true);
    setDiagnosisOutput(null);

    try {
      const res = await fetch('/api/vps/diagnose-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logText: textToAnalyze }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao analisar log.');
      }

      setDiagnosisOutput(data.diagnosis);
    } catch (err: any) {
      console.error(err);
      setDiagnosisOutput(`Erro: ${err.message}`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const copyResult = () => {
    if (!diagnosisOutput) return;
    navigator.clipboard.writeText(diagnosisOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Hostinger VPS Terminal Debugger
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Analisador de Logs & Resolução de Erros Hostinger
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Cole os logs de erro do Nginx, Docker, PHP, MySQL ou SSH do seu VPS Hostinger.
            A Íris aponta a causa raiz e fornece os comandos exatos de correção para rodar no terminal.
          </p>
        </div>
      </div>

      {/* Quick Problem Presets */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Problemas Frequentes em VPS Hostinger (Clique para testar)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {commonIssues.map((issue, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLogInput(issue.sampleLog);
                handleDiagnose(issue.sampleLog);
              }}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850 text-left transition-all flex flex-col justify-between gap-2 group"
            >
              <div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 block mb-1">
                  {issue.title}
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">{issue.desc}</p>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono">Testar diagnóstico →</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Log Paste Area */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>Cole o Log ou Mensagem de Erro da Hostinger</span>
              <button
                onClick={() => setLogInput('')}
                className="text-slate-400 hover:text-rose-400 text-[11px]"
              >
                Limpar
              </button>
            </label>

            <textarea
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              placeholder="Cole aqui a saída de:
$ docker logs mapos_app
$ tail -n 50 /var/log/nginx/error.log
$ systemctl status php8.2-fpm..."
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />

            <button
              onClick={() => handleDiagnose()}
              disabled={isDiagnosing || !logInput.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analisando o log com a Íris...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Diagnosticar e Obter Comandos de Correção</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: AI Diagnosis & Solution Commands */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-lg min-h-[420px]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-200">
                  Solução Técnica & Comandos Recomendados
                </span>
              </div>
              {diagnosisOutput && (
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 text-[11px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 p-4 bg-slate-950/80 overflow-y-auto max-h-[500px] text-xs leading-relaxed text-slate-200 scrollbar-thin">
              {isDiagnosing ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <p className="text-slate-200 font-semibold">
                    Íris está cruzando os logs com as regras de infraestrutura da Hostinger...
                  </p>
                </div>
              ) : diagnosisOutput ? (
                <div className="whitespace-pre-wrap font-sans text-slate-200 space-y-2">
                  {diagnosisOutput}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                  <AlertOctagon className="w-12 h-12 text-slate-700" />
                  <p className="text-slate-400 font-medium">
                    Aguardando log de erro para diagnóstico.
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Cole o erro acima ou escolha um dos problemas frequentes da Hostinger para ver os comandos de resolução.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
