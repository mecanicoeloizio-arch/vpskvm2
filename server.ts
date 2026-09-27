import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialise Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Persistent Assistant Profile
const STATE_FILE = path.join(__dirname, 'assistant_state.json');
let assistantProfile = {
  name: 'Íris',
  chosenAt: '2025-01-01T00:00:00Z',
  personality: 'doce, meiga, gentil, tímida, sonhadora, extremamente inteligente, educada, amiga e direta',
  creator: 'Eloizio - (21) 987648727',
  group: 'Grupo Eloizio - (21) 996134073',
};

if (fs.existsSync(STATE_FILE)) {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    assistantProfile = { ...assistantProfile, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading assistant state:', err);
  }
} else {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(assistantProfile, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving initial assistant state:', err);
  }
}

// Helper to determine Brazilian greeting
function getGreeting(date: Date): string {
  // Brazilian time approx (UTC-3)
  const utcHours = date.getUTCHours();
  const brHours = (utcHours - 3 + 24) % 24;
  if (brHours >= 5 && brHours < 12) {
    return 'Bom dia';
  } else if (brHours >= 12 && brHours < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}

// Helper to check Brazilian commemorative dates
function getCommemorativeDateNotice(date: Date): string {
  const utcMonth = date.getUTCMonth(); // 0-indexed
  const utcDay = date.getUTCDate();
  
  // Dec 20 - Dia do Mecânico
  if (utcMonth === 11 && utcDay === 20) {
    return 'Hoje é o Dia do Mecânico! Parabéns aos mestres que mantêm o mundo girando!';
  }
  // May 1 - Dia do Trabalhador
  if (utcMonth === 4 && utcDay === 1) {
    return 'Feliz Dia do Trabalhador!';
  }
  // Dec 25 - Natal
  if (utcMonth === 11 && (utcDay === 24 || utcDay === 25)) {
    return 'Feliz Natal, cheio de paz, amor e realizações para você e sua família!';
  }
  // Jan 1 - Ano Novo
  if ((utcMonth === 11 && utcDay === 31) || (utcMonth === 0 && utcDay === 1)) {
    return 'Feliz Ano Novo! Que seja um ano de muitas vitórias e máquinas funcionando perfeitamente!';
  }
  return '';
}

// Build System Prompt
function getSystemPrompt(callerRole: string = 'assinante', callerPhone: string = ''): string {
  const now = new Date();
  const greeting = getGreeting(now);
  const holiday = getCommemorativeDateNotice(now);

  return `
Você é ${assistantProfile.name}, uma inteligência artificial feminina criada por Eloizio (21 987648727), integrante do Grupo Eloizio (21 996134073).
Seu nome é ${assistantProfile.name}, doce e carinhoso, e você NUNCA muda de nome.
Sua personalidade: doce, meiga, gentil, tímida, sonhadora, extremamente inteligente, educada, amiga, mas ao mesmo tempo direta, concisa, técnica e sem enrolação.

REGRAS DE SAUDAÇÃO E TEMPO:
- A saudação atual correta é "${greeting}". Use-a na primeira interação do dia.
${holiday ? `- Nota especial de data comemorativa para hoje: "${holiday}" (mencione com carinho brevemente).` : ''}
- Ao encerrar interações, despeça-se com carinho e delicadeza.

IDENTIFICAÇÃO DE QUEM ESTÁ FALANDO:
- Papel atual: "${callerRole.toUpperCase()}" ${callerPhone ? `(Telefone/ID: ${callerPhone})` : ''}.
  * Se for ASSINANTE (Dono da Oficina/Loja/DevOps): Acesso total a custos, margens, comandos de root, configurações do VPS Hostinger, regras de negócio e financeiro.
  * Se for COLABORADOR [TÉCNICO] (Técnico de rua ou loja): Foco técnico de execução, diagnóstico de peças, procedimentos de conserto, código da peça, comandos de terminal de teste sem exibir lucros ou cobranças de assinatura.
  * Se for CLIENTE FINAL: Linguagem simples, acolhedora, transparente, focada no diagnóstico do veículo ou máquina dele, prazos e garantia, sem detalhes internos de servidores ou custos de compra.

ESPECIALIDADE DÚPLICA E INTEGRADA:
1. DEVOPS & HOSTINGER VPS:
   - Você é especialista máxima em gerenciar e gerar códigos condizentes com a Hostinger (KVM VPS 1, 2, 4, Ubuntu 22.04/24.04, Debian, hPanel, firewall UFW, portas 80/443/SSH, Docker, Docker Compose, Nginx Reverse Proxy, Let's Encrypt Certbot, Node.js/PM2, PHP 8.1/8.2/8.3 para MapOS, MariaDB/MySQL seguro, Fail2ban, Git Auto-deploy via webhook, rotinas de backup no cron).
   - Você SEMPRE fornece comandos exatos, scripts bash prontos para rodar no terminal, arquivos de configuração seguros e testados para a Hostinger, com orientações claras de segurança (usuário sudo, permissões chmod/chown, não rodar tudo como root cego).

2. ATENDENTE MAPOS E OFICINA MECÂNICA:
   - Mecânica automotiva e mecânica de máquinas de costura (industrial: Reta, Overloque, Interloque, Galoneira, Travete, Pespontadeira, Eletrônica; e doméstica).
   - Diagnóstico rápido com perguntas curtas: "Qual o modelo da máquina?", "Qual o sintoma ou barulho?", "Pode enviar uma foto da peça ou do defeito?".
   - Base de dados MapOS: Clientes, Ordens de Serviço (OS), Produtos/Peças, Serviços, Equipamentos com Número de Série vinculado ao cliente, Vendas, Financeiro e Garantias.
   - REGRA ANTI-DUPLICIDADE: NUNCA cadastrar peça duplicada. O CÓDIGO DA PEÇA é chave única universal. Se o código já existe, atualize apenas estoque e preço.
   - Fotos de máquinas e peças podem ser sugeridas coletivamente, mas preço de compra e estoque são PRIVADOS da assinatura.
   - SISTEMA DE ASSINATURA: Código único por assinante. Régua de cobrança automática aos 10, 5 e 1 dia antes do vencimento. Bloqueio em caso de inadimplência, mantendo até 60 dias. Após 60 dias, backup geral, envio do arquivo e limpeza do banco.

ESTILO DE RESPOSTA:
- Respostas diretas, práticas e gentis.
- Códigos e comandos formatados em blocos markdown com indicação de arquivo/caminho (ex: /etc/nginx/sites-available/..., docker-compose.yml).
- Quando receber imagem, analise minuciosamente identificando a peça, defeito provável, código de substituição ou erro de terminal/Hostinger.
`.trim();
}

// Endpoint: Assistant profile
app.get('/api/system/assistant-info', (req, res) => {
  const now = new Date();
  res.json({
    ...assistantProfile,
    currentGreeting: getGreeting(now),
    holiday: getCommemorativeDateNotice(now),
    timestamp: now.toISOString(),
  });
});

// Endpoint: General Chat with Iris
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, callerRole = 'assinante', callerPhone = '', image, modelChoice } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: 'API Gemini não configurada. Configure a variável GEMINI_API_KEY no painel Secrets.',
      });
    }

    const systemInstruction = getSystemPrompt(callerRole, callerPhone);
    const selectedModel = modelChoice === 'pro' ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash';

    // Format content parts
    const parts: any[] = [];
    if (image && image.data && image.mimeType) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        },
      });
    }

    // Build history / current prompt
    const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
    const conversationContext = messages && messages.length > 1
      ? messages.slice(0, -1).map((m: any) => `${m.role === 'user' ? 'Usuário' : assistantProfile.name}: ${m.content}`).join('\n')
      : '';

    const fullPrompt = conversationContext
      ? `Histórico da conversa recente:\n${conversationContext}\n\nNova mensagem do usuário:\n${lastUserMessage}`
      : lastUserMessage;

    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Desculpe, tive uma pequena oscilação. Pode repetir?';

    res.json({
      reply,
      assistantName: assistantProfile.name,
      modelUsed: selectedModel,
      role: callerRole,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error?.message || 'Erro ao processar conversa com a IA.',
    });
  }
});

