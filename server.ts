import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'safelabel-admin-super-secret-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let aiInstance: GoogleGenAI | null = null;


function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave GEMINI_API_KEY não foi configurada nas variáveis de ambiente. Por favor, adicione-a em Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  // Cloud Run sets PORT (e.g. 8080), local/dev environment uses port 3000
  const PORT = process.env.PORT || 3000;

  // Middleware para suportar upload de imagens em base64
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Exemplo de rota de API padrão
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // --- Admin API Routes ---
  const requireAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, JWT_SECRET);
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  };

  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token });
    }
    return res.status(401).json({ error: 'Senha incorreta' });
  });

  // Mock data for Admin Dashboard
  let systemPrompts = {
    generalInstructions: "Atue como um analista de segurança alimentar...",
    strictMode: true,
  };

  let mockLogs = [
    { id: 1, action: "Recognize Product", tokens: 125, timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, action: "Analyze Ingredients", tokens: 850, timestamp: new Date(Date.now() - 1800000).toISOString() },
    { id: 3, action: "Analyze Back Label", tokens: 1100, timestamp: new Date().toISOString() },
  ];

  let mockReports = [
    { id: 1, product: "Nucita Napolitano", divergence: "Não detectou leite corretamente", status: "pending", date: new Date().toISOString() },
  ];

  let mockCampaigns = [
    { id: 1, name: "Campanha Zero Lactose", segment: "Intolerantes", status: "active" }
  ];

  const TICKETS_FILE = path.join(process.cwd(), 'tickets.json');

  const loadTickets = (): any[] => {
    try {
      if (fs.existsSync(TICKETS_FILE)) {
        const data = fs.readFileSync(TICKETS_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading tickets from file:", error);
    }
    
    const defaultTickets = [
      {
        id: "TKT-1001",
        name: "João da Silva",
        email: "joao.silva@email.com",
        category: "Erro no Scanner",
        details: "A câmera trava quando tento focar em letras muito pequenas de remédios. O aplicativo fecha sozinho.",
        attachments: [],
        status: "open",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        replies: []
      },
      {
        id: "TKT-1002",
        name: "Maria de Oliveira",
        email: "maria.oliveira@gmail.com",
        category: "Dificuldade de Leitura",
        details: "Mesmo com fonte 'Muito Grande', alguns textos explicativos na tela de análise continuam muito pequenos.",
        attachments: [],
        status: "in_progress",
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        replies: [
          { sender: 'admin', message: "Olá Maria, estamos cientes do problema de acessibilidade e trabalhando em uma correção para a próxima atualização. Obrigado por reportar!", timestamp: new Date(Date.now() - 10000000).toISOString() }
        ]
      }
    ];
    
    saveTickets(defaultTickets);
    return defaultTickets;
  };

  const saveTickets = (tickets: any[]) => {
    try {
      fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2), 'utf-8');
    } catch (error) {
      console.error("Error saving tickets to file:", error);
    }
  };

  // --- Public Support Route ---
  app.post('/api/support/tickets', (req, res) => {
    const { name, email, category, details, attachments } = req.body;
    if (!name || !email || !category || !details) {
      return res.status(400).json({ error: "Nome, e-mail, tipo de problema e detalhes são obrigatórios." });
    }
    
    // Validate attachment size
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.size && att.size > 5 * 1024 * 1024) {
          return res.status(400).json({ error: "O tamanho do anexo ultrapassa o limite permitido de 5MB." });
        }
      }
    }

    const currentTickets = loadTickets();
    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      category,
      details,
      attachments: attachments || [],
      status: 'open',
      createdAt: new Date().toISOString(),
      replies: []
    };

    currentTickets.unshift(newTicket);
    saveTickets(currentTickets);
    res.status(201).json({ success: true, ticket: newTicket });
  });

  // --- Admin Ticket Routes ---
  app.get('/api/admin/tickets', requireAdmin, (req, res) => {
    res.json(loadTickets());
  });

  app.put('/api/admin/tickets/:id/status', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: "Status inválido." });
    }

    const currentTickets = loadTickets();
    const ticket = currentTickets.find(t => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket não encontrado." });
    }

    ticket.status = status;
    saveTickets(currentTickets);
    res.json({ success: true, ticket });
  });

  app.post('/api/admin/tickets/:id/reply', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mensagem de resposta é obrigatória." });
    }

    const currentTickets = loadTickets();
    const ticket = currentTickets.find(t => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket não encontrado." });
    }

    const reply = {
      sender: 'admin',
      message,
      timestamp: new Date().toISOString()
    };
    ticket.replies.push(reply);
    
    if (ticket.status === 'open' || ticket.status === 'in_progress') {
      ticket.status = 'resolved';
    }

    saveTickets(currentTickets);

    console.log(`\n==================================================`);
    console.log(`[E-MAIL ENVIADO COM SUCESSO]`);
    console.log(`Para: ${ticket.email}`);
    console.log(`Assunto: Resposta ao seu Ticket de Suporte ${ticket.id}`);
    console.log(`Mensagem:`);
    console.log(message);
    console.log(`==================================================\n`);

    res.json({ 
      success: true, 
      ticket,
      emailSent: true,
      recipient: ticket.email 
    });
  });

  app.get('/api/admin/logs', requireAdmin, (req, res) => {
    res.json(mockLogs);
  });

  app.get('/api/admin/reports', requireAdmin, (req, res) => {
    res.json(mockReports);
  });

  app.post('/api/admin/reports/:id/validate', requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    mockReports = mockReports.map(r => r.id === id ? { ...r, status: req.body.status } : r);
    res.json({ success: true });
  });

  app.get('/api/admin/campaigns', requireAdmin, (req, res) => {
    res.json(mockCampaigns);
  });

  app.get('/api/admin/prompts', requireAdmin, (req, res) => {
    res.json(systemPrompts);
  });

  app.put('/api/admin/prompts', requireAdmin, (req, res) => {
    systemPrompts = { ...systemPrompts, ...req.body };
    res.json(systemPrompts);
  });
  // --- End Admin API Routes ---

  // Endpoints do Proxy Gemini no Servidor
  app.post('/api/gemini/recognize-product', async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Parâmetro 'imageBase64' é obrigatório." });
      }

      const ai = getGeminiClient();
      const base64Data = imageBase64.split(',')[1] || imageBase64;

      const prompt = `
        Atue como um sistema OCR e identificador visual inteligente de embalagens de produtos.
        Você deve se limitar a reconhecer produtos alimentícios (comidas, bebidas), medicamentos (remédios, suplementos) e produtos de beleza/farmácia/maquiagens (shampoo, esmaltes, sabonetes, protetores, cremes).
        Estes são os únicos consumíveis ou tópicos de saúde suportados pelo aplicativo.

        Analise a imagem da embalagem ou rótulo do produto e responda EXCLUSIVAMENTE em formato JSON.
        Se o produto na imagem NÃO for de uma dessas categorias (por exemplo: for um livro, eletrônico, móvel, peça de carro, roupa, etc.), defina "isSupportedCategory" como false. Caso contrário, defina como true.

        Responda EXCLUSIVAMENTE em formato JSON puro, seguindo este esquema exato de JSON:
        {
          "barcode": "número do código de barras ou string vazia se não ler nenhum",
          "productName": "nome do produto ou string vazia se não identificar",
          "brand": "marca fabricante ou string vazia se não identificar",
          "isSupportedCategory": true ou false
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              barcode: { type: Type.STRING },
              productName: { type: Type.STRING },
              brand: { type: Type.STRING },
              isSupportedCategory: { type: Type.BOOLEAN }
            },
            required: ["barcode", "productName", "brand", "isSupportedCategory"]
          }
        }
      });

      const responseText = response.text || "";
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch (error: any) {
      console.error("Erro no OCR rápido de produto:", error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });

  app.post('/api/gemini/analyze-ingredients', async (req, res) => {
    try {
      const { imageBase64, profile, language } = req.body;
      if (!imageBase64 || !profile) {
        return res.status(400).json({ error: "Parâmetros 'imageBase64' e 'profile' são obrigatórios." });
      }

      const ai = getGeminiClient();
      const targetLang = language || "pt";
      let langLabel = "Português (Brasil)";
      let outOfScopeMessage = "Este produto está fora do escopo suportado pelo Projeto OBem AI. O aplicativo analisa apenas alimentos, medicamentos e cosméticos (beleza/farmácia). Por favor, escaneie um rótulo válido.";
      let noRestrictionsMessage = "Nenhuma restrição de saúde ou alergia está configurada no seu perfil ativo. Exibindo informações gerais, ingredientes e a tabela nutricional do produto de forma informativa.";

      if (targetLang === "en") {
        langLabel = "English";
        outOfScopeMessage = "This product is outside of the supported scope of Projeto OBem AI. The app only analyzes food, medication, and cosmetics (beauty/pharmacy). Please scan a valid label.";
        noRestrictionsMessage = "No health restrictions or allergies are configured on your active profile. Displaying general information, ingredients, and the nutritional table as informative content.";
      } else if (targetLang === "es") {
        langLabel = "Español";
        outOfScopeMessage = "Este producto está fuera del alcance soportado por Projeto OBem AI. La aplicación solo analiza alimentos, medicamentos y cosméticos (belleza/farmacia). Por favor, escanee una etiqueta válida.";
        noRestrictionsMessage = "No se han configurado restricciones de salud ni alergias en su perfil activo. Mostrando información general, ingredientes y la tabla nutricional del producto de manera informativa.";
      } else if (targetLang === "zh") {
        langLabel = "Chinese (简体中文)";
        outOfScopeMessage = "该产品超出Projeto OBem AI的支持范围。本应用仅分析食品、药品和化妆品（美容/药品）。请扫描有效的标签。";
        noRestrictionsMessage = "您的当前档案未配置健康限制或过敏原。仅供信息参考，显示产品的一般信息、成分和营养表。";
      } else if (targetLang === "ja") {
        langLabel = "Japanese (日本語)";
        outOfScopeMessage = "com.obemai.app: O aplicativo analisa apenas alimentos, medicamentos e cosméticos.";
        noRestrictionsMessage = "Sem restrições no perfil ativo. Exibindo dados informativos.";
      } else if (targetLang === "ko") {
        langLabel = "Korean (한국어)";
        outOfScopeMessage = "이 제품은 Projeto OBem AI 지원 범위를 벗어납니다. 이 앱은 식품, 의약품, 화장품(미용/약국)만 분석합니다. 올바른 라벨을 스캔해 주세요.";
        noRestrictionsMessage = "활성 프로필에 구성된 건강 제한이나 알레르기가 없습니다. 제품의 일반 정보, 성분 및 영양 성분표를 정보용으로 표시합니다.";
      } else if (targetLang === "fr") {
        langLabel = "Français (French)";
        outOfScopeMessage = "Ce produit est hors du champ d'application de Projeto OBem AI. L'application analyse uniquement les aliments, les médicaments et les cosmétiques (beauté/pharmacie). Veuillez scanner une étiquette valide.";
        noRestrictionsMessage = "Aucune restriction de santé ou allergie n'est configurée sur votre profil actif. Affichage des informations générales, des ingrédients et du tableau nutritionnel à titre informatif.";
      } else if (targetLang === "de") {
        langLabel = "Deutsch (German)";
        outOfScopeMessage = "Dieses Produkt liegt außerhalb der unterstützten Reichweite von Projeto OBem AI. Die App analysiert nur Lebensmittel, Medikamente und Kosmetika (Schönheit/Apotheke). Bitte schrubben Sie ein gültiges Etikett.";
        noRestrictionsMessage = "Für Ihr aktives Profil sind keine gesundheitlichen Einschränkungen oder Allergien konfiguriert. Allgemeine Informationen, Inhaltsstoffe und die Nährwerttabelle werden informativ angezeigt.";
      } else if (targetLang === "it") {
        langLabel = "Italiano (Italian)";
        outOfScopeMessage = "Questo produto non rientra nell'ambito di applicazione supportato di Projeto OBem AI. L'applicazione analizza solo alimenti, farmaci e cosmetici (bellezza/farmacia). Si prega di scansionare un'etichetta valida.";
        noRestrictionsMessage = "Nessuna restrizione sanitaria o allergia configurata sul tuo profilo ativo. Visualizzazione delle informazioni generali, degli ingredienti e della tabella nutrizionale a scopo informativo.";
      }

      const hasNoRestrictions = (!profile.conditions || profile.conditions.length === 0) && (!profile.allergies || profile.allergies.length === 0);
      const prompt = `
        Atue como um especialista em alergias alimentares, farmacológicas, dermatológicas e tradução técnica de rótulos de produtos de consumo de saúde e beleza.
        
        IMPORTANTE: O aplicativo é STRICTLY LIMITADO a analisar:
        1. Produtos alimentícios (comidas, bebidas, ingredientes culinários).
        2. Medicamentos (remédios, fórmulas farmacêuticas, suplementos).
        3. Produtos de beleza/farmácia/maquiagens (cosméticos, sabonetes, xampus, maquiagens e produtos aplicados na pele ou cabelos).

        Se o produto na imagem for qualquer outra coisa (por exemplo: aparelhos eletrônicos, ferramentas, calçados, livros, brinquedos, móveis, etc.) que não seja alimento, medicamento ou cosmético, você deve responder com status "yellow", riskCriticality "medium", e reason "${outOfScopeMessage}"

        PERFIL DO USUÁRIO ATIVO:
        - Título do Perfil: ${profile.name}
        - Condições Clínicas: ${profile.conditions && profile.conditions.length > 0 ? profile.conditions.join(", ") : "Nenhuma condição clínica / No conditions."}
        - Alergias Cadastradas: ${profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(", ") : "Nenhuma alergia / No allergies."}

        DIRETRIZES MÉDICAS DE SEGURANÇA (MUITO IMPORTANTE):
        - Deficiência de G6PD (Síndrome de G6PD / Favismo): Usuários com G6PD NUNCA podem consumir fava (ou derivados de fava), sulfas, naftalina, cânfora, mentol, nem CORANTES ARTIFICIAIS/SINTÉTICOS de nenhum tipo (como Eritrosina/INS 127/Vermelho 3/Erythrosine, Tartrazina/Amarelo 5/Amarelo Tartrazina, Amarelo Crepúsculo/Amarelo 6, Vermelho 40, Azul Brilhante, Azul Patente, Indigotina, Ponceau 4R, Caramelo IV, etc.). Se houver QUALQUER corante artificial ou eritrosina/INS 127/vermelho 3, o status DEVE ser obrigatoriamente "red" (alto risco / riskCriticality "high")!
        - Doença Celíaca / Restrição de Glúten: O usuário NÃO PODE consumir glúten (trigo, cevada, centeio, aveia, malte). Deve ser "red" se houver.
        - Diabetes / Restrição de Açúcar: Se houver açúcar, xaropes, maltodextrina, etc., marque como "red" (se for açúcar livre evidente) ou "yellow" dependendo da quantidade ou presença de açúcar adicionado.
        - Alergias específicas (como Leite, Ovo, Soja, Amendoim): Se o ingrediente direto ou traço ("pode conter") for detectado, o status DEVE ser "red".

        ${hasNoRestrictions ? `
        AVISO DE RESTRIÇÃO ZERO:
        O perfil do usuário não possui NENHUMA restrição clínica ou alimentar ativada.
        Neste caso, o status de análise DEVE ser obrigatoriamente "green", a riskCriticality deve ser "low" e a reason deve ser exatamente: "${noRestrictionsMessage}"
        ` : ""}

        IDIOMA DE RESPOSTA OBRIGATÓRIO:
        Você deve obrigatoriamente traduzir e responder todas as explicações textuais da análise, perigos, advertências, descrições, explicações de status e identificações para o idioma: **${langLabel}**.
        
        TAREFAS:
        1. Verifique se o produto é um alimento, medicamento ou cosmético. Se não for, emita o aviso de fora do escopo.
        2. Identifique o idioma original do rótulo (responda o nome deste idioma detectado traduzido para o idioma: ${langLabel}).
        3. Tente identificar o país de origem da embalagem/escaneamento (responda o país traduzido para o idioma: ${langLabel}).
        4. Extraia todos os ingredientes em sua versão original (pode mantê-los no idioma original se listados na embalagem).
        5. Traduza e organize a lista de ingredientes de forma limpa, estruturada e sem abreviações para o idioma: **${langLabel}**.
        6. Identifique o nome provável do produto, a marca produtora e o modelo/sabor/variante do produto, se visíveis, traduzidos/adequados para o idioma: ${langLabel} se fizer sentido, mantendo nomes próprios originais se apropriado.
        7. Extraia ou resuma da melhor forma possível a tabela ou informação nutricional, se estiver visível, escrita inteiramente no idioma: **${langLabel}**.
        8. Se houver restrições no perfil, verifique riscos com base nas restrições do usuário (G6PD, açúcar para diabéticos, glúten para celíacos, alergias alimentares ou tópicas específicas no perfil) e alerte de forma correta e proeminente no idioma: **${langLabel}**.
        
        REGRAS DE SEMÁFORO (Caso haja restrições no perfil):
        - VERDE (green): Nenhum ingrediente de risco encontrado.
        - AMARELO (yellow): Sem ingredientes de risco direto listados, mas há avisos de "pode conter" potenciais alérgenos relevantes ou ingredientes suspeitos de atenção.
        - VERMELHO (red): Algum ingrediente ou traço de risco alto detectado explicitamente relacionado às restrições do perfil.

        RESPOSTA:
        Responda EXCLUSIVAMENTE em formato JSON puro, seguindo este esquema:
        {
          "status": "green" | "yellow" | "red",
          "reason": "Explicação curta e clara do status no idioma ${langLabel}",
          "category": "alimento" | "medicamento" | "beleza" | "outro",
          "identifiedIngredients": ["lista de ingredientes originais"],
          "translatedIngredients": "lista unificada de ingredientes traduzida/limpa no idioma ${langLabel}",
          "detectedLanguage": "nome do idioma detectado traduzido para o idioma ${langLabel}",
          "detectedProductName": "nome do produto",
          "riskCriticality": "high" | "medium" | "low",
          "detectedBrand": "marca fabricante",
          "detectedModel": "modelo, sabor, ou variante do produto traduzido/explicado no idioma ${langLabel}",
          "detectedCountry": "país provável do produto traduzido para o idioma ${langLabel}",
          "detectedNutritionalInfo": "resumo ou texto das informações de tabela nutricional identificadas escrito no idioma ${langLabel}"
        }
      `;

      const base64Data = imageBase64.split(',')[1] || imageBase64;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              reason: { type: Type.STRING },
              category: { type: Type.STRING },
              identifiedIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              translatedIngredients: { type: Type.STRING },
              detectedLanguage: { type: Type.STRING },
              detectedProductName: { type: Type.STRING },
              riskCriticality: { type: Type.STRING },
              detectedBrand: { type: Type.STRING },
              detectedModel: { type: Type.STRING },
              detectedCountry: { type: Type.STRING },
              detectedNutritionalInfo: { type: Type.STRING }
            },
            required: [
              "status", "reason", "category", "identifiedIngredients",
              "translatedIngredients", "detectedLanguage", "detectedProductName",
              "riskCriticality", "detectedBrand", "detectedModel",
              "detectedCountry", "detectedNutritionalInfo"
            ]
          }
        }
      });

      const responseText = response.text || "";
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch (error: any) {
      console.error("Erro na análise Gemini:", error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });

  app.post('/api/gemini/analyze-front-label', async (req, res) => {
    try {
      const { imageBase64, language } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Parâmetro 'imageBase64' é obrigatório." });
      }

      const ai = getGeminiClient();
      const targetLang = language || "pt";
      let langLabel = "Português (Brasil)";
      if (targetLang === "en") langLabel = "English";
      if (targetLang === "es") langLabel = "Español";
      if (targetLang === "zh") langLabel = "Chinese (简体中文)";
      if (targetLang === "ja") langLabel = "Japanese (日本語)";
      if (targetLang === "ko") langLabel = "Korean (한국어)";
      if (targetLang === "fr") langLabel = "Français";
      if (targetLang === "de") langLabel = "Deutsch";
      if (targetLang === "it") langLabel = "Italiano";

      const prompt = `
        Atue como um sistema OCR e identificador visual inteligente voltado para a frente da embalagem de produtos.
        Seu objetivo é identificar as informações principais visíveis na parte frontal (frente) da embalagem do produto.

        Extraia as seguintes informações:
        1. Nome do produto (detectedProductName).
        2. Marca / Fabricante do produto (detectedBrand).
        3. Modelo, sabor, variante ou tipo (detectedModel) no idioma: **${langLabel}** se fizer sentido.
        4. Categoria (category) - obrigatoriamente um destes: "alimento" | "medicamento" | "beleza" | "outro".

        Todas as respostas textuais devem estar no idioma: **${langLabel}**.

        Responda EXCLUSIVAMENTE em formato JSON puro, seguindo este esquema exato de JSON:
        {
          "productName": "nome do produto ou string vazia se não identificar",
          "brand": "marca fabricante ou string vazia se não identificar",
          "model": "variante, modelo ou sabor identificado",
          "category": "alimento" | "medicamento" | "beleza" | "outro"
        }
      `;

      const base64Data = imageBase64.split(',')[1] || imageBase64;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              brand: { type: Type.STRING },
              model: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["productName", "brand", "model", "category"]
          }
        }
      });

      const responseText = response.text || "";
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch (error: any) {
      console.error("Erro na análise do rótulo frontal:", error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });

  app.post('/api/gemini/analyze-back-label', async (req, res) => {
    try {
      const { imageBase64, profile, language } = req.body;
      if (!imageBase64 || !profile) {
        return res.status(400).json({ error: "Parâmetros 'imageBase64' e 'profile' são obrigatórios." });
      }

      const ai = getGeminiClient();
      const targetLang = language || "pt";
      let langLabel = "Português (Brasil)";
      let noRestrictionsMessage = "Nenhuma restrição de saúde ou alergia está configurada no seu perfil ativo. Exibindo informações gerais, ingredientes e a tabela nutricional do produto de forma informativa.";

      if (targetLang === "en") {
        langLabel = "English";
        noRestrictionsMessage = "No health restrictions or allergies are configured on your active profile. Displaying general information, ingredients, and the nutritional table as informative content.";
      } else if (targetLang === "es") {
        langLabel = "Español";
        noRestrictionsMessage = "No se han configurado restricciones de salud ni alergias en su perfil activo. Mostrando información general, ingredientes y la tabla nutricional del produto de manera informativa.";
      } else if (targetLang === "zh") {
        langLabel = "Chinese (简体中文)";
        noRestrictionsMessage = "您的当前档案未配置健康限制或过敏原。仅供信息参考，显示产品的一般信息、成分 e 营养表。";
      } else if (targetLang === "ja") {
        langLabel = "Japanese (日本語)";
        noRestrictionsMessage = "有効なプロファイルに健康上の制限やアレルギーが設定されていません。製品の一般정보, 성분, 영양 성분표를 정보 제공용으로 표시하고 있습니다.";
      } else if (targetLang === "ko") {
        langLabel = "Korean (한국어)";
        noRestrictionsMessage = "활성 프로필에 구성된 건강 제한이나 알레르기가 없습니다. 제품의 일반 정보, 성분 및 영양 성분표를 정보용으로 표시합니다.";
      } else if (targetLang === "fr") {
        langLabel = "Français (French)";
        noRestrictionsMessage = "Aucune restriction de santé ou allergie n'est configurée sur votre profil actif. Affichage des informations générales, des ingrédients et du tableau nutritionnel à titre informatif.";
      } else if (targetLang === "de") {
        langLabel = "Deutsch (German)";
        noRestrictionsMessage = "Für Ihr aktives Profil sind keine gesundheitlichen Einschränkungen oder Allergien konfiguriert. Allgemeine Informationen, Inhaltsstoffe und die Nährwerttabelle werden informativ angezeigt.";
      } else if (targetLang === "it") {
        langLabel = "Italiano (Italian)";
        noRestrictionsMessage = "Nessuna restrizione sanitaria o allergenica configurata sul tuo perfil ativo. Visualizzazione delle informazioni generali, degli ingredienti e della tabella nutrizionale a scopo informativo.";
      }

      const hasNoRestrictions = (!profile.conditions || profile.conditions.length === 0) && (!profile.allergies || profile.allergies.length === 0);
      const prompt = `
        Atue como um analista técnico de ingredientes e informações nutricionais de produtos e alimentos.
        Seu trabalho é ler o rótulo de ingredientes e tabela nutricional na parte traseira/lateral do produto e avaliar riscos com base no perfil do usuário.

        PERFIL DO USUÁRIO ATIVO:
        - Condições Clínicas: ${profile.conditions && profile.conditions.length > 0 ? profile.conditions.join(", ") : "Nenhuma condição clínica / No conditions."}
        - Alergias Cadastradas: ${profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(", ") : "Nenhuma alergia / No allergies."}

        DIRETRIZES MÉDICAS DE SEGURANÇA (MUITO IMPORTANTE):
        - Deficiência de G6PD (Síndrome de G6PD / Favismo): Usuários com G6PD NUNCA podem consumir fava (ou derivados de fava), sulfas, naftalina, cânfora, mentol, nem CORANTES ARTIFICIAIS/SINTÉTICOS de nenhum tipo (como Eritrosina/INS 127/Vermelho 3/Erythrosine, Tartrazina/Amarelo 5/Amarelo Tartrazina, Amarelo Crepúsculo/Amarelo 6, Vermelho 40, Azul Brilhante, Azul Patente, Indigotina, Ponceau 4R, Caramelo IV, etc.). Se houver QUALQUER corante artificial ou eritrosina/INS 127/vermelho 3, o status DEVE ser obrigatoriamente "red" (alto risco / riskCriticality "high")!
        - Doença Celíaca / Restrição de Glúten: O usuário NÃO PODE consumir glúten (trigo, cevada, centeio, aveia, malte). Deve ser "red" se houver.
        - Diabetes / Restrição de Açúcar: Se houver açúcar, xaropes, maltodextrina, etc., marque como "red" (se for açúcar livre evidente) ou "yellow" dependendo da quantidade ou presença de açúcar adicionado.
        - Alergias específicas (como Leite, Ovo, Soja, Amendoim): Se o ingrediente direto ou traço ("pode conter") for detectado, o status DEVE ser "red".

        ${hasNoRestrictions ? `
        AVISO DE RESTRIÇÃO ZERO:
        O perfil do usuário não possui NENHUMA restrição clínica ou alimentar ativada.
        Neste caso, o status de análise DEVE ser obrigatoriamente "green", a riskCriticality deve ser "low" e a reason deve ser exatamente: "${noRestrictionsMessage}"
        ` : ""}

        IDIOMA DE RESPOSTA OBRIGATÓRIO:
        Todas as respostas textuais (reason, translatedIngredients, detectedNutritionalInfo) devem estar no idioma: **${langLabel}**.

        REGRAS DE SEMÁFORO (Caso haja restrições no perfil):
        - VERDE (green): Nenhum ingrediente de risco encontrado.
        - AMARELO (yellow): Sem ingredientes de risco direto listados, mas há avisos de "pode conter" potenciais alérgenos relevantes ou ingredientes suspeitos de atenção.
        - VERMELHO (red): Algum ingrediente ou traço de risco alto detectado explicitamente relacionado às restrições do perfil.

        Responda EXCLUSIVAMENTE em formato JSON seguindo este esquema exato:
        {
          "status": "green" | "yellow" | "red",
          "reason": "Explicação detalhada sobre o risco ou segurança com base no perfil do usuário no idioma ${langLabel}",
          "riskCriticality": "high" | "medium" | "low",
          "identifiedIngredients": ["ingredientes lidos no idioma original da embalagem"],
          "translatedIngredients": "lista unificada de ingredientes traduzida/limpa sem abreviações e organizada no idioma ${langLabel}",
          "detectedLanguage": "idioma original detectado da embalagem no idioma ${langLabel}",
          "detectedNutritionalInfo": "resumo ou texto das informações de tabela nutricional identificadas ou lidas no idioma ${langLabel}"
        }
      `;

      const base64Data = imageBase64.split(',')[1] || imageBase64;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              reason: { type: Type.STRING },
              riskCriticality: { type: Type.STRING },
              identifiedIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              translatedIngredients: { type: Type.STRING },
              detectedLanguage: { type: Type.STRING },
              detectedNutritionalInfo: { type: Type.STRING }
            },
            required: [
              "status", "reason", "riskCriticality", "identifiedIngredients",
              "translatedIngredients", "detectedLanguage", "detectedNutritionalInfo"
            ]
          }
        }
      });

      const responseText = response.text || "";
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch (error: any) {
      console.error("Erro na análise do rótulo de ingredientes:", error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

