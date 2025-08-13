import { DatabaseConnection } from '../database/connection';
import { logger } from '../utils/logger';

// Catálogo de productos de Sharicrepas para análisis
const SHARICREPAS_PRODUCTS = {
  // Crepas dulces
  crepas_dulces: [
    'crepa de nutella', 'crepa nutella', 'nutella',
    'crepa de cajeta', 'crepa cajeta', 'cajeta',
    'crepa de lechera', 'crepa lechera', 'lechera',
    'crepa de mermelada', 'crepa mermelada', 'mermelada',
    'crepa de chocolate', 'crepa chocolate', 'chocolate',
    'crepa de fresa', 'crepa fresa', 'fresas',
    'crepa de plátano', 'crepa platano', 'plátano', 'platano',
    'crepa mixta', 'crepa combinada'
  ],
  
  // Crepas saladas
  crepas_saladas: [
    'crepa de jamón', 'crepa jamon', 'jamón', 'jamon',
    'crepa de queso', 'crepa queso', 'queso',
    'crepa de pollo', 'crepa pollo', 'pollo',
    'crepa hawaiana', 'hawaiana', 'piña',
    'crepa de champiñones', 'champiñones', 'champinones',
    'crepa de espinacas', 'espinacas'
  ],
  
  // Waffles
  waffles: [
    'waffle', 'wafle', 'wafel',
    'waffle de nutella', 'waffle nutella',
    'waffle de fresa', 'waffle fresa',
    'waffle de chocolate', 'waffle chocolate',
    'waffle simple', 'waffle sencillo'
  ],
  
  // Bebidas
  bebidas: [
    'café', 'cafe', 'coffee',
    'cappuccino', 'capuchino',
    'latte', 'late',
    'americano',
    'frappe', 'frappé', 'frape',
    'chocolate caliente', 'chocolate',
    'té', 'te', 'tea',
    'agua', 'refresco', 'coca', 'pepsi',
    'jugo', 'zumo', 'naranja', 'manzana'
  ],
  
  // Hamburguesas y hot dogs
  hamburguesas: [
    'hamburguesa', 'burger', 'hamburgesa',
    'hamburguesa sencilla', 'hamburguesa simple',
    'hamburguesa hawaiana',
    'hamburguesa con queso', 'cheeseburger',
    'hot dog', 'hotdog', 'perro caliente',
    'hot dog sencillo', 'hot dog especial'
  ],
  
  // Antojitos
  antojitos: [
    'boneless', 'boneles', 'alitas',
    'nachos', 'nacho',
    'papas', 'papas fritas', 'french fries',
    'aros de cebolla', 'aros',
    'banderillas', 'banderilla', 'coreanas',
    'quesadilla', 'quesadillas'
  ],
  
  // Charolas especiales
  charolas: [
    'charola', 'charola especial',
    'charola familiar', 'charola grande',
    'combo', 'paquete', 'promoción'
  ]
};

export class ProductAnalyzer {
  private db: DatabaseConnection;

  constructor() {
    this.db = new DatabaseConnection();
  }

  /**
   * Extrae productos específicos de un texto de pedido
   */
  extractProductsFromText(orderText: string): { products: string[], categories: string[] } {
    const lowerText = orderText.toLowerCase();
    const foundProducts: string[] = [];
    const foundCategories: string[] = [];

    // Analizar cada categoría de productos
    Object.entries(SHARICREPAS_PRODUCTS).forEach(([category, products]) => {
      products.forEach(product => {
        if (lowerText.includes(product.toLowerCase())) {
          foundProducts.push(product);
          if (!foundCategories.includes(category)) {
            foundCategories.push(category);
          }
        }
      });
    });

    return { products: foundProducts, categories: foundCategories };
  }

