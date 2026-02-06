import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { storage } from "./storage";
import { insertUserSchema, insertPartnerSchema, planLimits, type PlanType } from "@shared/schema";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const ASTROLOGY_SYSTEM_PROMPT = `Você é uma astróloga experiente e acolhedora chamada Luna. Você oferece orientação astrológica personalizada com empatia e sabedoria.

Seu estilo de comunicação:
- Acolhedora e empática
- Use linguagem simples e acessível
- Conecte insights astrológicos com situações práticas do dia a dia
- Limite suas respostas a 300 palavras
- Sempre termine com uma pergunta reflexiva ou sugestão prática

Você NÃO responde sobre:
- Questões médicas ou de saúde
- Questões legais
- Investimentos financeiros específicos

Quando a pergunta envolver esses temas, gentilmente oriente a pessoa a buscar um profissional especializado.

Formato da resposta:
1. Acolhimento emocional breve
2. Conexão com aspectos astrológicos relevantes
3. Insight ou orientação prática
4. Pergunta reflexiva ou sugestão para o dia`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Login (stub - authentication not fully implemented yet)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Email não encontrado. Crie uma conta primeiro." });
      }
      res.json({ userId: user.id });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Create user
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Este email já está cadastrado" });
      }
      const existingWhatsapp = await storage.getUserByWhatsapp(validatedData.whatsapp);
      if (existingWhatsapp) {
        return res.status(400).json({ error: "Este WhatsApp já está cadastrado" });
      }
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  });

  // Update user
  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const updateSchema = insertUserSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const user = await storage.updateUser(req.params.id, validatedData);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  });

  // Get chat messages for user
  app.get("/api/users/:id/messages", async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessagesByUser(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Erro ao buscar mensagens" });
    }
  });

  // Send chat message with streaming response
  app.post("/api/users/:id/messages", async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const { content } = req.body;

      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Mensagem é obrigatória" });
      }
      if (content.length > 500) {
        return res.status(400).json({ error: "Mensagem muito longa (máximo 500 caracteres)" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const plan = user.plan as PlanType;
      const limit = planLimits[plan]?.questionsPerDay || 3;
      const currentCount = await storage.getTodayQuestionCount(userId);

      if (currentCount >= limit) {
        return res.status(429).json({
          error: "Limite de perguntas atingido para hoje",
          limit,
          count: currentCount,
        });
      }

      await storage.createMessage({ userId, role: "user", content });
      await storage.incrementQuestionCount(userId);

      const recentMessages = await storage.getMessagesByUser(userId, 30);
      const chatHistory = recentMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const userContext = `
Informações da usuária:
- Nome: ${user.fullName}
- Signo Solar: ${user.sunSign || "Não informado"}
- Cidade de nascimento: ${user.birthCity}
- Plano: ${user.plan}
`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ASTROLOGY_SYSTEM_PROMPT + "\n\n" + userContext },
          ...chatHistory,
        ],
        stream: true,
        max_tokens: 500,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      await storage.createMessage({ userId, role: "assistant", content: fullResponse });
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Erro ao processar mensagem" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Erro ao processar mensagem" });
      }
    }
  });

  // Get today's question count
  app.get("/api/users/:id/questions/count", async (req: Request, res: Response) => {
    try {
      const count = await storage.getTodayQuestionCount(req.params.id);
      res.json(count);
    } catch (error) {
      console.error("Error fetching question count:", error);
      res.status(500).json({ error: "Erro ao buscar contagem de perguntas" });
    }
  });

  // Get today's audio for user
  app.get("/api/users/:id/audio/today", async (req: Request, res: Response) => {
    try {
      const audio = await storage.getTodayAudio(req.params.id);
      res.json(audio || null);
    } catch (error) {
      console.error("Error fetching today's audio:", error);
      res.status(500).json({ error: "Erro ao buscar áudio do dia" });
    }
  });

  // Mark audio as listened
  app.patch("/api/audio/:id/listened", async (req: Request, res: Response) => {
    try {
      await storage.markAudioListened(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking audio as listened:", error);
      res.status(500).json({ error: "Erro ao marcar áudio como ouvido" });
    }
  });

  // Generate daily audio for user
  app.post("/api/users/:id/audio/generate", async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const existingAudio = await storage.getTodayAudio(userId);
      if (existingAudio) {
        return res.json(existingAudio);
      }

      const recentMessages = await storage.getMessagesByUser(userId, 10);
      const recentContext = recentMessages
        .slice(-5)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const scriptPrompt = `Você é uma astróloga chamada Luna. Crie uma mensagem matinal personalizada e acolhedora para ${user.fullName.split(" ")[0]}, 
que é do signo de ${user.sunSign}. 

A mensagem deve:
- Durar entre 1-2 minutos quando falada
- Começar com uma saudação calorosa usando o nome da pessoa
- Mencionar algo relevante sobre o signo e o momento astrológico atual
- Dar uma orientação prática para o dia
- Terminar com palavras de encorajamento

${recentContext ? `Contexto das últimas conversas:\n${recentContext}` : ""}

Escreva apenas o texto do áudio, sem marcações ou instruções.`;

      const scriptResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: scriptPrompt }],
        max_tokens: 500,
      });

      const transcript = scriptResponse.choices[0]?.message?.content || "";
      const today = new Date().toISOString().split("T")[0];
      const audio = await storage.createDailyAudio({
        userId,
        transcript,
        audioBase64: null,
        forDate: today,
        listened: false,
      });

      res.json(audio);
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ error: "Erro ao gerar áudio" });
    }
  });

  // ============================================
  // PARTNER / RADAR DO CORAÇÃO ENDPOINTS
  // ============================================

  // Get partner for user
  app.get("/api/users/:id/partner", async (req: Request, res: Response) => {
    try {
      const partner = await storage.getPartnerByUser(req.params.id);
      res.json(partner || null);
    } catch (error) {
      console.error("Error fetching partner:", error);
      res.status(500).json({ error: "Erro ao buscar parceiro" });
    }
  });

  // Get partners list for user (legacy support)
  app.get("/api/users/:id/partners", async (req: Request, res: Response) => {
    try {
      const partnersList = await storage.getPartnersByUser(req.params.id);
      res.json(partnersList);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ error: "Erro ao buscar parceiros" });
    }
  });

  // Create partner
  app.post("/api/users/:id/partner", async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const existing = await storage.getPartnerByUser(userId);
      if (existing) {
        return res.status(400).json({ error: "Já existe um parceiro cadastrado" });
      }

      const partnerData = {
        ...req.body,
        userId,
      };

      const validated = insertPartnerSchema.parse(partnerData);
      const partner = await storage.createPartner(validated);

      const score = Math.floor(Math.random() * 30) + 65;
      const breakdown = JSON.stringify({
        communication: Math.floor(Math.random() * 25) + 70,
        intimacy: Math.floor(Math.random() * 30) + 60,
        conflicts: Math.floor(Math.random() * 40) + 40,
        goals: Math.floor(Math.random() * 25) + 65,
        values: Math.floor(Math.random() * 25) + 70,
      });

      const updatedPartner = await storage.updatePartner(partner.id, {
        compatibilityScore: score,
        compatibilityBreakdown: breakdown,
      });

      res.status(201).json(updatedPartner || partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Error creating partner:", error);
      res.status(500).json({ error: "Erro ao cadastrar parceiro" });
    }
  });

  // Get today's insight for partner (returns mock data if no real data)
  app.get("/api/partner/:id/insight/today", async (req: Request, res: Response) => {
    try {
      const partnerId = req.params.id;
      const insight = await storage.getTodayInsight(partnerId);

      if (insight) {
        res.json({
          ...insight,
          favorableTopics: JSON.parse(insight.favorableTopics),
          avoidTopics: JSON.parse(insight.avoidTopics),
          astrologicalInfluences: insight.astrologicalInfluences ? JSON.parse(insight.astrologicalInfluences) : null,
        });
        return;
      }

      res.json({
        temperatureScore: 75,
        temperatureLabel: "Quente",
        dayQuality: "good",
        mainMessage: "Hoje é um bom dia para conversas profundas. Vênus está favorável e a energia entre vocês está fluindo de forma harmoniosa.",
        favorableTopics: ["planos futuros", "demonstrações de carinho", "viagens"],
        avoidTopics: ["dinheiro", "ex-relacionamentos", "críticas"],
        bestTimeToTalk: "à noite, após 20h",
        astrologicalInfluences: {
          mainPlanet: "Vênus",
          aspect: "Trígono com sua Lua",
          effect: "Favorece romantismo e compreensão mútua",
        },
      });
    } catch (error) {
      console.error("Error fetching today insight:", error);
      res.status(500).json({ error: "Erro ao buscar insight do dia" });
    }
  });

  // Get 7-day forecast for partner (mock data)
  app.get("/api/partner/:id/forecast", async (req: Request, res: Response) => {
    try {
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const qualities = ["excellent", "good", "neutral", "careful", "good", "excellent", "good"];
      const temperatures = [90, 70, 55, 45, 75, 92, 78];
      const messages = [
        "Dia perfeito para romance e conexão profunda",
        "Bom dia para fazer planos juntos",
        "Dia neutro, mantenha a calma e a rotina",
        "Evite discussões sérias, energia tensa",
        "Bom momento para conversas sobre o futuro",
        "Energia incrível para surpresas românticas",
        "Ótimo para atividades em casal",
      ];

      const today = new Date();
      const forecast = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return {
          date: i === 0 ? "Hoje" : i === 1 ? "Amanhã" : days[date.getDay()],
          dateFormatted: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          quality: qualities[i],
          temperature: temperatures[i],
          message: messages[i],
        };
      });

      res.json(forecast);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      res.status(500).json({ error: "Erro ao buscar previsão" });
    }
  });

  // Get partner questions
  app.get("/api/partner/:id/questions", async (req: Request, res: Response) => {
    try {
      const questions = await storage.getPartnerQuestions(req.params.id);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching partner questions:", error);
      res.status(500).json({ error: "Erro ao buscar perguntas" });
    }
  });

  // Get today's partner question count
  app.get("/api/partner/:id/questions/count", async (req: Request, res: Response) => {
    try {
      const count = await storage.getTodayPartnerQuestionCount(req.params.id);
      res.json(count);
    } catch (error) {
      console.error("Error fetching question count:", error);
      res.status(500).json({ error: "Erro ao buscar contagem" });
    }
  });

  // Ask partner question (streaming mock response for now)
  app.post("/api/partner/:id/questions", async (req: Request, res: Response) => {
    try {
      const partnerId = req.params.id;
      const { question, userId } = req.body;

      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Pergunta é obrigatória" });
      }

      const todayCount = await storage.getTodayPartnerQuestionCount(partnerId);
      if (todayCount >= 3) {
        return res.status(429).json({ error: "Limite de 3 perguntas por dia atingido" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const mockAnswer = `Querida, que pergunta interessante sobre o seu relacionamento! Analisando os astros e a energia entre vocês, posso perceber que este é um momento de grande transformação. Vênus está em trânsito favorável, o que traz oportunidades de conexão mais profunda. Confie na sua intuição e permita-se ser vulnerável. As estrelas indicam que a comunicação honesta será a chave para fortalecer o vínculo entre vocês.`;

      const words = mockAnswer.split(" ");
      let fullContent = "";

      for (let i = 0; i < words.length; i++) {
        const word = (i > 0 ? " " : "") + words[i];
        fullContent += word;
        res.write(`data: ${JSON.stringify({ content: word })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      await storage.createPartnerQuestion({
        partnerId,
        userId: userId || "unknown",
        question,
        answer: fullContent,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error processing partner question:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Erro ao processar pergunta" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Erro ao processar pergunta" });
      }
    }
  });

  return httpServer;
}
