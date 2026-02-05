// Zodiac sign utilities and data

export const zodiacSigns = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
] as const;

export type ZodiacSign = typeof zodiacSigns[number];

export const zodiacAbbreviations: Record<ZodiacSign, string> = {
  "Áries": "AR",
  "Touro": "TO",
  "Gêmeos": "GE",
  "Câncer": "CA",
  "Leão": "LE",
  "Virgem": "VI",
  "Libra": "LI",
  "Escorpião": "ES",
  "Sagitário": "SA",
  "Capricórnio": "CP",
  "Aquário": "AQ",
  "Peixes": "PE",
};

export const zodiacElements: Record<ZodiacSign, "Fogo" | "Terra" | "Ar" | "Água"> = {
  "Áries": "Fogo",
  "Touro": "Terra",
  "Gêmeos": "Ar",
  "Câncer": "Água",
  "Leão": "Fogo",
  "Virgem": "Terra",
  "Libra": "Ar",
  "Escorpião": "Água",
  "Sagitário": "Fogo",
  "Capricórnio": "Terra",
  "Aquário": "Ar",
  "Peixes": "Água",
};

export const zodiacDescriptions: Record<ZodiacSign, string> = {
  "Áries": "Pioneiro, corajoso e cheio de energia. Você lidera com paixão.",
  "Touro": "Estável, sensual e determinado. Valoriza segurança e conforto.",
  "Gêmeos": "Curioso, comunicativo e versátil. Sua mente está sempre ativa.",
  "Câncer": "Intuitivo, protetor e emocional. Cuida de quem ama com dedicação.",
  "Leão": "Generoso, criativo e confiante. Brilha onde quer que esteja.",
  "Virgem": "Analítico, dedicado e perfeccionista. Busca sempre melhorar.",
  "Libra": "Harmonioso, diplomático e justo. Busca equilíbrio em tudo.",
  "Escorpião": "Intenso, magnético e transformador. Vive com profundidade.",
  "Sagitário": "Otimista, aventureiro e filosófico. Busca expandir horizontes.",
  "Capricórnio": "Ambicioso, disciplinado e responsável. Constrói para durar.",
  "Aquário": "Inovador, independente e humanitário. Pensa no coletivo.",
  "Peixes": "Sensível, intuitivo e compassivo. Conecta-se com o invisível.",
};

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

export function getZodiacDateRange(sign: ZodiacSign): string {
  const ranges: Record<ZodiacSign, string> = {
    "Áries": "21/03 - 19/04",
    "Touro": "20/04 - 20/05",
    "Gêmeos": "21/05 - 20/06",
    "Câncer": "21/06 - 22/07",
    "Leão": "23/07 - 22/08",
    "Virgem": "23/08 - 22/09",
    "Libra": "23/09 - 22/10",
    "Escorpião": "23/10 - 21/11",
    "Sagitário": "22/11 - 21/12",
    "Capricórnio": "22/12 - 19/01",
    "Aquário": "20/01 - 18/02",
    "Peixes": "19/02 - 20/03",
  };
  return ranges[sign];
}
