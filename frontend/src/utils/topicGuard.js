const forbiddenHints = [
  'dog',
  'cat',
  'pet',
  'animal',
  'vet',
  'vaccin',
  'livestock',
  'chicken',
  'cow',
  'goat',
  'agricultural economics',
  'farm economics',
  'commodity price',
  'crop price',
  'market price',
  'landscape architecture',
  'hardscape',
  'patio design',
  'retaining wall',
  'landscape plan',
];

export const isPlantTopicAllowed = (text) => {
  const normalized = (text || '').toLowerCase();
  if (!normalized.trim()) return true;

  for (const hint of forbiddenHints) {
    if (normalized.includes(hint)) return false;
  }
  return true;
};

export const refusalMessage =
  "Sorry — I can only help with the Plant Care & Botany Guide (diagnosing plant diseases from leaf descriptions, watering schedules, and soil pH recommendations for houseplants or garden crops). I can’t help with animal care, agricultural economics, or landscape architecture.";
