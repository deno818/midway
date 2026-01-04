/**
 * Card interface representing a card in the card pool
 */
export interface Card {
  id: string;
  name: string;
  price: number;
}

/**
 * MatchResult interface for algorithm output
 */
export interface MatchResult {
  matched: Card[];
  total: number;
  count: number;
}

/**
 * Matching strategy type
 */
export type MatchingStrategy = 'exact' | 'greedy' | 'dynamic';

/**
 * MatchResultDetailed interface with additional metadata
 */
export interface MatchResultDetailed extends MatchResult {
  strategy: MatchingStrategy;
  timeMs: number;
}

/**
 * Card Pool Matcher Algorithm
 * Provides three strategies to match cards from a pool:
 * - Exact: Find exact sum of 1200 using backtracking
 * - Greedy: Prioritize high-value cards
 * - Dynamic: Use dynamic programming to find optimal solution
 */

/**
 * Exact matching strategy using backtracking
 * Finds combination of cards that exactly sums to target amount
 * @param cardPool - Array of cards to choose from
 * @param targetAmount - Target sum amount (default: 1200)
 * @param maxCards - Maximum number of cards (default: 8)
 * @returns Match result or null if no exact match found
 */
export function matchExact(
  cardPool: Card[],
  targetAmount = 1200,
  maxCards = 8
): MatchResult | null {
  // Sort cards by price descending for better pruning
  const sortedPool = [...cardPool].sort((a, b) => b.price - a.price);
  const result: Card[] = [];

  // Backtracking with pruning
  function backtrack(
    startIndex: number,
    currentSum: number,
    depth: number
  ): boolean {
    // Base case: found exact match
    if (currentSum === targetAmount && depth <= maxCards) {
      return true;
    }

    // Pruning conditions
    if (
      currentSum > targetAmount ||
      depth >= maxCards ||
      startIndex >= sortedPool.length
    ) {
      return false;
    }

    // Try each card starting from current index
    for (let i = startIndex; i < sortedPool.length; i++) {
      // Skip if adding this card exceeds target
      if (currentSum + sortedPool[i].price > targetAmount) {
        continue;
      }

      result.push(sortedPool[i]);
      if (backtrack(i + 1, currentSum + sortedPool[i].price, depth + 1)) {
        return true;
      }
      result.pop();
    }

    return false;
  }

  if (backtrack(0, 0, 0)) {
    const total = result.reduce((sum, card) => sum + card.price, 0);
    return { matched: result, total, count: result.length };
  }

  return null;
}

/**
 * Greedy matching strategy
 * Prioritizes high-value cards to get as close to target as possible
 * @param cardPool - Array of cards to choose from
 * @param targetAmount - Target sum amount (default: 1200)
 * @param maxCards - Maximum number of cards (default: 8)
 * @returns Match result with cards closest to target
 */
export function matchGreedy(
  cardPool: Card[],
  targetAmount = 1200,
  maxCards = 8
): MatchResult {
  // Sort cards by price descending
  const sortedPool = [...cardPool].sort((a, b) => b.price - a.price);
  const result: Card[] = [];
  let total = 0;

  for (let i = 0; i < sortedPool.length && result.length < maxCards; i++) {
    if (total + sortedPool[i].price <= targetAmount) {
      result.push(sortedPool[i]);
      total += sortedPool[i].price;
    }
  }

  return { matched: result, total, count: result.length };
}

/**
 * Dynamic programming matching strategy
 * Finds optimal solution with maximum sum not exceeding target
 * @param cardPool - Array of cards to choose from
 * @param targetAmount - Target sum amount (default: 1200)
 * @param maxCards - Maximum number of cards (default: 8)
 * @returns Match result with optimal combination
 */
