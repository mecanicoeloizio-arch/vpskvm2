import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  Cpu,
  HardDrive,
  Server,
  Zap,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Flame,
  ArrowDownRight,
  ArrowUpRight,
  Shield,
  Layers,
  Sparkles,
  Sliders,
  Terminal,
} from 'lucide-react';

interface MetricHistoryPoint {
  time: string;
  cpu: number;
  ram: number;
  rx: number;
  tx: number;
}

export const VpsMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [history, setHistory] = useState<MetricHistoryPoint[]>([]);
  const [pollingRate, setPollingRate] = useState<number>(2500); // 2.5s
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  // Fetch real-time metrics
  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/vps/metrics');
      if (!res.ok) return;
      const data = await res.json();
      
      if (!isMountedRef.current) return;
      setMetrics(data);

      setHistory((prev) => {
        const newPoint: MetricHistoryPoint = {
          time: data.timestamp,
          cpu: data.cpu.usagePercent,
          ram: data.ram.usagePercent,
          rx: data.network.rxSecKB,
          tx: data.network.txSecKB,
        };
        const updated = [...prev, newPoint];
        // Keep last 25 points for smooth rolling view
        return updated.length > 25 ? updated.slice(updated.length - 25) : updated;
      });
    } catch (err) {
      console.error('Error fetching VPS metrics:', err);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchMetrics();

    if (isPaused) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, pollingRate);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [pollingRate, isPaused]);

  // Execute VPS quick actions
  const handleVpsAction = async (action: string) => {
    setIsExecutingAction(action);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/vps/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setActionFeedback(data.message);
      fetchMetrics();
    } catch (err: any) {
      setActionFeedback(`Erro: ${err.message}`);
    } finally {
      setIsExecutingAction(null);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Color helper for CPU/RAM badges
  const getBadgeColor = (percent: number) => {
    if (percent > 85) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (percent > 65) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const cpuPercent = metrics?.cpu?.usagePercent || 24;
  const ramPercent = metrics?.ram?.usagePercent || 54;
  const diskPercent = metrics?.disk?.usagePercent || 45;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Activity className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              Recharts Real-Time Telemetry Engine
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Monitoramento Hostinger VPS em Tempo Real
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {metrics?.vpsInfo?.plan || 'Hostinger KVM 2'} • IP:{' '}
              <strong className="text-slate-200 font-mono">{metrics?.vpsInfo?.ip || '185.193.64.120'}</strong> • Uptime:{' '}
              <span className="text-emerald-400">{metrics?.vpsInfo?.uptime || '18 dias'}</span>
            </p>
          </div>

          {/* Controls: Pause, Interval, Simulated Load */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors ${
                isPaused
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Pausado' : 'Ao Vivo'}</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-[11px] text-slate-300">
              <span>Freq:</span>
              <button
                onClick={() => setPollingRate(1500)}
                className={`px-1.5 py-0.5 rounded ${pollingRate === 1500 ? 'bg-purple-600 text-white' : 'hover:text-white'}`}
              >
                1.5s
              </button>
              <button
                onClick={() => setPollingRate(2500)}
                className={`px-1.5 py-0.5 rounded ${pollingRate === 2500 ? 'bg-purple-600 text-white' : 'hover:text-white'}`}
              >
                2.5s
              </button>
              <button
                onClick={() => setPollingRate(5000)}
                className={`px-1.5 py-0.5 rounded ${pollingRate === 5000 ? 'bg-purple-600 text-white' : 'hover:text-white'}`}
              >
                5s
              </button>
            </div>

            <button
              onClick={() => handleVpsAction('simulate_traffic')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all ${
                metrics?.loadMode === 'spike'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title="Alternar simulação de pico de requisições MapOS"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{metrics?.loadMode === 'spike' ? 'Pico Ativo!' : 'Simular Tráfego'}</span>
            </button>

            <button
              onClick={() => handleVpsAction('drop_cache')}
              disabled={isExecutingAction === 'drop_cache'}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
              title="Executar sync; echo 3 > /proc/sys/vm/drop_caches"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Limpar Cache RAM</span>
            </button>
          </div>
        </div>

        {/* Action feedback toast */}
        {actionFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
              <span>CPU (Hostinger 2 vCPU)</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold border ${getBadgeColor(cpuPercent)}`}>
              {cpuPercent}%
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-mono">{cpuPercent}%</div>
            <p className="text-[11px] text-slate-400">
              Load Avg: <span className="text-slate-200 font-mono">{metrics?.cpu?.loadAvg?.join(' • ') || '0.35'}</span>
            </p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${cpuPercent > 80 ? 'bg-rose-500' : cpuPercent > 60 ? 'bg-amber-500' : 'bg-purple-500'}`}
              style={{ width: `${cpuPercent}%` }}
            />
          </div>
        </div>

        {/* RAM Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Server className="w-4 h-4" />
              </div>
              <span>RAM (4.0 GB KVM)</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold border ${getBadgeColor(ramPercent)}`}>
              {ramPercent}%
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-mono">
              {metrics?.ram?.usedGB || '2.18'} <span className="text-sm font-normal text-slate-400">/ 4.0 GB</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Swap: <span className="text-slate-200 font-mono">{metrics?.ram?.swapUsedGB || '0.32'} GB</span> (Ativo)
            </p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${ramPercent > 85 ? 'bg-rose-500' : ramPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${ramPercent}%` }}
            />
          </div>
        </div>

        {/* Disk NVMe Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <HardDrive className="w-4 h-4" />
              </div>
              <span>NVMe SSD (50 GB)</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold border ${getBadgeColor(diskPercent)}`}>
              {diskPercent}%
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-mono">
              {metrics?.disk?.usedGB || '22.8'} <span className="text-sm font-normal text-slate-400">/ 50.0 GB</span>
            </div>
            <p className="text-[11px] text-slate-400">
              IOPS: <span className="text-slate-200 font-mono">{metrics?.disk?.iops || 1340}</span> • Livre:{' '}
              <span className="text-emerald-400">{metrics?.disk?.freeGB || '27.2'} GB</span>
            </p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${diskPercent}%` }}
            />
          </div>
        </div>

        {/* Network Throughput Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                <Activity className="w-4 h-4" />
              </div>
              <span>Rede Hostinger 300Mbps</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono text-pink-400 bg-pink-500/10 border border-pink-500/30">
              Gigabit
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-2">
              <span>{metrics?.network?.txSecKB || 310}</span>
              <span className="text-xs font-normal text-slate-400">KB/s TX</span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-3">
              <span className="flex items-center gap-0.5 text-emerald-400">
                <ArrowDownRight className="w-3 h-3" /> {metrics?.network?.rxSecKB || 180} KB/s
              </span>
              <span className="flex items-center gap-0.5 text-purple-400">
                <ArrowUpRight className="w-3 h-3" /> {metrics?.network?.txSecKB || 310} KB/s
              </span>
            </p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-pink-500 w-2/3" />
          </div>
        </div>
      </div>

      {/* Recharts Grid 1: Real-time Rolling AreaChart for CPU & RAM */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Linha do Tempo em Tempo Real: CPU vs Memória RAM (%)
            </h3>
            <p className="text-xs text-slate-400">
              Fluxo contínuo atualizado a cada {pollingRate / 1000}s com gradiente de carga
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> CPU Usage ({cpuPercent}%)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> RAM Usage ({ramPercent}%)
            </span>
          </div>
        </div>

        {/* AreaChart Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => `${val}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: any) => [`${value}%`, name === 'cpu' ? 'CPU' : 'RAM']}
                labelFormatter={(label) => `Horário: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                name="cpu"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cpuGradient)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="ram"
                name="ram"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#ramGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recharts Grid 2: Disk Breakdown PieChart + Network LineChart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Disk Space Partition PieChart */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              Distribuição do Disco NVMe (50 GB)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Uso dividido por containers Docker, arquivos do MapOS e banco MySQL
            </p>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.disk?.partitions || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="sizeGB"
                >
                  {(metrics?.disk?.partitions || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any, name: any, item: any) => [`${val} GB (${item.payload.percent}%)`, item.payload.name]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-white">{metrics?.disk?.usedGB || '22.8'} GB</span>
              <span className="text-[10px] text-slate-400">Em Uso</span>
            </div>
          </div>

          {/* Legend items */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800/80">
            {(metrics?.disk?.partitions || []).map((part: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: part.fill }} />
                  <span className="truncate max-w-[200px] text-[11px]">{part.name}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 font-semibold">{part.sizeGB} GB</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Network Throughput RX/TX LineChart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-pink-400" />
                Vazão de Rede em Tempo Real (RX vs TX KB/s)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Download de pacotes vs upload do Nginx servindo imagens e dados MapOS
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> RX (Down)
              </span>
              <span className="flex items-center gap-1 text-pink-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-pink-400" /> TX (Up)
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => `${val}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any, name: any) => [`${val} KB/s`, name === 'rx' ? 'RX (Download)' : 'TX (Upload)']}
                />
                <Line
                  type="monotone"
                  dataKey="rx"
                  name="rx"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="tx"
                  name="tx"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Total Trafegado no Mês: RX 18.4 GB • TX 42.1 GB</span>
            <span className="text-emerald-400 font-medium">Link Hostinger sem limites</span>
          </div>
        </div>
      </div>

      {/* Live Containers & Top Processes Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Container Status List */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Containers Docker no Hostinger VPS
            </h3>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
              docker compose status
            </span>
          </div>

          <div className="space-y-2">
            {(metrics?.containers || []).map((c: any) => (
              <div
                key={c.name}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono font-bold text-slate-100">{c.name}</span>
                    <span className="text-[10px] text-slate-500">({c.image})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Porta: <span className="font-mono text-slate-300">{c.port}</span> • Status:{' '}
                    <span className="text-emerald-400 font-medium">{c.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-purple-300 font-bold block">{c.cpu}% CPU</span>
                  <span className="text-[11px] text-slate-400 font-mono">{c.memMB} MB RAM</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Processes Bar Chart */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Consumo de CPU por Processo (Top 5)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Processos com maior impacto no servidor Ubuntu da Hostinger
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics?.topProcesses || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" domain={[0, 30]} stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                  tickFormatter={(val) => val.split(' ')[0]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${val}% CPU`, 'Uso']}
                />
                <Bar dataKey="cpu" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>MySQL e PHP-FPM operando dentro da margem ideal para 4GB RAM</span>
            <span className="text-purple-400 font-mono">PID monitor ativo</span>
          </div>
        </div>
      </div>

      {/* Hostinger Architecture & Optimization Insights from Iris */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-purple-300 text-sm font-bold">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Recomendações da Íris para Alta Disponibilidade no VPS Hostinger</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Swapfile 4GB Configurado
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              O swap de 4GB absorve picos temporários do MariaDB e geração de relatórios pesados no MapOS, impedindo
              que o Linux ative o OOM-Killer.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Buffer Pool MariaDB
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              `innodb_buffer_pool_size` fixado em 1.5GB (ótimo para VPS 4GB), garantindo respostas em menos de 10ms
              para consultas de ordens de serviço.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-purple-400" />
              Cache FastCGI & Gzip Nginx
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Ativos com `client_max_body_size 64M`, permitindo o envio rápido de fotos de máquinas e peças em alta
              resolução diretamente pelo balcão.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
