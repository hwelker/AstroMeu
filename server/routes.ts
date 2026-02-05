import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { storage } from "./storage";
import { insertUserSchema, planLimits, type PlanType } from "@shared/schema";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// System prompt for the astrological AI
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
  // Create user
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Check for existing email or whatsapp
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
      // Validate with partial schema for updates
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

      // Get user and check plan limits
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

      // Save user message
      await storage.createMessage({
        userId,
        role: "user",
        content,
      });

      // Increment question count
      await storage.incrementQuestionCount(userId);

      // Get recent conversation history
      const recentMessages = await storage.getMessagesByUser(userId, 30);
      const chatHistory = recentMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Build context with user's astrological info
      const userContext = `
Informações da usuária:
- Nome: ${user.fullName}
- Signo Solar: ${user.sunSign || "Não informado"}
- Cidade de nascimento: ${user.birthCity}
- Plano: ${user.plan}
`;

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from OpenAI using gpt-5-mini for cost efficiency
      const stream = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: ASTROLOGY_SYSTEM_PROMPT + "\n\n" + userContext },
          ...chatHistory,
        ],
        stream: true,
        max_completion_tokens: 500,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant message
      await storage.createMessage({
        userId,
        role: "assistant",
        content: fullResponse,
      });

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

  // Generate daily audio for user (can be called by cron or manually)
  app.post("/api/users/:id/audio/generate", async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Check if audio already exists for today
      const existingAudio = await storage.getTodayAudio(userId);
      if (existingAudio) {
        return res.json(existingAudio);
      }

      // Get recent conversation context
      const recentMessages = await storage.getMessagesByUser(userId, 10);
      const recentContext = recentMessages
        .slice(-5)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      // Generate personalized audio script
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
        model: "gpt-5-mini",
        messages: [{ role: "user", content: scriptPrompt }],
        max_completion_tokens: 500,
      });

      const transcript = scriptResponse.choices[0]?.message?.content || "";

      // For now, save transcript only (TTS can be added later with proper model)
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

  return httpServer;
}