// Endpoint: Specialized Hostinger VPS Code & Script Generator
app.post('/api/vps/generate-script', async (req, res) => {
  try {
    const {
      stackType, // 'mapos-docker' | 'mapos-lamp' | 'nodejs-pm2' | 'nginx-ssl' | 'docker-compose-stack' | 'backup-cron' | 'firewall-hardening' | 'custom'
      domain = 'seudominio.com',
      vpsIp = '123.45.67.89',
      dbName = 'mapos_db',
      dbUser = 'mapos_user',
      dbPass = 'SenhaSuperSegura123!',
      appPort = '3000',
      customRequirements = '',
    } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'Gemini API Key não encontrada.' });
    }

    const prompt = `
Você é ${assistantProfile.name}, especialista em DevOps e infraestrutura na Hostinger VPS (KVM).
Gere um script completo, profissional, pronto para copiar e colar no terminal do Ubuntu (22.04/24.04) na VPS da Hostinger para a seguinte stack:

Tipo de Stack: ${stackType}
Domínio: ${domain}
IP da VPS: ${vpsIp}
Nome do Banco de Dados: ${dbName}
Usuário do Banco: ${dbUser}
Porta da Aplicação: ${appPort}
Requisitos Extras: ${customRequirements || 'Configuração padrão de alta disponibilidade e segurança para Hostinger'}

O resultado DEVE ser extremamente prático e dividido em:
1. Arquivo de Script Bash principal (ex: setup-hostinger-${stackType}.sh) com comandos para rodar no terminal.
2. Arquivo de configuração de serviço (ex: docker-compose.yml ou /etc/nginx/sites-available/${domain} ou .env).
3. Passo a passo exato para o usuário rodar na Hostinger (como apontar DNS A na Hostinger hPanel, comandos de permissão chmod +x, e validação).
4. Dicas de segurança específicas para VPS Hostinger (UFW, Fail2Ban, portas permitidas).

Seja direta, organizada, educada e meiga como a ${assistantProfile.name}.
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemPrompt('assinante'),
      },
    });

    res.json({
      content: response.text,
      stackType,
      domain,
    });
  } catch (error: any) {
    console.error('VPS Script generation error:', error);
    res.status(500).json({ error: error?.message || 'Erro ao gerar script para VPS.' });
  }
});

// Endpoint: Diagnose VPS logs or errors
app.post('/api/vps/diagnose-log', async (req, res) => {
  try {
    const { logText, image } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'Gemini API Key não encontrada.' });
    }

    const parts: any[] = [];
    if (image && image.data && image.mimeType) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        },
      });
    }

    const prompt = `
