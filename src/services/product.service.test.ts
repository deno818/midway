import {
  ProductService,
  Product,
  demonstrateSearch
} from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  const createSampleProducts = (): Product[] => [
    // 低价产品
    { id: '1', sku: 'SKU001', name: 'Budget Phone', price: 100 },
    { id: '2', sku: 'SKU002', name: 'Budget Tablet', price: 120 },
    { id: '3', sku: 'SKU003', name: 'Budget Laptop', price: 150 },
    
    // 中价产品
    { id: '4', sku: 'SKU004', name: 'Standard Phone', price: 300 },
    { id: '5', sku: 'SKU005', name: 'Standard Tablet', price: 350 },
    { id: '6', sku: 'SKU006', name: 'Standard Laptop', price: 400 },
    
    // 高价产品
    { id: '7', sku: 'SKU007', name: 'Premium Phone', price: 800 },
    { id: '8', sku: 'SKU008', name: 'Premium Tablet', price: 900 },
    { id: '9', sku: 'SKU009', name: 'Premium Laptop', price: 1200 },
  ];

  beforeEach(() => {
    service = new ProductService();
  });

  test('should return results', () => {
    const products = createSampleProducts();
    const results = service.searchCombinations(products, { maxResults: 5 });
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  test('should not have duplicate SKU combinations', () => {
    const products = createSampleProducts();
    const results = service.searchCombinations(products, { maxResults: 5 });
    
    const skuHashes = new Set(results.map(r => r.skuCombination));
    expect(skuHashes.size).toBe(results.length);
  });

  test('should have diversity scores', () => {
    const products = createSampleProducts();
    const results = service.searchCombinations(products, { maxResults: 5 });
    
    results.forEach(combo => {
      expect(combo.diversityScore).toBeGreaterThanOrEqual(0);
      expect(combo.diversityScore).toBeLessThanOrEqual(100);
    });
  });

  test('should handle edge cases', () => {
    expect(service.searchCombinations([], { maxResults: 5 })).toEqual([]);
    expect(service.searchCombinations([{ id: '1', sku: 'SKU1', name: 'Product', price: 100 }])).toEqual([]);
  });

  test('should demonstrate search', () => {
    expect(() => demonstrateSearch()).not.toThrow();
  });

  test('should validate results correctly', () => {
    const products = createSampleProducts();
    const results = service.searchCombinations(products, { maxResults: 5 });
    
    const validation = service.validateResults(results, products);
    
    expect(validation).toHaveProperty('isValid');
    expect(validation).toHaveProperty('details');
  });
});