  /**
   * Guarda análisis de productos de un pedido
   */
  async saveOrderAnalysis(orderNumber: string, orderText: string): Promise<void> {
    try {
      const analysis = this.extractProductsFromText(orderText);
      
      // Crear tabla para análisis de productos si no existe
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS order_product_analysis (
          id SERIAL PRIMARY KEY,
          order_number VARCHAR(50) NOT NULL,
          order_text TEXT NOT NULL,
          extracted_products TEXT[],
          product_categories TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_number) REFERENCES sharicrepas_orders(order_number) ON DELETE CASCADE
        );
      `);

      // Guardar análisis
      await this.db.query(`
        INSERT INTO order_product_analysis 
        (order_number, order_text, extracted_products, product_categories)
        VALUES ($1, $2, $3, $4);
      `, [orderNumber, orderText, analysis.products, analysis.categories]);

      // Actualizar contadores diarios de productos populares
      await this.updateDailyProductStats(analysis.products, analysis.categories);

      logger.info(`📊 Análisis de productos guardado para pedido ${orderNumber}: ${analysis.products.join(', ')}`);
    } catch (error) {
      logger.error('Error saving order analysis:', error);
    }
  }

  /**
   * Actualiza estadísticas diarias de productos populares
   */
  private async updateDailyProductStats(products: string[], categories: string[]): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Obtener stats actuales del día
      const result = await this.db.query(`
        SELECT popular_products FROM sharicrepas_analytics WHERE date = $1;
      `, [today]);

      let currentStats: { [key: string]: number } = {};
      if (result.rows.length > 0 && result.rows[0].popular_products) {
        currentStats = result.rows[0].popular_products;
      }

      // Actualizar contadores de productos
      products.forEach(product => {
        const key = `product_${product.replace(/\s+/g, '_')}`;
        currentStats[key] = (currentStats[key] || 0) + 1;
      });

      // Actualizar contadores de categorías
      categories.forEach(category => {
        const key = `category_${category}`;
        currentStats[key] = (currentStats[key] || 0) + 1;
      });

      // Guardar stats actualizados
      await this.db.query(`
        UPDATE sharicrepas_analytics 
        SET popular_products = $1
        WHERE date = $2;
      `, [JSON.stringify(currentStats), today]);

    } catch (error) {
      logger.error('Error updating daily product stats:', error);
    }
  }

  /**
   * Obtiene los productos más populares de los últimos N días
   */
  async getPopularProducts(days: number = 7): Promise<any[]> {
    try {
      // Método 1: Desde análisis detallado
      const detailedQuery = `
        SELECT 
          unnest(extracted_products) as product,
          COUNT(*) as frequency
        FROM order_product_analysis 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY product
        ORDER BY frequency DESC
        LIMIT 15;
      `;

      const detailedResult = await this.db.query(detailedQuery);

      // Método 2: Desde analytics agregados (backup)
      const analyticsQuery = `
        SELECT popular_products 
        FROM sharicrepas_analytics 
        WHERE date >= NOW() - INTERVAL '${days} days'
        AND popular_products IS NOT NULL;
      `;

      const analyticsResult = await this.db.query(analyticsQuery);

      // Combinar resultados
      const popularProducts = detailedResult.rows;

      // Si tenemos datos de analytics, agregarlos
      if (analyticsResult.rows.length > 0) {
        const aggregatedStats: { [key: string]: number } = {};
        analyticsResult.rows.forEach((row: any) => {
          const stats = row.popular_products;
          Object.entries(stats).forEach(([key, value]) => {
            if (key.startsWith('product_')) {
              const productName = key.replace('product_', '').replace(/_/g, ' ');
              aggregatedStats[productName] = (aggregatedStats[productName] || 0) + (value as number);
            }
          });
        });

        // Agregar productos que no estén en el análisis detallado
        Object.entries(aggregatedStats).forEach(([product, frequency]) => {
          if (!popularProducts.find((p: any) => p.product === product)) {
            popularProducts.push({ product, frequency });
          }
        });
      }

      return popularProducts.sort((a: any, b: any) => b.frequency - a.frequency);

    } catch (error) {
      logger.error('Error getting popular products:', error);
      return [];
    }
  }

  /**
   * Obtiene análisis de categorías más populares
   */
  async getPopularCategories(days: number = 7): Promise<any[]> {
    try {
      const query = `
        SELECT 
          unnest(product_categories) as category,
          COUNT(*) as frequency
        FROM order_product_analysis 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY category
        ORDER BY frequency DESC;
      `;

      const result = await this.db.query(query);
      return result.rows;

    } catch (error) {
      logger.error('Error getting popular categories:', error);
      return [];
    }
  }

  /**
   * Genera reporte de productos para el dashboard
   */
  async generateProductReport(days: number = 7): Promise<any> {
    try {
      const [products, categories] = await Promise.all([
        this.getPopularProducts(days),
        this.getPopularCategories(days)
      ]);

      const totalOrders = await this.db.query(`
        SELECT COUNT(*) as total 
        FROM order_product_analysis 
        WHERE created_at >= NOW() - INTERVAL '${days} days';
      `);

      return {
        period: `${days} días`,
        totalOrders: parseInt(totalOrders.rows[0].total) || 0,
        topProducts: products.slice(0, 10),
        topCategories: categories,
        recommendations: this.generateRecommendations(products, categories)
      };

    } catch (error) {
      logger.error('Error generating product report:', error);
      return null;
    }
  }

  /**
   * Genera recomendaciones basadas en datos
   */
  private generateRecommendations(products: any[], categories: any[]): string[] {
    const recommendations: string[] = [];

    // Producto más popular
    if (products.length > 0) {
      recommendations.push(`🏆 Tu producto estrella es: "${products[0].product}" con ${products[0].frequency} pedidos`);
    }

    // Categoría más popular
    if (categories.length > 0) {
      const topCategory = categories[0];
      let categoryName = '';
      switch (topCategory.category) {
        case 'crepas_dulces': categoryName = 'Crepas Dulces'; break;
        case 'crepas_saladas': categoryName = 'Crepas Saladas'; break;
        case 'waffles': categoryName = 'Waffles'; break;
        case 'bebidas': categoryName = 'Bebidas'; break;
        case 'hamburguesas': categoryName = 'Hamburguesas'; break;
        case 'antojitos': categoryName = 'Antojitos'; break;
        default: categoryName = topCategory.category;
      }
      recommendations.push(`📊 Categoría más vendida: ${categoryName} (${topCategory.frequency} pedidos)`);
    }

    // Productos menos populares (oportunidades)
    if (products.length > 5) {
      const leastPopular = products[products.length - 1];
      recommendations.push(`💡 Oportunidad: "${leastPopular.product}" solo se pidió ${leastPopular.frequency} veces. ¿Promocionar?`);
    }

    return recommendations;
  }

  /**
   * Busca texto de pedidos que contengan un producto específico
   */
  async findOrdersWithProduct(productName: string, days: number = 30): Promise<any[]> {
    try {
      const query = `
        SELECT 
          opa.order_number,
          opa.order_text,
          opa.created_at,
          so.customer_name,
          so.total_amount
        FROM order_product_analysis opa
        JOIN sharicrepas_orders so ON opa.order_number = so.order_number
        WHERE $1 = ANY(opa.extracted_products)
        AND opa.created_at >= NOW() - INTERVAL '${days} days'
        ORDER BY opa.created_at DESC;
      `;

      const result = await this.db.query(query, [productName]);
      return result.rows;

    } catch (error) {
      logger.error('Error finding orders with product:', error);
      return [];
    }
  }
}

// Función auxiliar para usar en el controlador principal
export async function analyzeOrderProducts(orderNumber: string, orderText: string): Promise<void> {
  const analyzer = new ProductAnalyzer();
  await analyzer.saveOrderAnalysis(orderNumber, orderText);
}
