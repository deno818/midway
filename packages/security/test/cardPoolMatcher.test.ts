import {
  matchCards,
  matchExact,
  matchGreedy,
  matchDynamic,
  findAllMatches,
  validateCardPool,
  Card,
} from '../src/cardPoolMatcher';
import {
  generateCardPool,
  generateSolvableCardPool,
  generateUnsolvableCardPool,
  generateLargeCardPool,
  generateEdgeCaseCardPool,
  calculatePoolStatistics,
} from '../src/generateCardPool';

describe('Card Pool Matcher', () => {
  describe('Exact Matching', () => {
    test('should find exact match when solution exists', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 300 },
        { id: '2', name: 'Card2', price: 400 },
        { id: '3', name: 'Card3', price: 500 },
      ];

      const result = matchExact(pool, 1200, 8);
      expect(result).not.toBeNull();
      expect(result?.total).toBe(1200);
      expect(result?.count).toBe(3);
    });

    test('should return null when no exact match exists', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 100 },
        { id: '2', name: 'Card2', price: 200 },
        { id: '3', name: 'Card3', price: 300 },
      ];

      const result = matchExact(pool, 1200, 8);
      expect(result).toBeNull();
    });

    test('should respect max cards limit', () => {
      const pool: Card[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        name: `Card${i}`,
        price: 120,
      }));

      // Can sum to 1200 with 10 cards, but limit is 8
      const result = matchExact(pool, 960, 8);
      expect(result?.total).toBe(960);
      expect(result?.count).toBe(8);
    });
  });

  describe('Greedy Matching', () => {
    test('should prioritize high-value cards', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 500 },
        { id: '2', name: 'Card2', price: 400 },
        { id: '3', name: 'Card3', price: 300 },
        { id: '4', name: 'Card4', price: 200 },
        { id: '5', name: 'Card5', price: 100 },
      ];

      const result = matchGreedy(pool, 1200, 8);
      expect(result.total).toBeLessThanOrEqual(1200);
      expect(result.count).toBeGreaterThan(0);
      expect(result.total).toBe(1200); // 500 + 400 + 300 = 1200
    });

    test('should handle no exact match case', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 300 },
        { id: '2', name: 'Card2', price: 300 },
        { id: '3', name: 'Card3', price: 300 },
      ];

      const result = matchGreedy(pool, 1200, 8);
      expect(result.total).toBe(900); // All three cards
      expect(result.count).toBe(3);
    });
  });

  describe('Dynamic Matching', () => {
    test('should find optimal solution', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 500 },
        { id: '2', name: 'Card2', price: 400 },
        { id: '3', name: 'Card3', price: 300 },
        { id: '4', name: 'Card4', price: 200 },
      ];

      const result = matchDynamic(pool, 1200, 8);
      expect(result.total).toBe(1200);
      expect(result.count).toBe(3);
    });

    test('should handle complex scenarios', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 250 },
        { id: '2', name: 'Card2', price: 250 },
        { id: '3', name: 'Card3', price: 250 },
        { id: '4', name: 'Card4', price: 250 },
        { id: '5', name: 'Card5', price: 200 },
      ];

      const result = matchDynamic(pool, 1200, 8);
      expect(result.total).toBe(1200);
      expect(result.count).toBe(5);
    });
  });

  describe('Main Match Function', () => {
    test('should support exact strategy', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 600 },
        { id: '2', name: 'Card2', price: 600 },
      ];

      const result = matchCards(pool, 'exact', 1200, 8);
      expect(result.strategy).toBe('exact');
      expect(result.total).toBe(1200);
      expect(result.count).toBe(2);
      expect(result.timeMs).toBeGreaterThanOrEqual(0);
    });

    test('should support greedy strategy', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 500 },
        { id: '2', name: 'Card2', price: 400 },
        { id: '3', name: 'Card3', price: 300 },
      ];

      const result = matchCards(pool, 'greedy', 1200, 8);
      expect(result.strategy).toBe('greedy');
      expect(result.total).toBe(1200);
    });

    test('should support dynamic strategy', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 500 },
        { id: '2', name: 'Card2', price: 400 },
        { id: '3', name: 'Card3', price: 300 },
      ];

      const result = matchCards(pool, 'dynamic', 1200, 8);
      expect(result.strategy).toBe('dynamic');
      expect(result.total).toBe(1200);
    });

    test('should throw error for invalid strategy', () => {
      const pool: Card[] = [{ id: '1', name: 'Card1', price: 100 }];
      expect(() => matchCards(pool, 'invalid' as any, 1200, 8)).toThrow();
    });
  });

  describe('Find All Matches', () => {
    test('should find all possible combinations', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 600 },
        { id: '2', name: 'Card2', price: 600 },
        { id: '3', name: 'Card3', price: 400 },
        { id: '4', name: 'Card4', price: 800 },
        { id: '5', name: 'Card5', price: 400 },
      ];

      const results = findAllMatches(pool, 1200, 8);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.total === 1200)).toBe(true);
    });

    test('should return empty array when no matches', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 100 },
        { id: '2', name: 'Card2', price: 200 },
      ];

      const results = findAllMatches(pool, 1200, 8);
      expect(results).toEqual([]);
    });
  });

  describe('Validation', () => {
    test('should validate correct card pool', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 100 },
        { id: '2', name: 'Card2', price: 200 },
      ];
      expect(validateCardPool(pool)).toBe(true);
    });

    test('should reject invalid card pool', () => {
      expect(validateCardPool([] as any)).toBe(false);
      expect(validateCardPool(null as any)).toBe(false);
      expect(validateCardPool(undefined as any)).toBe(false);
    });

    test('should reject cards with invalid prices', () => {
      const invalidPool: Card[] = [
        { id: '1', name: 'Card1', price: -100 },
      ];
      expect(validateCardPool(invalidPool)).toBe(false);
    });

    test('should reject cards with prices exceeding max', () => {
      const invalidPool: Card[] = [
        { id: '1', name: 'Card1', price: 600 },
      ];
      expect(validateCardPool(invalidPool)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle single card exact match', () => {
      const pool: Card[] = [{ id: '1', name: 'SuperCard', price: 1200 }];
      const result = matchExact(pool, 1200, 8);
      expect(result?.total).toBe(1200);
      expect(result?.count).toBe(1);
    });

    test('should handle boundary of 8 cards', () => {
      const pool: Card[] = Array.from({ length: 8 }, (_, i) => ({
        id: `${i}`,
        name: `Card${i}`,
        price: 150,
      }));

      const result = matchExact(pool, 1200, 8);
      expect(result?.total).toBe(1200);
      expect(result?.count).toBe(8);
    });

    test('should handle minimum prices', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 50 },
        { id: '2', name: 'Card2', price: 50 },
        // ... need more to reach 1200
        ...Array.from({ length: 22 }, (_, i) => ({
          id: `${i + 3}`,
          name: `Card${i + 3}`,
          price: 50,
        })),
      ];

      const result = matchGreedy(pool, 1200, 8);
      expect(result.total).toBeLessThanOrEqual(1200);
    });

    test('should handle maximum prices', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 500 },
        { id: '2', name: 'Card2', price: 500 },
        { id: '3', name: 'Card3', price: 200 },
      ];

      const result = matchExact(pool, 1200, 8);
      expect(result?.total).toBe(1200);
      expect(result?.count).toBe(3);
    });
  });

  describe('Card Pool Generation', () => {
    test('should generate card pool with defaults', () => {
      const pool = generateCardPool();
      expect(pool.length).toBeGreaterThanOrEqual(50);
      expect(pool.length).toBeLessThanOrEqual(200);
      expect(validateCardPool(pool)).toBe(true);
    });

    test('should generate solvable card pool', () => {
      const pool = generateSolvableCardPool(1200, 100, 5);
      expect(pool.length).toBe(100);
      expect(validateCardPool(pool)).toBe(true);

      const exactMatch = matchExact(pool, 1200, 8);
      expect(exactMatch).not.toBeNull();
    });

    test('should generate unsolvable card pool', () => {
      const pool = generateUnsolvableCardPool(1200, 50);
      expect(pool.length).toBe(50);
      expect(validateCardPool(pool)).toBe(true);

      const exactMatch = matchExact(pool, 1200, 8);
      expect(exactMatch).toBeNull();
    });

    test('should calculate pool statistics', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 100 },
        { id: '2', name: 'Card2', price: 200 },
        { id: '3', name: 'Card3', price: 300 },
      ];

      const stats = calculatePoolStatistics(pool);
      expect(stats.totalCards).toBe(3);
      expect(stats.totalPrice).toBe(600);
      expect(stats.averagePrice).toBe(200);
      expect(stats.minPrice).toBe(100);
      expect(stats.maxPrice).toBe(300);
      expect(stats.priceDistribution[100]).toBe(1);
      expect(stats.priceDistribution[200]).toBe(1);
      expect(stats.priceDistribution[300]).toBe(1);
    });
  });

  describe('Performance', () => {
    test('should handle large card pool efficiently', () => {
      const pool = generateLargeCardPool(1000);
      expect(pool.length).toBe(1000);

      const startTime = performance.now();
      const result = matchGreedy(pool, 1200, 8);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });

    test('should handle performance with dynamic strategy', () => {
      const pool = generateLargeCardPool(500);
      expect(pool.length).toBe(500);

      const startTime = performance.now();
      const result = matchDynamic(pool, 1200, 8);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(500); // Should complete in < 500ms
    });
  });

  describe('Edge Case Generation', () => {
    test('should generate minimum edge case', () => {
      const pool = generateEdgeCaseCardPool('minimum');
      const result = matchExact(pool, 1200, 8);
      expect(result?.total).toBe(1200);
      expect(result?.count).toBe(2);
    });

    test('should generate maximum edge case', () => {
      const pool = generateEdgeCaseCardPool('maximum');
      const result = matchExact(pool, 1200, 8);
      expect(result?.total).toBe(1200);
      expect(result?.count).toBe(8);
    });

    test('should generate single card edge case', () => {
      const pool = generateEdgeCaseCardPool('single');
      const result = matchExact(pool, 1200, 8);
      expect(result?.total).toBe(1200);
      expect(result?.count).toBe(1);
    });

    test('should generate boundary edge case', () => {
      const pool = generateEdgeCaseCardPool('boundary');
      const result = matchExact(pool, 1200, 8);
      expect(result?.total).toBe(1200);
      expect(result?.count).toBeLessThanOrEqual(4);
    });
  });

  describe('Integration Tests', () => {
    test('should handle realistic scenario with generated pool', () => {
      const pool = generateSolvableCardPool(1200, 150, 3);
      const exactResult = matchExact(pool, 1200, 8);
      const greedyResult = matchGreedy(pool, 1200, 8);
      const dynamicResult = matchDynamic(pool, 1200, 8);

      expect(exactResult).not.toBeNull();
      expect(greedyResult.total).toBeGreaterThan(0);
      expect(dynamicResult.total).toBeGreaterThan(0);
    });

    test('should compare all strategies on same pool', () => {
      const pool: Card[] = [
        { id: '1', name: 'Card1', price: 500 },
        { id: '2', name: 'Card2', price: 400 },
        { id: '3', name: 'Card3', price: 300 },
        { id: '4', name: 'Card4', price: 200 },
        { id: '5', name: 'Card5', price: 100 },
      ];

      const exact = matchCards(pool, 'exact', 1200, 8);
      const greedy = matchCards(pool, 'greedy', 1200, 8);
      const dynamic = matchCards(pool, 'dynamic', 1200, 8);

      expect(exact.total).toBe(1200);
      expect(greedy.total).toBe(1200);
      expect(dynamic.total).toBe(1200);
    });
  });
});
