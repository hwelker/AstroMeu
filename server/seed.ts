import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const sampleUsers = [
  {
    email: "julia.silva@example.com",
    whatsapp: "11999887766",
    fullName: "Júlia Silva Santos",
    birthDate: "1996-07-15",
    birthTime: "14:30",
    birthCity: "São Paulo, SP",
    voicePreference: "feminine",
    plan: "essencia",
    sunSign: "Câncer",
    termsAccepted: true,
  },
  {
    email: "ana.costa@example.com",
    whatsapp: "21988776655",
    fullName: "Ana Paula Costa",
    birthDate: "1988-11-22",
    birthTime: "08:15",
    birthCity: "Rio de Janeiro, RJ",
    voicePreference: "feminine",
    plan: "conexao",
    sunSign: "Escorpião",
    termsAccepted: true,
  },
  {
    email: "maria.oliveira@example.com",
    whatsapp: "31977665544",
    fullName: "Maria Fernanda Oliveira",
    birthDate: "1992-03-28",
    birthTime: "22:00",
    birthCity: "Belo Horizonte, MG",
    voicePreference: "feminine",
    plan: "plenitude",
    sunSign: "Áries",
    termsAccepted: true,
  },
];

export async function seedDatabase() {
  console.log("Checking if seed data is needed...");

  for (const userData of sampleUsers) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email));

    if (existing.length === 0) {
      console.log(`Creating seed user: ${userData.fullName}`);
      await db.insert(users).values(userData);
    }
  }

  console.log("Seed complete.");
}
