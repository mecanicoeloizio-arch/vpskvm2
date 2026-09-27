import React, { useState, useEffect } from 'react';
import { PartItem, SubscriptionItem, OrderOfService, CallerRole } from '../types';
import {
  ShieldAlert,
  Search,
  Plus,
  Lock,
  CheckCircle,
  Clock,
  Database,
  Download,
  AlertTriangle,
  Archive,
  Layers,
  Wrench,
  FileCheck,
  DollarSign,
  Eye,
  EyeOff,
} from 'lucide-react';

interface MapOSHubTabProps {
  callerRole: CallerRole;
}

export const MapOSHubTab: React.FC<MapOSHubTabProps> = ({ callerRole }) => {
  const [parts, setParts] = useState<PartItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [orders, setOrders] = useState<OrderOfService[]>([]);
  const [searchPart, setSearchPart] = useState('');
  const [newPartCode, setNewPartCode] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartStock, setNewPartStock] = useState('5');
  const [newPartCost, setNewPartCost] = useState('45.00');
  const [newPartSale, setNewPartSale] = useState('90.00');
  const [newPartCategory, setNewPartCategory] = useState('Costura Industrial');
  const [antiDuplicityFeedback, setAntiDuplicityFeedback] = useState<string | null>(null);

  // Load initial demo data
  useEffect(() => {
    fetch('/api/mapos/data')
      .then((res) => res.json())
      .then((data) => {
        if (data.partsDatabase) setParts(data.partsDatabase);
        if (data.subscriptions) setSubscriptions(data.subscriptions);
        if (data.ordersOfService) setOrders(data.ordersOfService);
      })
      .catch((err) => console.error('Error fetching MapOS data:', err));
  }, []);

  // Anti-duplicity submission test
  const handleAddOrUpdatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartCode.trim() || !newPartName.trim()) return;

    const formattedCode = newPartCode.trim().toUpperCase();
    const existingIndex = parts.findIndex((p) => p.code === formattedCode);

    if (existingIndex >= 0) {
      // REGRA ANTI-DUPLICIDADE ATIVADA
      const updated = [...parts];
      updated[existingIndex] = {
        ...updated[existingIndex],
        stock: updated[existingIndex].stock + Number(newPartStock),
        salePrice: `R$ ${parseFloat(newPartSale || '0').toFixed(2)}`,
        costPrice: `R$ ${parseFloat(newPartCost || '0').toFixed(2)}`,
      };
      setParts(updated);
      setAntiDuplicityFeedback(
        `[REGRA ANTI-DUPLICIDADE] O código "${formattedCode}" já existe no catálogo! Não foi criado item duplicado. O estoque foi somado (+${newPartStock}) e os preços foram atualizados.`
      );
    } else {
      // Novo cadastro
      const newItem: PartItem = {
        code: formattedCode,
        name: newPartName.trim(),
        category: newPartCategory,
        stock: Number(newPartStock),
        costPrice: `R$ ${parseFloat(newPartCost || '0').toFixed(2)}`,
        salePrice: `R$ ${parseFloat(newPartSale || '0').toFixed(2)}`,
        compatible: 'Compatibilidade geral cadastrada',
      };
      setParts([newItem, ...parts]);
      setAntiDuplicityFeedback(
        `Peça "${newItem.name}" cadastrada com sucesso sob o código único universal "${formattedCode}".`
      );
    }

    setNewPartCode('');
    setNewPartName('');
  };

  // Filtered parts
  const filteredParts = parts.filter(
    (p) =>
      p.code.toLowerCase().includes(searchPart.toLowerCase()) ||
      p.name.toLowerCase().includes(searchPart.toLowerCase()) ||
      p.category.toLowerCase().includes(searchPart.toLowerCase())
  );

  const isOwner = callerRole === 'assinante';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            Sistema MapOS & Automação de Assinaturas
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Base de Dados & Controle Inteligente de Assinaturas
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Regra anti-duplicidade estrita por Código Universal de Peça, privacidade de custos por
            assinatura, e régua de cobrança automática (10, 5 e 1 dia antes do vencimento, bloqueio
            com retenção de 60 dias e expurgo seguro com envio de backup).
          </p>
        </div>
      </div>

      {/* Role notice on privacy */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          {isOwner ? (
            <Eye className="w-4 h-4 text-emerald-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-amber-400" />
          )}
          <span>
            {isOwner ? (
              <strong className="text-emerald-300">
                Visualização do Dono/Assinante:
              </strong>
            ) : (
              <strong className="text-amber-300">
                Visualização Protegida ({callerRole}):
              </strong>
            )}{' '}
            {isOwner
              ? 'Todos os custos de compra e estoque privado estão liberados.'
              : 'Preços de custo e relatórios de cobrança de assinaturas estão ocultados por segurança.'}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Regra: Peça Chave Única Universal
        </span>
      </div>

      {/* Section 1: Subscription Timeline (Régua de Cobrança 10, 5, 1 dia + Bloqueio 60 dias) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Régua Automática de Cobrança & Bloqueio das Assinaturas
            </h3>
            <p className="text-xs text-slate-400">
              Notificação 10, 5 e 1 dia antes do vencimento • Bloqueio automático • Retenção de 60 dias antes de backup e limpeza
            </p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
            {subscriptions.length} Assinaturas Ativas no VPS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {subscriptions.map((sub) => {
            const isBlocked = sub.status === 'BLOQUEADO';
            return (
              <div
                key={sub.subCode}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isBlocked
                    ? 'border-rose-500/50 bg-rose-950/20'
                    : sub.dueInDays === 1
                    ? 'border-amber-500/50 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-purple-300">{sub.subCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isBlocked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : sub.dueInDays === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-200 text-sm">{sub.clientName}</h4>
                  <p className="text-slate-400 text-[11px]">
                    Responsável: <strong className="text-slate-300">{sub.owner}</strong> • Plano: {sub.plan}
                  </p>
                  <p className="text-slate-300 text-[11px] pt-1">
                    {sub.nextBillingNotice}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Ação da IA: {sub.actionRequired}</span>
                  {isBlocked && (
                    <button
                      onClick={() =>
                        alert(
                          `[Ação MapOS] Backup geral gerado para ${sub.clientName} (${sub.subCode}). Arquivo criptografado pronto para download.`
                        )
                      }
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-medium"
                    >
                      <Download className="w-3 h-3 text-purple-400" />
                      Backup 60d
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Anti-Duplicity Parts Catalog */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Catálogo de Peças (Regra Anti-Duplicidade por Código Único)
            </h3>
            <p className="text-xs text-slate-400">
              Se você tentar cadastrar o mesmo código, o MapOS atualiza estoque e preço sem duplicar o item.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchPart}
              onChange={(e) => setSearchPart(e.target.value)}
              placeholder="Buscar por código ou nome..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Anti-duplicity feedback banner */}
        {antiDuplicityFeedback && (
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between">
            <span>{antiDuplicityFeedback}</span>
            <button
              onClick={() => setAntiDuplicityFeedback(null)}
              className="text-purple-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick form to test anti-duplicity */}
        {isOwner && (
          <form
            onSubmit={handleAddOrUpdatePart}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs items-end"
          >
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Código Único *
              </label>
              <input
                type="text"
                value={newPartCode}
                onChange={(e) => setNewPartCode(e.target.value)}
                placeholder="Ex: LAN-JACK-A4"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono uppercase"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-400 font-semibold block mb-1">
                Nome da Peça *
              </label>
              <input
                type="text"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                placeholder="Ex: Lançadeira Jack A4"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Qtd. Estoque
              </label>
              <input
                type="number"
                value={newPartStock}
                onChange={(e) => setNewPartStock(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Preço Venda (R$)
              </label>
              <input
                type="text"
                value={newPartSale}
                onChange={(e) => setNewPartSale(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar/Atualizar</span>
            </button>
          </form>
        )}

        {/* Parts Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Código Único</th>
                <th className="px-4 py-3">Descrição da Peça</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Compatibilidade</th>
                <th className="px-4 py-3 text-right">Estoque</th>
                {isOwner && <th className="px-4 py-3 text-right">Preço Custo</th>}
                <th className="px-4 py-3 text-right">Preço Venda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
              {filteredParts.map((part) => (
                <tr key={part.code} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-purple-300">
                    {part.code}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-200">
                    {part.name}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {part.category}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">
                    {part.compatible}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                    {part.stock} un
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3 text-right text-slate-400 font-mono">
                      {part.costPrice}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right font-bold text-slate-100 font-mono">
                    {part.salePrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Ordens de Serviço & Equipamentos com Nº de Série */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Ordens de Serviço (OS) & Equipamentos com Número de Série
          </h3>
          <p className="text-xs text-slate-400">
            Cada equipamento possui rastreabilidade histórica ligada ao cliente e técnico responsável.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {orders.map((os) => (
            <div
              key={os.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-purple-300">{os.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium">
                    {os.status}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-100">{os.equipment}</h4>
                <p className="text-slate-400 text-[11px] mt-1">
                  Cliente: <span className="text-slate-200">{os.client}</span>
                </p>
                <p className="text-slate-400 text-[11px]">
                  Técnico: <span className="text-slate-200">{os.technician}</span>
                </p>
                <div className="mt-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                  <strong>Sintoma:</strong> {os.problem}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
