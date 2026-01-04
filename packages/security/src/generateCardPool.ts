import { Card } from './cardPoolMatcher';

/**
 * Card pool generation options
 */
export interface GenerateCardPoolOptions {
  minCards?: number;
  maxCards?: number;
  minPrice?: number;
  maxPrice?: number;
  allowDuplicates?: boolean;
  cardNames?: string[];
}

/**
 * Default card names for generation
 */
const DEFAULT_CARD_NAMES = [
  'Warrior',
  'Mage',
  'Archer',
  'Knight',
  'Dragon',
  'Phoenix',
  'Wizard',
  'Berserker',
  'Healer',
  'Rogue',
  'Paladin',
  'Necromancer',
  'Assassin',
  'Monk',
  'Bard',
  'Druid',
  'Ranger',
  'Cleric',
  'Sorcerer',
  'Summoner',
];

/**
 * Generate a random integer between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random card pool
 * @param options - Generation options
 * @returns Generated card pool
 */
export function generateCardPool(
  options: GenerateCardPoolOptions = {}
): Card[] {
  const {
    minCards = 50,
    maxCards = 200,
    minPrice = 50,
    maxPrice = 500,
    allowDuplicates = true,
    cardNames = DEFAULT_CARD_NAMES,
  } = options;

  const cardCount = randomInt(minCards, maxCards);
  const pool: Card[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < cardCount; i++) {
    const name = cardNames[randomInt(0, cardNames.length - 1)];
    const price = randomInt(minPrice, maxPrice);
    const id = allowDuplicates
      ? `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      : `card-${name.toLowerCase()}-${price}`;

    if (allowDuplicates || !usedIds.has(id)) {
      usedIds.add(id);
      let cardName = name;
      if (allowDuplicates) {
        const count = pool.filter(c => c.name.includes(name)).length + 1;
        cardName = `${name} #${count}`;
      }
      pool.push({
        id,
        name: cardName,
        price,
      });
    }
  }

  return pool;
}

/**
 * Generate a card pool guaranteed to have exact matches
 * @param targetAmount - Target sum amount (default: 1200)
 * @param poolSize - Total number of cards in pool
 * @param exactMatchCount - Number of exact matches to guarantee
 * @returns Card pool with guaranteed solutions
 */
export function generateSolvableCardPool(
  _targetAmount = 1200,
  poolSize = 100,
  exactMatchCount = 5
): Card[] {
  const pool: Card[] = [];
  const usedIds = new Set<string>();

  // Predefined valid combinations for 1200 with prices 50-500
  const validCombinations = [
    [400, 400, 400],
    [300, 300, 300, 300],
    [200, 200, 200, 200, 200, 200],
    [150, 150, 150, 150, 150, 150, 150, 150],
    [500, 400, 300],
    [500, 500, 200],
    [500, 350, 350],
    [250, 250, 250, 225, 225],
  ];

  // Generate guaranteed exact matches
  for (let m = 0; m < exactMatchCount; m++) {
    const prices = validCombinations[m % validCombinations.length];
    const matchCards: Card[] = [];

    for (let c = 0; c < prices.length; c++) {
      const name =
        DEFAULT_CARD_NAMES[randomInt(0, DEFAULT_CARD_NAMES.length - 1)];
      const id = `card-solution-${m}-${c}`;

      matchCards.push({ id, name, price: prices[c] });
    }

    // Add match cards to pool
    for (const card of matchCards) {
      if (!usedIds.has(card.id)) {
        usedIds.add(card.id);
        pool.push(card);
      }
    }
  }

  // Fill remaining pool with random cards
  const remainingSize = poolSize - pool.length;
  if (remainingSize > 0) {
    const randomCards = generateCardPool({
      minCards: remainingSize,
      maxCards: remainingSize,
      allowDuplicates: true,
    });
    pool.push(...randomCards);
  }

  // Shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool;
}

/**
 * Generate a card pool with no exact matches possible
 * @param targetAmount - Target sum amount (default: 1200)
 * @param poolSize - Total number of cards in pool
 * @returns Card pool with no solutions
 */
export function generateUnsolvableCardPool(
  _targetAmount = 1200,
  poolSize = 50
): Card[] {
  // Use prices that cannot sum to 1200
  // For example, only prices that are multiples of 7 (1200 is not divisible by 7)
  const incompatiblePrices = [7, 14, 21, 28, 35, 42, 49, 56, 63, 70];
  const pool: Card[] = [];

  for (let i = 0; i < poolSize; i++) {
    const name =
      DEFAULT_CARD_NAMES[randomInt(0, DEFAULT_CARD_NAMES.length - 1)];
    const price =
      incompatiblePrices[randomInt(0, incompatiblePrices.length - 1)];
    const id = `card-nosolution-${i}`;

    pool.push({ id, name, price });
  }

  return pool;
}

/**
 * Generate a card pool for performance testing (large scale)
 * @param size - Number of cards in pool
 * @returns Large card pool for performance testing
 */
export function generateLargeCardPool(size = 1000): Card[] {
  return generateCardPool({
    minCards: size,
    maxCards: size,
    allowDuplicates: true,
  });
}

/**
 * Generate a card pool for edge case testing
 * @param scenario - Type of edge case scenario
 * @returns Card pool designed for specific edge case
 */
export function generateEdgeCaseCardPool(
  scenario: 'minimum' | 'maximum' | 'single' | 'boundary'
): Card[] {
  switch (scenario) {
    case 'minimum':
      // Minimum prices that can sum to 1200
      return [
        { id: 'c1', name: 'Card1', price: 600 },
        { id: 'c2', name: 'Card2', price: 600 },
      ];

    case 'maximum':
      // Maximum cards (8) with minimum prices
      return Array.from({ length: 8 }, (_, i) => ({
        id: `c${i}`,
        name: `Card${i}`,
        price: 150,
      }));

    case 'single':
      // Single card matching exactly
      return [{ id: 'c1', name: 'SuperCard', price: 1200 }];

    case 'boundary':
      // Cards just at boundary values
      return [
        { id: 'c1', name: 'Card1', price: 50 },
        { id: 'c2', name: 'Card2', price: 500 },
        { id: 'c3', name: 'Card3', price: 150 },
        { id: 'c4', name: 'Card4', price: 500 },
      ];

    default:
      return generateCardPool();
  }
}

/**
 * Export card pool to JSON string
 * @param pool - Card pool to export
 * @returns JSON string representation
 */
export function exportCardPoolToJson(pool: Card[]): string {
  return JSON.stringify(pool, null, 2);
}

/**
 * Import card pool from JSON string
 * @param jsonString - JSON string to import
 * @returns Imported card pool
 */
export function importCardPoolFromJson(jsonString: string): Card[] {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid format: expected array');
    }
    return parsed as Card[];
  } catch (error) {
    throw new Error(
      `Failed to import card pool: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Calculate statistics for a card pool
 * @param pool - Card pool to analyze
 * @returns Statistics object
 */
export function calculatePoolStatistics(pool: Card[]): {
  totalCards: number;
  totalPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceDistribution: Record<number, number>;
} {
  const prices = pool.map(c => c.price);
  const totalPrice = prices.reduce((sum, p) => sum + p, 0);
  const priceDistribution: Record<number, number> = {};

  for (const price of prices) {
    priceDistribution[price] = (priceDistribution[price] || 0) + 1;
  }

  return {
    totalCards: pool.length,
    totalPrice,
    averagePrice: totalPrice / pool.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    priceDistribution,
  };
}
