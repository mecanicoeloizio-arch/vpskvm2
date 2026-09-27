import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Camera,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  Car,
  Scissors,
  Server,
  HelpCircle,
} from 'lucide-react';

export const VisualDiagnosisTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'costura' | 'automotivo' | 'vps_log'>('costura');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecione um arquivo de imagem.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setImageBase64(result.split(',')[1]);
      setImageMime(file.type);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const runDiagnosis = async () => {
    if (!imageBase64) {
      setErrorMsg('Envie uma foto da máquina, peça com defeito ou print do terminal.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setDiagnosisResult(null);

    try {
      const endpoint = selectedCategory === 'vps_log' ? '/api/vps/diagnose-log' : '/api/diagnose-part';
      const bodyPayload = selectedCategory === 'vps_log'
        ? {
            logText: description,
            image: { data: imageBase64, mimeType: imageMime },
          }
        : {
            image: { data: imageBase64, mimeType: imageMime },
            description,
            machineCategory: selectedCategory,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar diagnóstico visual.');
      }

      setDiagnosisResult(data.diagnosis);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro durante a análise da imagem.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick preset scenario loader
  const loadPreset = (category: 'costura' | 'automotivo' | 'vps_log', descText: string) => {
    setSelectedCategory(category);
    setDescription(descText);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-pink-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Camera className="w-3.5 h-3.5 text-pink-400" />
            Análise Multimodal Inteligente
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Diagnóstico Visual de Máquinas, Peças e Servidores
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Envie uma foto de uma máquina de costura (industrial/doméstica), motor de carro,
            peça com desgaste ou print do terminal Hostinger. A Íris identificará o modelo,
            a causa do problema, o código da peça de reposição no MapOS e a solução.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Description */}
        <div className="lg:col-span-5 space-y-4">
          {/* Category selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <label className="text-xs font-bold text-slate-200 block">
              1. Selecione o Tipo de Diagnóstico
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setSelectedCategory('costura')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  selectedCategory === 'costura'
                    ? 'border-pink-500 bg-pink-950/40 text-pink-300 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scissors className="w-4 h-4 text-pink-400" />
                <span>Máq. Costura</span>
              </button>

              <button
                onClick={() => setSelectedCategory('automotivo')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  selectedCategory === 'automotivo'
                    ? 'border-purple-500 bg-purple-950/40 text-purple-300 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Car className="w-4 h-4 text-purple-400" />
                <span>Mecânica Carro</span>
              </button>

              <button
                onClick={() => setSelectedCategory('vps_log')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  selectedCategory === 'vps_log'
                    ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-4 h-4 text-blue-400" />
                <span>Erro Hostinger</span>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>2. Foto da Peça / Print do Erro</span>
              {imagePreview && (
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageBase64(null);
                  }}
                  className="text-pink-400 hover:text-pink-300 text-[11px]"
                >
                  Trocar Foto
                </button>
              )}
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-purple-500/30 max-h-72 flex items-center justify-center bg-black/40">
                <img
                  src={imagePreview}
                  alt="Pré-visualização"
                  className="max-h-72 w-full object-contain"
                />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-pink-500/60 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    Clique para enviar ou arraste a imagem
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, WEBP de máquina, lançadeira, motor ou print do terminal
                  </p>
                </div>
              </div>
            )}

            {/* Description / Symptoms */}
            <div>
              <label className="text-slate-400 font-medium text-xs block mb-1">
                Sintomas ou o que está acontecendo (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: A máquina é uma Reta Jack A4 que está quebrando a agulha ao acelerar e o ponto fica folgado embaixo..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            {/* Presets suggestions */}
            <div className="text-[11px] space-y-1">
              <span className="text-slate-500">Exemplos rápidos de diagnóstico:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() =>
                    loadPreset(
                      'costura',
                      'Lançadeira de Reta Industrial SunSpecial com folga na ponta e rebarba de agulha.'
                    )
                  }
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Lançadeira Costura
                </button>
                <button
                  onClick={() =>
                    loadPreset(
                      'automotivo',
                      'Barulho agudo na correia dentada e vazamento de óleo na polia do comando.'
                    )
                  }
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Correia / Polia Carro
                </button>
                <button
                  onClick={() =>
                    loadPreset(
                      'vps_log',
                      'Nginx 502 Bad Gateway ao tentar abrir o MapOS no domínio Hostinger.'
                    )
                  }
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  502 Bad Gateway VPS
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={runDiagnosis}
              disabled={isAnalyzing || !imageBase64}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Íris está analisando os detalhes visuais...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analisar com Íris (IA Multimodal)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Diagnosis Report */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-lg min-h-[500px]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-400" />
                <span className="font-semibold text-slate-200">
                  Laudo Técnico & Diagnóstico de Precisão
                </span>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
                Padrão MapOS & Hostinger
              </span>
            </div>

            <div className="flex-1 p-5 bg-slate-950/70 overflow-y-auto max-h-[600px] text-xs leading-relaxed text-slate-200 scrollbar-thin">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
                  <p className="text-slate-200 font-semibold">
                    Íris está examinando a imagem e confrontando com os manuais de serviço...
                  </p>
                  <p className="text-slate-400 text-[11px] max-w-sm">
                    Identificando marca, modelo, desgaste físico, código único da peça e passo a passo de regulagem.
                  </p>
                </div>
              ) : diagnosisResult ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold block text-slate-100 mb-0.5">
                        Diagnóstico Concluído pela Íris
                      </span>
                      <span>
                        Solução direta, código único MapOS para cadastro e instruções para o mecânico ou administrador do VPS.
                      </span>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed font-sans text-slate-200 space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    {diagnosisResult}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                  <Wrench className="w-12 h-12 text-slate-700" />
                  <p className="text-slate-300 font-medium">Aguardando imagem para análise</p>
                  <p className="text-xs text-slate-500 max-w-md">
                    Envie a foto de uma máquina de costura, defeito mecânico de veículo ou print do terminal Hostinger para receber o laudo completo e código da peça.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border-t border-slate-800 p-3 text-xs text-slate-400 flex items-center justify-between">
              <span>Regra de ouro: Pergunta direta de diagnóstico e verificação do número de série.</span>
              <span className="text-purple-400 font-medium">Grupo Eloizio • MapOS IA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
