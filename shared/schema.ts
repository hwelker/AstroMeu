import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User plans
export type PlanType = "essencia" | "conexao" | "plenitude";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  whatsapp: text("whatsapp").notNull().unique(),
  fullName: text("full_name").notNull(),
  birthDate: date("birth_date").notNull(),
  birthTime: text("birth_time"), // Optional, improves accuracy
  birthCity: text("birth_city").notNull(),
  voicePreference: text("voice_preference").default("feminine"), // masculine or feminine
  notificationTime: text("notification_time").default("08:00"),
  profilePhotoBase64: text("profile_photo_base64"),
  birthState: text("birth_state"),
  plan: text("plan").default("plenitude").notNull(), // essencia, conexao, plenitude (plenitude for dev)
  sunSign: text("sun_sign"),
  moonSign: text("moon_sign"),
  ascendantSign: text("ascendant_sign"),
  termsAccepted: boolean("terms_accepted").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user or assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Daily audios table
export const dailyAudios = pgTable("daily_audios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  audioUrl: text("audio_url"),
  audioBase64: text("audio_base64"),
  transcript: text("transcript").notNull(),
  forDate: date("for_date").notNull(),
  listened: boolean("listened").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Question counts per day for rate limiting
export const dailyQuestionCounts = pgTable("daily_question_counts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionCount: integer("question_count").default(0).notNull(),
  forDate: date("for_date").notNull(),
});

// Partner data for "Radar do Coração" module (Premium/Supreme)
export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  birthDate: date("birth_date").notNull(),
  birthTime: text("birth_time"),
  birthCity: text("birth_city").notNull(),
  birthState: text("birth_state"),
  photoBase64: text("photo_base64"),
  sunSign: text("sun_sign"),
  compatibilityScore: integer("compatibility_score"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Diary entries for "Diário das Estrelas" module (Supreme)
export const diaryEntries = pgTable("diary_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  mood: text("mood"), // ansiosa, feliz, confusa, triste, com_raiva, apaixonada
  aiResponse: text("ai_response"),
  patternDetected: text("pattern_detected"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  sunSign: true,
  moonSign: true,
  ascendantSign: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDailyAudioSchema = createInsertSchema(dailyAudios).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  sunSign: true,
  compatibilityScore: true,
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).omit({
  id: true,
  createdAt: true,
  aiResponse: true,
  patternDetected: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertDailyAudio = z.infer<typeof insertDailyAudioSchema>;
export type DailyAudio = typeof dailyAudios.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type DailyQuestionCount = typeof dailyQuestionCounts.$inferSelect;

// Plan limits
export const planLimits: Record<PlanType, { questionsPerDay: number; audioDuration: string }> = {
  essencia: { questionsPerDay: 3, audioDuration: "1-2 min" },
  conexao: { questionsPerDay: 10, audioDuration: "até 3 min" },
  plenitude: { questionsPerDay: 10, audioDuration: "até 3 min" },
};

// Zodiac signs
export const zodiacSigns = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
] as const;

export type ZodiacSign = typeof zodiacSigns[number];

// Helper to get zodiac sign from birth date
export function getZodiacSign(birthDate: string): ZodiacSign {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Áries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Touro";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gêmeos";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Câncer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leão";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgem";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpião";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitário";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricórnio";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquário";
  return "Peixes";
}
