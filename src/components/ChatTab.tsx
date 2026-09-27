import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, CallerRole, AssistantInfo } from '../types';
import {
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  Copy,
  Check,
  Sparkles,
  Server,
  FileCode,
  Wrench,
  Trash2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Paperclip,
} from 'lucide-react';

interface ChatTabProps {
  assistant: AssistantInfo | null;
  callerRole: CallerRole;
}

export const ChatTab: React.FC<ChatTabProps> = ({ assistant, callerRole }) => {
  const assistantName = assistant?.name || 'Íris';
  const greeting = assistant?.currentGreeting || 'Olá';

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `${greeting}! Sou a **${assistantName}**, sua atendente inteligente do Grupo Eloizio.\n\nSou especialista em gerenciar e gerar códigos e configurações para o seu **VPS na Hostinger**, além de cuidar do diagnóstico de **mecânica de carros e máquinas de costura** e da gestão do **MapOS**.\n\nComo posso te ajudar hoje? Pode me pedir scripts para Hostinger, enviar imagens de peças ou logs de erro!`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    mimeType: string;
    previewUrl: string;
    fileName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Image Upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('A imagem é muito grande. Escolha uma imagem de até 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(',')[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        previewUrl: result,
        fileName: file.name,
      });
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Voice Input Speech Recognition
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('O reconhecimento de voz não é suportado pelo seu navegador.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Send message
  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend && !selectedImage) return;

    setErrorMsg(null);
    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend || (selectedImage ? 'Analise esta imagem enviada, por favor.' : ''),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType, previewUrl: selectedImage.previewUrl } : undefined,
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    const imagePayload = selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          callerRole,
          image: imagePayload,
          modelChoice: 'flash',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao obter resposta da assistente.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed,
        },
      ]);
    } catch (err: any) {
      console.error('Send error:', err);
      setErrorMsg(err.message || 'Houve um erro de comunicação com a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to format markdown nicely with copy blocks
  const renderMessageContent = (content: string, msgId: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }

      const lang = match[1] || 'bash';
      const code = match[2];
      parts.push({ type: 'code', lang, code });
      lastIndex = match.index + match[0].length;
    }

    const textAfter = content.substring(lastIndex);
    if (textAfter) {
      parts.push({ type: 'text', content: textAfter });
    }

    if (parts.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
    }

    return (
      <div className="space-y-3">
        {parts.map((p, idx) => {
          if (p.type === 'code') {
            const blockId = `${msgId}-block-${idx}`;
            return (
              <div key={idx} className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 my-2 text-xs">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
                  <span className="font-mono uppercase font-semibold text-[11px] text-purple-400">
                    {p.lang}
                  </span>
                  <button
                    onClick={() => copyToClipboard(p.code || '', blockId)}
                    className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copiedId === blockId ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar código</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-emerald-300 font-mono text-xs leading-relaxed">
                  <code>{p.code}</code>
                </pre>
              </div>
            );
          }
          return (
            <div key={idx} className="whitespace-pre-wrap leading-relaxed">
              {p.content}
            </div>
          );
        })}
      </div>
    );
  };

  const quickPrompts = [
    {
      title: 'Deploy MapOS na Hostinger',
      icon: Server,
      prompt: 'Íris, gere o script bash completo para instalar o MapOS com Docker e Nginx no meu VPS Ubuntu 22.04 da Hostinger.',
    },
    {
      title: 'Configurar Nginx + SSL Hostinger',
      icon: FileCode,
      prompt: 'Como configuro o Nginx Reverse Proxy com Certbot Let\'s Encrypt na Hostinger apontando para uma aplicação na porta 3000?',
    },
    {
      title: 'Diagnosticar Máquina de Costura',
      icon: Wrench,
      prompt: 'Qual o diagnóstico para uma máquina de costura Reta Industrial que está quebrando a agulha e embolando linha embaixo?',
    },
    {
      title: 'Script de Backup Automático',
      icon: Server,
      prompt: 'Gere um script de backup automático diário do banco MySQL e arquivos do MapOS com compactação tar.gz e retenção de 7 dias.',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-135px)] max-w-5xl mx-auto px-4 py-4">
      {/* Role Notice */}
      <div className="mb-3 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            Respondendo como:{' '}
            <strong className="text-purple-300 capitalize">
              {callerRole === 'assinante'
                ? 'Assinante / Dono (Acesso completo a infra e custos)'
                : callerRole === 'tecnico'
                ? 'Colaborador Técnico (Foco técnico e peças)'
                : 'Cliente Final (Foco no veículo/máquina)'}
            </strong>
          </span>
        </div>
        <span className="text-slate-500 hidden sm:inline">
          Hostinger KVM Ready • MapOS Anti-Duplicidade
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-purple-500/20">
                  {assistantName[0]}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-sm ${
                  isUser
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                }`}
              >
                {/* Image attachment preview if any */}
                {msg.image?.previewUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-purple-400/30 max-w-sm">
                    <img
                      src={msg.image.previewUrl}
                      alt="Anexo enviado"
                      className="w-full h-auto object-cover max-h-60"
                    />
                  </div>
                )}

                {renderMessageContent(msg.content, msg.id)}

                <div
                  className={`mt-2 text-[10px] flex items-center justify-between ${
                    isUser ? 'text-purple-200' : 'text-slate-500'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <span className="text-purple-400 font-mono text-[9px]">
                      {assistantName} • Hostinger AI
                    </span>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-slate-300 text-xs font-semibold">
                  Você
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {assistantName[0]}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-2 text-xs text-purple-300">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>{assistantName} está pensando e elaborando a melhor resposta...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850 text-left transition-all group flex items-start gap-2.5"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300">
                <qp.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">
                  {qp.title}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-1">{qp.prompt}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error alert if any */}
      {errorMsg && (
        <div className="my-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Selected Image Banner */}
      {selectedImage && (
        <div className="mb-2 p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center gap-2">
            <img
              src={selectedImage.previewUrl}
              alt="Preview"
              className="w-8 h-8 rounded object-cover border border-purple-400/40"
            />
            <span className="truncate max-w-xs">{selectedImage.fileName}</span>
            <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-300">
              Pronta para análise
            </span>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="text-slate-400 hover:text-rose-400 p-1"
            title="Remover anexo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Form */}
      <div className="relative mt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2 bg-slate-900 border border-slate-800 focus-within:border-purple-500/70 p-2 rounded-2xl shadow-xl transition-all"
        >
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-xl transition-colors"
            title="Anexar foto de máquina, peça ou print de erro da Hostinger"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-colors ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800'
            }`}
            title={isListening ? 'Parar gravação' : 'Falar por áudio'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Textarea */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isListening
                ? 'Ouvindo você...'
                : `Converse com ${assistantName} sobre seu VPS Hostinger, MapOS ou envie uma foto...`
            }
            rows={1}
            className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:ring-0 focus:outline-none resize-none py-2 px-1 max-h-32"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:hover:bg-purple-600 transition-colors shadow-md shadow-purple-600/30 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