export function matchDynamic(
  cardPool: Card[],
  targetAmount = 1200,
  maxCards = 8
): MatchResult {
  // Sort cards by price descending for better cache locality
  const sortedPool = [...cardPool].sort((a, b) => b.price - a.price);
  const n = sortedPool.length;

  // DP table: dp[cardIndex][cardCount][sum] = maxAchievableSum
  // Optimized: we only need previous card count layer
  const dp: number[][][] = [];

  // Initialize DP table
  for (let i = 0; i <= n; i++) {
    dp[i] = [];
    for (let j = 0; j <= maxCards; j++) {
      dp[i][j] = new Array(targetAmount + 1).fill(-1);
    }
  }

  // Base case
  for (let j = 0; j <= maxCards; j++) {
    dp[0][j][0] = 0;
  }

  // Fill DP table
  for (let i = 1; i <= n; i++) {
    const card = sortedPool[i - 1];
    for (let j = 0; j <= maxCards; j++) {
      for (let s = 0; s <= targetAmount; s++) {
        // Don't take current card
        if (dp[i - 1][j][s] >= 0) {
          dp[i][j][s] = dp[i - 1][j][s];
        }
        // Take current card if possible
        if (j > 0 && s >= card.price && dp[i - 1][j - 1][s - card.price] >= 0) {
          dp[i][j][s] = Math.max(
            dp[i][j][s],
            dp[i - 1][j - 1][s - card.price] + card.price
          );
        }
      }
    }
  }

  // Find best sum
  let bestSum = 0;
  let bestCount = 0;
  for (let j = 1; j <= maxCards; j++) {
    for (let s = 0; s <= targetAmount; s++) {
      if (dp[n][j][s] > bestSum) {
        bestSum = dp[n][j][s];
        bestCount = j;
      }
    }
  }

  // Backtrack to find selected cards
  const result: Card[] = [];
  let currentSum = bestSum;
  let currentCount = bestCount;

  for (let i = n; i > 0 && currentCount > 0; i--) {
    const card = sortedPool[i - 1];
    // Check if current card was included
    if (
      currentSum >= card.price &&
      dp[i][currentCount][currentSum] ===
        dp[i - 1][currentCount - 1][currentSum - card.price] + card.price
    ) {
      result.unshift(card);
      currentSum -= card.price;
      currentCount--;
    }
  }

  return { matched: result, total: bestSum, count: result.length };
}

/**
 * Main matching function with strategy selection
 * @param cardPool - Array of cards to choose from
 * @param strategy - Matching strategy ('exact', 'greedy', or 'dynamic')
 * @param targetAmount - Target sum amount (default: 1200)
 * @param maxCards - Maximum number of cards (default: 8)
 * @returns Detailed match result
 */
export function matchCards(
  cardPool: Card[],
  strategy: MatchingStrategy = 'exact',
  targetAmount = 1200,
  maxCards = 8
): MatchResultDetailed {
  const startTime = performance.now();
  let result: MatchResult;

  switch (strategy) {
    case 'exact':
      result = matchExact(cardPool, targetAmount, maxCards) || {
        matched: [],
        total: 0,
        count: 0,
      };
      break;
    case 'greedy':
      result = matchGreedy(cardPool, targetAmount, maxCards);
      break;
    case 'dynamic':
      result = matchDynamic(cardPool, targetAmount, maxCards);
      break;
    default:
      throw new Error(`Unknown strategy: ${strategy}`);
  }

  const endTime = performance.now();

  return {
    ...result,
    strategy,
    timeMs: endTime - startTime,
  };
}

/**
 * Find all possible exact matches within constraints
 * @param cardPool - Array of cards to choose from
 * @param targetAmount - Target sum amount (default: 1200)
 * @param maxCards - Maximum number of cards (default: 8)
 * @returns Array of all matching combinations
 */
export function findAllMatches(
  cardPool: Card[],
  targetAmount = 1200,
  maxCards = 8
): MatchResult[] {
  const results: MatchResult[] = [];
  const sortedPool = [...cardPool].sort((a, b) => b.price - a.price);
  const current: Card[] = [];
  const seen = new Set<string>();

  function backtrack(
    startIndex: number,
    currentSum: number,
    depth: number
  ): void {
    if (currentSum === targetAmount && depth <= maxCards) {
      // Create sorted signature to avoid duplicates
      const signature = current
        .map(c => `${c.id}:${c.price}`)
        .sort()
        .join('|');
      if (!seen.has(signature)) {
        seen.add(signature);
        results.push({
          matched: [...current],
          total: currentSum,
          count: current.length,
        });
      }
      return;
    }

    if (
      currentSum > targetAmount ||
      depth >= maxCards ||
      startIndex >= sortedPool.length
    ) {
      return;
    }

    for (let i = startIndex; i < sortedPool.length; i++) {
      if (currentSum + sortedPool[i].price > targetAmount) {
        continue;
      }

      current.push(sortedPool[i]);
      backtrack(i + 1, currentSum + sortedPool[i].price, depth + 1);
      current.pop();
    }
  }

  backtrack(0, 0, 0);
  return results;
}

/**
 * Validate card pool data
 * @param cardPool - Array of cards to validate
 * @returns True if valid, false otherwise
 */
export function validateCardPool(cardPool: any): boolean {
  if (!Array.isArray(cardPool) || cardPool.length === 0) {
    return false;
  }

  return cardPool.every(
    card =>
      typeof card === 'object' &&
      card !== null &&
      typeof card.id === 'string' &&
      typeof card.name === 'string' &&
      typeof card.price === 'number' &&
      card.price > 0 &&
      card.price <= 500
  );
}