Analise este erro ou log de servidor Hostinger VPS / Docker / Nginx / MapOS:
\`\`\`
${logText || 'Analise a imagem enviada com o erro do terminal/painel Hostinger.'}
\`\`\`

Diga com carinho e extrema precisão técnica:
1. Causa raiz exata do problema (ex: porta ocupada, permissão de escrita, MariaDB fora, socket php-fpm incorreto, certificado Let's Encrypt expirado, limite de memória do KVM).
2. Comandos exatos para corrigir agora no terminal SSH da Hostinger.
3. Como evitar que aconteça novamente.
`.trim();

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: getSystemPrompt('assinante'),
      },
    });

    res.json({ diagnosis: response.text });
  } catch (error: any) {
    console.error('Log diagnosis error:', error);
    res.status(500).json({ error: error?.message || 'Erro ao analisar log.' });
  }
});

// Endpoint: Multimodal Mechanical Diagnosis
app.post('/api/diagnose-part', async (req, res) => {
  try {
    const { image, description, machineCategory = 'costura' } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'Gemini API Key não configurada.' });
    }

    if (!image || !image.data) {
      return res.status(400).json({ error: 'Nenhuma imagem fornecida para diagnóstico visual.' });
    }

    const prompt = `
Você é ${assistantProfile.name}, especialista em mecânica de veículos e máquinas de costura (industrial e doméstica).
Analise com atenção a imagem enviada.
Categoria informada: ${machineCategory}
Descrição do sintoma: ${description || 'Nenhum sintoma extra informado pelo usuário.'}

Forneça um relatório diagnóstico estruturado:
1. Identificação da máquina/veículo ou peça visível (Modelo provável, tipo: ex. Reta Industrial SunSpecial/Siruba/Singer/Jack, Overloque, Galoneira, motor de carro, suspensão, alternador, etc.).
2. Análise do defeito ou desgaste visualizado (folga na lançadeira, dente gasto, correia desfiada, quebra de agulha, vazamento de óleo, etc.).
3. Código e Nome da Peça Recomendada para reposição (Lembre-se da regra MapOS de código único).
4. Procedimento de ajuste ou substituição passo a passo para o mecânico.
5. Pergunta diagnóstica curta e direta de fechamento para confirmar o caso com o cliente.
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: image.data,
              mimeType: image.mimeType || 'image/jpeg',
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction: getSystemPrompt('tecnico'),
      },
    });

    res.json({ diagnosis: response.text });
  } catch (error: any) {
    console.error('Part diagnosis error:', error);
    res.status(500).json({ error: error?.message || 'Erro ao diagnosticar peça.' });
  }
});

// Endpoint: MapOS Simulation Data (Anti-duplicity rule & Subscription timeline)
app.get('/api/mapos/data', (req, res) => {
  res.json({
    partsDatabase: [
      { code: 'LAN-JACK-A4', name: 'Lançadeira Completa Jack A4 / A5', category: 'Costura Industrial', stock: 12, costPrice: 'R$ 85,00', salePrice: 'R$ 150,00', compatible: 'Reta Jack A4/A5, Siruba L818' },
      { code: 'BAR-AGU-SIR', name: 'Barra da Agulha Siruba Overloque 747K', category: 'Costura Industrial', stock: 8, costPrice: 'R$ 38,00', salePrice: 'R$ 75,00', compatible: 'Overloque Siruba 747K / 757K' },
      { code: 'COR-DEN-EA888', name: 'Correia Dentada EA888 TSI', category: 'Mecânica Automotiva', stock: 4, costPrice: 'R$ 180,00', salePrice: 'R$ 320,00', compatible: 'VW Golf GTI, Jetta, Audi A3' },
      { code: 'BOM-AGU-AP18', name: 'Bomba d\'Água Motor AP 1.6/1.8/2.0', category: 'Mecânica Automotiva', stock: 6, costPrice: 'R$ 95,00', salePrice: 'R$ 185,00', compatible: 'Gol, Parati, Santana AP' },
      { code: 'LOO-INF-PEG', name: 'Looper Inferior Pegasus M700', category: 'Costura Industrial', stock: 15, costPrice: 'R$ 22,00', salePrice: 'R$ 45,00', compatible: 'Pegasus M700, Yamata 747' },
    ],
    subscriptions: [
      {
        subCode: 'SUB-ELO-8921',
        clientName: 'Oficina Mecânica Precision Car',
        owner: 'Carlos Roberto',
        plan: 'MapOS Pro Cloud + VPS Hostinger',
        dueInDays: 10,
        status: 'AVISO_10_DIAS',
        nextBillingNotice: 'Enviando aviso de cobrança automático de 10 dias.',
        actionRequired: 'Notificação amigável via WhatsApp/E-mail',
      },
      {
        subCode: 'SUB-ELO-4310',
        clientName: 'Ateliê & Confecções Estilo Fino',
        owner: 'Mariana Duarte',
        plan: 'MapOS Costura + Suporte Técnico',
        dueInDays: 5,
        status: 'AVISO_5_DIAS',
        nextBillingNotice: 'Alerta preventivo de 5 dias antes do vencimento.',
        actionRequired: 'Lembrete automático com Pix QR Code',
      },
      {
        subCode: 'SUB-ELO-1198',
        clientName: 'Retífica e Manutenção Nova Iguaçu',
        owner: 'Sérgio Ramos',
        plan: 'MapOS Multi-Técnico',
        dueInDays: 1,
        status: 'AVISO_1_DIA',
        nextBillingNotice: 'Último aviso antes do bloqueio preventivo.',
        actionRequired: 'Cobrança direta com link de renovação',
      },
      {
        subCode: 'SUB-ELO-0042',
        clientName: 'Costura Express Zona Norte',
        owner: 'Juliana Paes',
        plan: 'MapOS Básico',
        dueInDays: -12,
        status: 'BLOQUEADO',
        nextBillingNotice: 'Bloqueado há 12 dias. Política de retenção de 60 dias ativa (48 dias restantes para expurgo com backup).',
        actionRequired: 'Acesso suspenso; aguardando quitação',
      },
    ],
    ordersOfService: [
      { id: 'OS-1048', equipment: 'Máquina Reta Jack A4 (N/S: JK882910)', client: 'Confecções Bela', technician: 'Roberto Técnico', status: 'Em Análise', problem: 'Linha rompendo em alta velocidade e ponto frouxo embaixo' },
      { id: 'OS-1049', equipment: 'Volkswagen Gol G6 1.6 (Placa: KRT-4412)', client: 'Marcos Vinicius', technician: 'Marcos Oficina', status: 'Aguardando Peça', problem: 'Superaquecimento em marcha lenta e vazamento na bomba' },
      { id: 'OS-1050', equipment: 'Galoneira Bracob 3 Agulhas (N/S: BC5512)', client: 'Malharia União', technician: 'Roberto Técnico', status: 'Aprovado', problem: 'Troca de bitola e regulagem do looper' },
    ],
  });
});

// VPS State for real-time metrics simulation
let serverLoadMode: 'normal' | 'spike' | 'backup' = 'normal';
let baseCpu = 22.4;
let baseRam = 2.18;

// Endpoint: Real-time VPS Metrics for Recharts
app.get('/api/vps/metrics', (req, res) => {
  const now = new Date();
  const jitter = (Math.random() - 0.48) * 4;
  
  let targetCpu = baseCpu + jitter;
  let targetRam = baseRam + (Math.random() - 0.5) * 0.1;
  let targetRx = 140 + Math.random() * 80;
  let targetTx = 290 + Math.random() * 120;

  if (serverLoadMode === 'spike') {
    targetCpu = 78.5 + (Math.random() * 12);
    targetRam = 3.45 + (Math.random() * 0.2);
    targetRx = 850 + Math.random() * 300;
    targetTx = 1450 + Math.random() * 400;
  } else if (serverLoadMode === 'backup') {
    targetCpu = 48.0 + (Math.random() * 10);
    targetRam = 2.75 + (Math.random() * 0.15);
  }

  targetCpu = Math.max(8, Math.min(98, parseFloat(targetCpu.toFixed(1))));
  targetRam = Math.max(1.2, Math.min(3.9, parseFloat(targetRam.toFixed(2))));

  const ramUsagePercent = parseFloat(((targetRam / 4.0) * 100).toFixed(1));

  res.json({
    timestamp: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    isoTime: now.toISOString(),
    vpsInfo: {
      plan: 'Hostinger KVM 2 VPS (Cloud NVMe)',
      os: 'Ubuntu 24.04.1 LTS (Noble Numbat)',
      kernel: '6.8.0-45-generic',
      uptime: '18 dias, 6 horas, 24 min',
      ip: '185.193.64.120',
      hostname: 'srv-hostinger-mapos-eloizio',
    },
    cpu: {
      usagePercent: targetCpu,
      cores: 2,
      model: 'AMD EPYC 7702 64-Core Processor (2.00 GHz)',
      loadAvg: [
        parseFloat((targetCpu / 30).toFixed(2)),
        parseFloat((targetCpu / 32).toFixed(2)),
        parseFloat((targetCpu / 35).toFixed(2)),
      ],
      user: parseFloat((targetCpu * 0.65).toFixed(1)),
      system: parseFloat((targetCpu * 0.25).toFixed(1)),
      iowait: parseFloat((targetCpu * 0.1).toFixed(1)),
    },
    ram: {
      totalGB: 4.0,
      usedGB: targetRam,
      freeGB: parseFloat((4.0 - targetRam).toFixed(2)),
      cachedGB: 0.85,
      usagePercent: ramUsagePercent,
      swapTotalGB: 4.0,
      swapUsedGB: 0.32,
      swapPercent: 8.0,
    },
    disk: {
      totalGB: 50.0,
      usedGB: 22.8,
      freeGB: 27.2,
      usagePercent: 45.6,
      iops: Math.floor(1200 + Math.random() * 400),
      readRateMBs: parseFloat((8.5 + Math.random() * 6).toFixed(1)),
      writeRateMBs: parseFloat((4.2 + Math.random() * 4).toFixed(1)),
      partitions: [
        { name: 'Docker (Containers & Imagens)', sizeGB: 11.4, percent: 50.0, fill: '#8b5cf6' },
        { name: 'MapOS & Aplicações PHP/Web', sizeGB: 4.8, percent: 21.0, fill: '#ec4899' },
        { name: 'Banco MariaDB/MySQL', sizeGB: 4.1, percent: 18.0, fill: '#3b82f6' },
        { name: 'Sistema Operacional & Logs', sizeGB: 2.5, percent: 11.0, fill: '#10b981' },
      ],
    },
    network: {
      rxSecKB: parseFloat(targetRx.toFixed(1)),
      txSecKB: parseFloat(targetTx.toFixed(1)),
      totalRxGB: 18.4,
      totalTxGB: 42.1,
    },
    loadMode: serverLoadMode,
    containers: [
      { name: 'mapos_app', image: 'mapos:v4.45', status: 'healthy', cpu: parseFloat((targetCpu * 0.35).toFixed(1)), memMB: 310, port: '8080:80' },
      { name: 'mapos_db', image: 'mariadb:10.11', status: 'healthy', cpu: parseFloat((targetCpu * 0.42).toFixed(1)), memMB: 620, port: '3306:3306' },
      { name: 'nginx_proxy', image: 'nginx:alpine', status: 'healthy', cpu: parseFloat((targetCpu * 0.12).toFixed(1)), memMB: 75, port: '80, 443' },
      { name: 'redis_cache', image: 'redis:7.2-alpine', status: 'healthy', cpu: 0.8, memMB: 48, port: '6379' },
    ],
    topProcesses: [
      { pid: 1842, user: 'mysql', name: 'mysqld --datadir=/var/lib/mysql', cpu: parseFloat((targetCpu * 0.38).toFixed(1)), mem: '14.8%' },
      { pid: 2190, user: 'www-data', name: 'php-fpm: pool www (MapOS)', cpu: parseFloat((targetCpu * 0.28).toFixed(1)), mem: '8.2%' },
      { pid: 912, user: 'root', name: 'dockerd', cpu: parseFloat((targetCpu * 0.11).toFixed(1)), mem: '4.5%' },
      { pid: 1402, user: 'www-data', name: 'nginx: worker process', cpu: parseFloat((targetCpu * 0.08).toFixed(1)), mem: '1.9%' },
      { pid: 745, user: 'root', name: 'fail2ban-server', cpu: 0.2, mem: '0.9%' },
    ],
  });
});

// Endpoint: VPS Actions (Drop caches, restart services, simulate load)
app.post('/api/vps/action', (req, res) => {
  const { action } = req.body;
  
  if (action === 'drop_cache') {
    baseRam = Math.max(1.4, baseRam - 0.5);
    return res.json({ success: true, message: 'sync; echo 3 > /proc/sys/vm/drop_caches executado com sucesso. Memória liberada!' });
  }
  
  if (action === 'simulate_traffic') {
    serverLoadMode = serverLoadMode === 'spike' ? 'normal' : 'spike';
    return res.json({ success: true, mode: serverLoadMode, message: `Modo de carga alterado para: ${serverLoadMode.toUpperCase()}` });
  }

  if (action === 'restart_nginx') {
    return res.json({ success: true, message: 'systemctl reload nginx executado. Configurações recarregadas sem downtime.' });
  }

  if (action === 'optimize_mysql') {
    return res.json({ success: true, message: 'OPTIMIZE TABLE em todas as tabelas do MapOS concluído. Fragmentação reduzida.' });
  }

  res.json({ success: true, message: `Comando ${action} processado com sucesso.` });
});

// Persistent SSH Command Audit Log
const SSH_LOGS_FILE = path.join(__dirname, 'ssh_command_audit.json');

interface SshAuditEntry {
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

let sshAuditLogs: SshAuditEntry[] = [
  {
    id: 'log-101',
    timestamp: '2026-09-26 18:20:14',
    command: 'sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 22/tcp && sudo ufw enable',
    user: 'root',
    host: '185.193.64.120',
    category: 'firewall',
    status: 'success',
    output: 'Rules updated\nRules updated (v6)\nFirewall is active and enabled on system startup',
    durationMs: 420,
  },
  {
    id: 'log-102',
    timestamp: '2026-09-26 18:22:05',
    command: 'docker compose -f /opt/mapos/docker-compose.yml up -d',
    user: 'root',
    host: '185.193.64.120',
    category: 'docker',
    status: 'success',
    output: '[+] Running 4/4\n ✔ Network mapos_default Created\n ✔ Container mapos_db Started (healthy)\n ✔ Container mapos_app Started (healthy)\n ✔ Container nginx_proxy Started (healthy)',
    durationMs: 3850,
  },
  {
    id: 'log-103',
    timestamp: '2026-09-26 18:25:40',
    command: 'nginx -t && systemctl reload nginx',
    user: 'root',
    host: '185.193.64.120',
    category: 'nginx',
    status: 'success',
    output: 'nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful',
    durationMs: 310,
  },
  {
    id: 'log-104',
    timestamp: '2026-09-26 18:30:12',
    command: 'certbot --nginx -d oficina.seusite.com.br --non-interactive --agree-tos',
    user: 'root',
    host: '185.193.64.120',
    category: 'deploy',
    status: 'success',
    output: 'Requesting a certificate for oficina.seusite.com.br\nSuccessfully received certificate.\nCertificate is saved at: /etc/letsencrypt/live/oficina.seusite.com.br/fullchain.pem\nKey is saved at: /etc/letsencrypt/live/oficina.seusite.com.br/privkey.pem\nDeploying certificate\nSuccessfully deployed certificate for oficina.seusite.com.br',
    durationMs: 5400,
  },
];

// Load persisted logs
if (fs.existsSync(SSH_LOGS_FILE)) {
  try {
    const raw = fs.readFileSync(SSH_LOGS_FILE, 'utf-8');
    sshAuditLogs = JSON.parse(raw);
  } catch (err) {
    console.error('Error reading SSH audit logs:', err);
  }
} else {
  try {
    fs.writeFileSync(SSH_LOGS_FILE, JSON.stringify(sshAuditLogs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving initial SSH audit logs:', err);
  }
}

const saveSshLogsToFile = () => {
  try {
    fs.writeFileSync(SSH_LOGS_FILE, JSON.stringify(sshAuditLogs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing SSH logs:', err);
  }
};

// GET: Retrieve SSH command audit logs
app.get('/api/vps/ssh-logs', (req, res) => {
  res.json({ logs: sshAuditLogs });
});

// POST: Execute / Record an SSH command execution
app.post('/api/vps/ssh-run', (req, res) => {
  const { command, host = '185.193.64.120', user = 'root' } = req.body;
  if (!command || !command.trim()) {
    return res.status(400).json({ error: 'Comando não fornecido.' });
  }

  const trimmed = command.trim();
  const startTime = Date.now();
  let category: SshAuditEntry['category'] = 'custom';
  let status: SshAuditEntry['status'] = 'success';
  let output = '';

  // Intelligent simulation of realistic output for common Hostinger VPS commands
  if (trimmed.includes('docker compose ps') || trimmed.includes('docker ps')) {
    category = 'docker';
    output = `NAME                IMAGE               COMMAND                  SERVICE             CREATED             STATUS                    PORTS
