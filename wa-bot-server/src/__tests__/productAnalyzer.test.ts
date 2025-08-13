import { ProductAnalyzer } from '../controllers/productAnalyzer';

// Mock del logger y base de datos
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

jest.mock('../database/connection', () => ({
  DatabaseConnection: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({ rows: [] })
  }))
}));

describe('ProductAnalyzer', () => {
  let analyzer: ProductAnalyzer;

  beforeEach(() => {
    analyzer = new ProductAnalyzer();
  });

  describe('Extracción de productos desde texto', () => {
    it('debería detectar crepa de nutella correctamente', () => {
      const result = analyzer.extractProductsFromText('quiero una crepa de nutella');
      
      expect(result.products).toContain('crepa de nutella');
      expect(result.categories).toContain('crepas_dulces');
    });

    it('debería detectar múltiples productos en un pedido', () => {
      const result = analyzer.extractProductsFromText(
        'me das una crepa de nutella, un waffle de chocolate y un café'
      );
      
      expect(result.products).toContain('crepa de nutella');
      expect(result.products).toContain('waffle de chocolate');
      expect(result.products).toContain('café');
      expect(result.categories).toContain('crepas_dulces');
      expect(result.categories).toContain('waffles');
      expect(result.categories).toContain('bebidas');
    });

    it('debería detectar variaciones de nombres de productos', () => {
      const tests = [
        'nutella',
        'crepa nutella', 
        'crepa de nutella'
      ];
      
      tests.forEach(text => {
        const result = analyzer.extractProductsFromText(text);
        expect(result.products.length).toBeGreaterThan(0);
        expect(result.categories).toContain('crepas_dulces');
      });
    });

    it('debería detectar hamburguesas y sus variaciones', () => {
      const result = analyzer.extractProductsFromText(
        'hamburguesa hawaiana con papas fritas'
      );
      
      expect(result.products).toContain('hamburguesa hawaiana');
      expect(result.products).toContain('papas fritas');
      expect(result.categories).toContain('hamburguesas');
      expect(result.categories).toContain('antojitos');
    });

    it('debería detectar bebidas correctamente', () => {
      const result = analyzer.extractProductsFromText(
        'un cappuccino y un frappe de vainilla'
      );
      
      expect(result.products).toContain('cappuccino');
      expect(result.products).toContain('frappe');
      expect(result.categories).toContain('bebidas');
    });

    it('debería manejar texto sin productos reconocidos', () => {
      const result = analyzer.extractProductsFromText(
        'hola, quiero información sobre sus horarios'
      );
      
      expect(result.products).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
    });

    it('debería ser insensible a mayúsculas y minúsculas', () => {
      const tests = [
        'CREPA DE NUTELLA',
        'Crepa De Nutella',
        'crepa de nutella',
        'CrEpA dE nUtElLa'
      ];
      
      tests.forEach(text => {
        const result = analyzer.extractProductsFromText(text);
        expect(result.products.length).toBeGreaterThan(0);
        expect(result.categories).toContain('crepas_dulces');
      });
    });
  });

  describe('Análisis de pedidos complejos', () => {
    it('debería analizar pedido familiar completo', () => {
      const orderText = `
        Hola, quiero hacer un pedido grande:
        - 2 crepas de nutella
        - 1 crepa de jamón y queso
        - 3 waffles de chocolate
        - 2 hamburguesas hawaianas 
        - papas fritas
        - 4 cafés americanos
        - 2 frappes de vainilla
        Gracias!
      `;
      
      const result = analyzer.extractProductsFromText(orderText);
      
      // Verificar productos detectados (el sistema detecta variaciones)
      expect(result.products).toContain('nutella'); // Se detecta como nutella
      expect(result.products).toContain('jamón');
      expect(result.products).toContain('queso');
      expect(result.products).toContain('chocolate'); // Se detecta como chocolate
      expect(result.products).toContain('hawaiana'); // Se detecta como hawaiana
      expect(result.products).toContain('papas fritas');
      expect(result.products).toContain('café');
      expect(result.products).toContain('frappe');
      
      // Verificar categorías
      expect(result.categories).toContain('crepas_dulces');
      expect(result.categories).toContain('crepas_saladas');
      expect(result.categories).toContain('waffles');
      expect(result.categories).toContain('hamburguesas');
      expect(result.categories).toContain('antojitos');
      expect(result.categories).toContain('bebidas');
    });

    it('debería manejar pedidos con productos no estándar', () => {
      const result = analyzer.extractProductsFromText(
        'quiero una crepa especial con nutella y plátano, y algo de tomar'
      );
      
      // Debería detectar los componentes reconocibles
      expect(result.products).toContain('nutella');
      expect(result.products).toContain('plátano');
      expect(result.categories).toContain('crepas_dulces');
    });

    it('debería detectar combinaciones populares', () => {
      const popularOrders = [
        'crepa de nutella con plátano',
        'hamburguesa con papas y coca',
        'waffle de chocolate y café',
        'boneless con aros de cebolla',
        'hot dog con nachos'
      ];
      
      popularOrders.forEach(order => {
        const result = analyzer.extractProductsFromText(order);
        expect(result.products.length).toBeGreaterThan(0);
        expect(result.categories.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Casos edge y variaciones', () => {
    it('debería manejar typos comunes', () => {
      const typos = [
        'wafle de chocolate', // waffle mal escrito
        'hamburgesa hawaiana', // hamburguesa mal escrito
        'cafe americano', // café sin acento
        'frape de vainilla' // frappe mal escrito
      ];
      
      typos.forEach(text => {
        const result = analyzer.extractProductsFromText(text);
        expect(result.products.length).toBeGreaterThan(0);
      });
    });

    it('debería detectar productos en oraciones naturales', () => {
      const naturalSentences = [
        'me antojé de una crepa de nutella',
        'podrías prepararme un waffle de fresa por favor',
        'tengo ganas de tomar un cappuccino',
        'me gustaría una hamburguesa hawaiana si tienen'
      ];
      
      naturalSentences.forEach(sentence => {
        const result = analyzer.extractProductsFromText(sentence);
        expect(result.products.length).toBeGreaterThan(0);
      });
    });

    it('debería manejar pedidos en formato de lista', () => {
      const listOrder = `
        1. Crepa de nutella
        2. Waffle de chocolate  
        3. Café americano
        4. Hamburguesa hawaiana
        5. Papas fritas
      `;
      
      const result = analyzer.extractProductsFromText(listOrder);
      
      expect(result.products.length).toBeGreaterThanOrEqual(5);
      expect(result.categories.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('Casos reales de Sharicrepas', () => {
  let analyzer: ProductAnalyzer;

  beforeEach(() => {
    analyzer = new ProductAnalyzer();
  });

  it('debería procesar pedidos típicos de clientes', () => {
    const realOrders = [
      {
        text: 'Hola buenas tardes, quiero una crepa de nutella y un café por favor',
        expectedProducts: ['crepa de nutella', 'café'],
        expectedCategories: ['crepas_dulces', 'bebidas']
      },
      {
        text: 'Me das dos waffles, uno de chocolate y otro de fresa, y un frappe',
        expectedProducts: ['waffle', 'chocolate', 'fresa', 'frappe'],
        expectedCategories: ['waffles', 'bebidas']
      },
      {
        text: 'Una hamburguesa hawaiana completa con papas y coca cola',
        expectedProducts: ['hamburguesa hawaiana', 'papas'],
        expectedCategories: ['hamburguesas', 'antojitos']
      },
      {
        text: 'Boneless con aros de cebolla y un americano para llevar',
        expectedProducts: ['boneless', 'aros'],
        expectedCategories: ['antojitos', 'bebidas']
      }
    ];

    realOrders.forEach(order => {
      const result = analyzer.extractProductsFromText(order.text);
      
      // Verificar que detecta al menos algunos productos esperados
      const hasExpectedProducts = order.expectedProducts.some(product => 
        result.products.some(detected => detected.includes(product))
      );
      expect(hasExpectedProducts).toBe(true);
      
      // Verificar que detecta al menos algunas categorías esperadas
      const hasExpectedCategories = order.expectedCategories.some(category => 
        result.categories.includes(category)
      );
      expect(hasExpectedCategories).toBe(true);
    });
  });
});
