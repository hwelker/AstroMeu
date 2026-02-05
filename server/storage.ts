import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  chatMessages,
  dailyAudios,
  dailyQuestionCounts,
  partners,
  diaryEntries,
  getZodiacSign,
  type User,
  type InsertUser,
  type ChatMessage,
  type InsertChatMessage,
  type DailyAudio,
  type InsertDailyAudio,
  type Partner,
  type InsertPartner,
  type DiaryEntry,
  type InsertDiaryEntry,
  type DailyQuestionCount,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWhatsapp(whatsapp: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Chat Messages
  getMessagesByUser(userId: string, limit?: number): Promise<ChatMessage[]>;
  createMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Daily Audios
  getTodayAudio(userId: string): Promise<DailyAudio | undefined>;
  createDailyAudio(audio: InsertDailyAudio): Promise<DailyAudio>;
  markAudioListened(audioId: string): Promise<void>;

  // Question Counts
  getTodayQuestionCount(userId: string): Promise<number>;
  incrementQuestionCount(userId: string): Promise<void>;

  // Partners
  getPartnerByUser(userId: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, updates: Partial<Partner>): Promise<Partner | undefined>;

  // Diary Entries
  getDiaryEntriesByUser(userId: string, limit?: number): Promise<DiaryEntry[]>;
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  updateDiaryEntry(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry | undefined>;
}

class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByWhatsapp(whatsapp: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.whatsapp, whatsapp));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const sunSign = getZodiacSign(insertUser.birthDate);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        sunSign,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Chat Messages
  async getMessagesByUser(userId: string, limit = 50): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);
  }

  async createMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // Daily Audios
  async getTodayAudio(userId: string): Promise<DailyAudio | undefined> {
    const today = new Date().toISOString().split("T")[0];
    const [audio] = await db
      .select()
      .from(dailyAudios)
      .where(and(eq(dailyAudios.userId, userId), eq(dailyAudios.forDate, today)));
    return audio;
  }

  async createDailyAudio(audio: InsertDailyAudio): Promise<DailyAudio> {
    const [newAudio] = await db.insert(dailyAudios).values(audio).returning();
    return newAudio;
  }

  async markAudioListened(audioId: string): Promise<void> {
    await db.update(dailyAudios).set({ listened: true }).where(eq(dailyAudios.id, audioId));
  }

  // Question Counts
  async getTodayQuestionCount(userId: string): Promise<number> {
    const today = new Date().toISOString().split("T")[0];
    const [count] = await db
      .select()
      .from(dailyQuestionCounts)
      .where(and(eq(dailyQuestionCounts.userId, userId), eq(dailyQuestionCounts.forDate, today)));
    return count?.questionCount || 0;
  }

  async incrementQuestionCount(userId: string): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const [existing] = await db
      .select()
      .from(dailyQuestionCounts)
      .where(and(eq(dailyQuestionCounts.userId, userId), eq(dailyQuestionCounts.forDate, today)));

    if (existing) {
      await db
        .update(dailyQuestionCounts)
        .set({ questionCount: existing.questionCount + 1 })
        .where(eq(dailyQuestionCounts.id, existing.id));
    } else {
      await db.insert(dailyQuestionCounts).values({
        userId,
        forDate: today,
        questionCount: 1,
      });
    }
  }

  // Partners
  async getPartnerByUser(userId: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.userId, userId));
    return partner;
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const sunSign = getZodiacSign(partner.birthDate);
    const [newPartner] = await db
      .insert(partners)
      .values({
        ...partner,
        sunSign,
      })
      .returning();
    return newPartner;
  }

  async updatePartner(id: string, updates: Partial<Partner>): Promise<Partner | undefined> {
    const [partner] = await db.update(partners).set(updates).where(eq(partners.id, id)).returning();
    return partner;
  }

  // Diary Entries
  async getDiaryEntriesByUser(userId: string, limit = 30): Promise<DiaryEntry[]> {
    return db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.createdAt))
      .limit(limit);
  }

  async createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry> {
    const [newEntry] = await db.insert(diaryEntries).values(entry).returning();
    return newEntry;
  }

  async updateDiaryEntry(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry | undefined> {
    const [entry] = await db
      .update(diaryEntries)
      .set(updates)
      .where(eq(diaryEntries.id, id))
      .returning();
    return entry;
  }
}

export const storage = new DatabaseStorage();
