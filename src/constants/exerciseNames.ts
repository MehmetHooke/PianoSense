// src/utils/exerciseNames.ts

export const EXERCISE_NAMES: Record<number, string> = {
  1: "Başlangıç",
  2: "Devler",
  3: "Tren",
  4: "Zaman",
  5: "Sinyal",
  6: "Korna",
  7: "Ağaçkakan",
  8: "Ağustos Böceği",
  9: "Rüzgâr",
  10: "Zıplayan Top",
  11: "Saklambaç",
  12: "Seksek",
  13: "Mutlu Periler",
  14: "Meraklı Kuş",
  15: "Zıpır Kedi",
  16: "Zıp Zıp Kurbağa",
  17: "Kanguru",
  18: "Masal Ormanı",
  19: "Oyun Oynayan Çocuk",
  20: "Ağır Taş",
  21: "Üzgün Bulut",
  22: "Elma Kurdu",
  23: "Uçuşan Kelebek",
  24: "Topaç",
  25: "Neşeli Penguen",
  26: "Koca Fil",
  27: "Yürüyen Merdiven",
  28: "Minik Kuzu",
  29: "Akşam Yürüyüşü",
  30: "Güvercin",
  31: "Tahterevalli",
  32: "Mutlu Gezegen",
  33: "Neşeli Tırtıl",
  34: "Ördek",
  35: "Küçük Gezgin",
  36: "Dans Eden Ağaçlar",
  37: "Parlayan Yıldızlar",
  38: "Beethoven 9. Senfoniden Bir Tema",
  39: "Anne Sevgisi",
  40: "Uyku",
  41: "Gökkuşağı",
  42: "Şakacı",
  43: "Küçük Tavşan",
  44: "İstasyon",
};

export function getExerciseTitle(order?: number) {
  if (!order) {
    return "Egzersiz";
  }

  const name = EXERCISE_NAMES[order];

  return name ? `Ezgi ${order} - ${name}` : `Ezgi ${order}`;
}