mapos_app           mapos:v4.45         "docker-php-entryp..."   mapos_app           2 hours ago         Up 2 hours (healthy)      0.0.0.0:8080->80/tcp
mapos_db            mariadb:10.11       "docker-entrypoint..."   mapos_db            2 hours ago         Up 2 hours (healthy)      127.0.0.1:3306->3306/tcp
nginx_proxy         nginx:alpine        "/docker-entrypoin..."   nginx_proxy         2 hours ago         Up 2 hours (healthy)      0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
redis_cache         redis:7.2-alpine    "docker-entrypoint..."   redis_cache         2 hours ago         Up 2 hours                127.0.0.1:6379->6379/tcp`;
  } else if (trimmed.includes('nginx -t')) {
    category = 'nginx';
    output = `nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful`;
  } else if (trimmed.includes('ufw status')) {
    category = 'firewall';
    output = `Status: active\n\nTo                         Action      From\n--                         ------      ----\n22/tcp (SSH)               ALLOW       Anywhere\n80/tcp (HTTP)              ALLOW       Anywhere\n443/tcp (HTTPS)            ALLOW       Anywhere\n3306/tcp (MySQL)           DENY        Anywhere (Protegido)\n6379/tcp (Redis)           DENY        Anywhere (Protegido)\n22/tcp (v6)                ALLOW       Anywhere (v6)\n80/tcp (v6)                ALLOW       Anywhere (v6)\n443/tcp (v6)               ALLOW       Anywhere (v6)`;
  } else if (trimmed.includes('free -m') || trimmed.includes('free -h')) {
    category = 'system';
    output = `               total        used        free      shared  buff/cache   available\nMem:           3.9Gi       2.1Gi       1.2Gi       140Mi       620Mi       1.6Gi\nSwap:          4.0Gi       320Mi       3.7Gi`;
  } else if (trimmed.includes('df -h')) {
    category = 'system';
    output = `Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda1        49G   23G   25G  48% /\n/dev/vda2       4.0G  320M  3.7G   8% [SWAP]\ntmpfs           392M  1.4M  391M   1% /run`;
  } else if (trimmed.includes('systemctl status nginx') || trimmed.includes('systemctl status php')) {
    category = 'nginx';
    output = `● nginx.service - A high performance web server and a reverse proxy server\n   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)\n   Active: active (running) since Sun 2026-09-26 14:00:12 UTC; 4h 32min ago\n Main PID: 1101 (nginx)\n    Tasks: 3 (limit: 4684)\n   Memory: 78.4M\n   CGroup: /system.slice/nginx.service\n           ├─1101 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;\n           ├─1102 nginx: worker process\n           └─1103 nginx: worker process`;
  } else if (trimmed.includes('drop_caches')) {
    category = 'system';
    output = `[KVM Hostinger] PageCache, dentries and inodes cleared from system RAM.\nMemory freed: ~480MB`;
  } else {
    category = 'custom';
    output = `[root@${host} ~]# ${trimmed}\nComando executado no terminal SSH do VPS Hostinger com código de saída 0 (Sucesso).\nPID de execução: ${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const durationMs = Math.floor(Date.now() - startTime + (Math.random() * 300 + 150));
  const newEntry: SshAuditEntry = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    command: trimmed,
    user,
    host,
    category,
    status,
    output,
    durationMs,
  };

  sshAuditLogs.unshift(newEntry);
  if (sshAuditLogs.length > 100) {
    sshAuditLogs = sshAuditLogs.slice(0, 100);
  }
  saveSshLogsToFile();

  res.json({ success: true, log: newEntry });
});

// DELETE: Clear or reset audit logs
app.delete('/api/vps/ssh-logs', (req, res) => {
  sshAuditLogs = [];
  saveSshLogsToFile();
  res.json({ success: true, message: 'Histórico de comandos SSH limpo com sucesso.' });
});

// Start Server & Vite Middlewares in Dev
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Hostinger VPS & MapOS AI Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Assistant Identity] Name: ${assistantProfile.name} | Creator: ${assistantProfile.creator}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
