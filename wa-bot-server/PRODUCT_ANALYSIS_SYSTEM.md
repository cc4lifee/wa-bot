# 🧠 Sistema de Análisis Inteligente de Productos

## 📝 **Cómo Funciona el Análisis de Productos por Texto**

### **Problema Original:**
Los clientes escriben pedidos en texto libre como:
- "quiero una crepa de nutella y un café"
- "me das dos waffles de chocolate y un frappe"
- "hamburguesa hawaiana con papas y coca"

### **Solución Implementada:**
Un sistema de análisis inteligente que extrae productos específicos del texto libre.

---

## 🔍 **Ejemplos Prácticos**

### **Texto de Pedido:**
```
"Hola, quiero una crepa de nutella, un waffle de fresa y un cappuccino por favor"
```

### **Análisis Automático:**
```json
{
  "productos_detectados": [
    "crepa de nutella",
    "waffle de fresa", 
    "cappuccino"
  ],
  "categorías_detectadas": [
    "crepas_dulces",
    "waffles",
    "bebidas"
  ]
}
```

### **Resultado en Analytics:**
- ✅ **crepa de nutella**: +1 pedido
- ✅ **waffle de fresa**: +1 pedido  
- ✅ **cappuccino**: +1 pedido
- ✅ **Categoría crepas_dulces**: +1
- ✅ **Categoría waffles**: +1
- ✅ **Categoría bebidas**: +1

---

## 📊 **Catálogo de Detección**

El sistema reconoce automáticamente:

### **🍯 Crepas Dulces:**
- "crepa de nutella", "nutella", "crepa nutella"
- "crepa de cajeta", "cajeta"
- "crepa de lechera", "lechera"
- "crepa de chocolate", "chocolate"
- "crepa de fresa", "fresas"
- "crepa de plátano", "platano"

### **🧀 Crepas Saladas:**
- "crepa de jamón", "jamon"
- "crepa de queso", "queso"
- "crepa de pollo", "pollo"
- "crepa hawaiana", "hawaiana"
- "crepa de champiñones"

### **🧇 Waffles:**
- "waffle", "wafle", "wafel"
- "waffle de nutella"
- "waffle de fresa"
- "waffle de chocolate"

### **☕ Bebidas:**
- "café", "coffee"
- "cappuccino", "capuchino"
- "latte"
- "frappe", "frappé"
- "chocolate caliente"

### **🍔 Hamburguesas:**
- "hamburguesa", "burger"
- "hamburguesa hawaiana"
- "cheeseburger"
- "hot dog", "perro caliente"

### **🍟 Antojitos:**
- "boneless", "alitas"
- "nachos"
- "papas fritas"
- "aros de cebolla"
- "banderillas coreanas"

---

## 🎯 **Ejemplos de Análisis Real**

### **Pedido 1:**
```
"Me das una crepa de nutella con plátano y un café americano"
```
**Detecta:** crepa de nutella, plátano, café americano
**Categorías:** crepas_dulces, bebidas

### **Pedido 2:**
```
"Quiero dos waffles, uno de chocolate y otro de fresa, y un frappe"
```
**Detecta:** waffle de chocolate, waffle de fresa, frappe
**Categorías:** waffles, bebidas

### **Pedido 3:**
```
"Una hamburguesa hawaiana con papas y coca cola"
```
**Detecta:** hamburguesa hawaiana, papas, coca
**Categorías:** hamburguesas, antojitos, bebidas

---

## 📈 **Reportes Automáticos Generados**

### **Productos Más Populares (7 días):**
```
1. crepa de nutella    (45 pedidos) 🏆
2. café               (38 pedidos)
3. waffle de chocolate (32 pedidos)
4. hamburguesa hawaiana (28 pedidos)
5. frappe             (25 pedidos)
```

### **Categorías Más Vendidas:**
```
1. crepas_dulces      (125 pedidos)
2. bebidas           (98 pedidos) 
3. waffles           (67 pedidos)
4. hamburguesas      (45 pedidos)
5. antojitos         (34 pedidos)
```

### **Recomendaciones Automáticas:**
```
🏆 Tu producto estrella es: "crepa de nutella" con 45 pedidos
📊 Categoría más vendida: Crepas Dulces (125 pedidos)
💡 Oportunidad: "aros de cebolla" solo se pidió 3 veces. ¿Promocionar?
```

---

## 🗄️ **Almacenamiento en Base de Datos**

### **Tabla: `order_product_analysis`**
```sql
| order_number | order_text                                    | extracted_products           | product_categories    |
|-------------|----------------------------------------------|-----------------------------|--------------------|
| SH24081201  | "crepa de nutella y un café"                | ["crepa de nutella","café"] | ["crepas_dulces","bebidas"] |
| SH24081202  | "dos waffles de chocolate y frappe"         | ["waffle de chocolate","frappe"] | ["waffles","bebidas"] |
| SH24081203  | "hamburguesa hawaiana con papas"            | ["hamburguesa hawaiana","papas"] | ["hamburguesas","antojitos"] |
```

### **Tabla: `sharicrepas_analytics` (agregados diarios)**
```sql
| date       | popular_products                                           |
|------------|-----------------------------------------------------------|
| 2024-08-12 | {"product_crepa_de_nutella": 12, "category_bebidas": 8}  |
| 2024-08-13 | {"product_waffle_chocolate": 15, "category_waffles": 20} |
```

---

## 🔧 **Funciones del Sistema**

### **1. Extracción Automática:**
```typescript
const analyzer = new ProductAnalyzer();
const result = analyzer.extractProductsFromText(
  "quiero una crepa de nutella y café"
);
// result: { products: ["crepa de nutella", "café"], categories: ["crepas_dulces", "bebidas"] }
```

### **2. Análisis por Pedido:**
```typescript
await analyzer.saveOrderAnalysis("SH24081201", "crepa de nutella y café");
// Guarda análisis detallado y actualiza contadores diarios
```

### **3. Reportes de Popularidad:**
```typescript
const popular = await analyzer.getPopularProducts(7); // últimos 7 días
// Retorna lista ordenada de productos más pedidos
```

### **4. Búsqueda por Producto:**
```typescript
const orders = await analyzer.findOrdersWithProduct("crepa de nutella", 30);
// Encuentra todos los pedidos que incluyeron ese producto
```

---

## 💡 **Ventajas del Sistema**

### **✅ Para Sharicrepas:**
- **Datos reales**: Sabe exactamente qué se vende más
- **Automático**: No requiere intervención manual
- **Flexible**: Reconoce variaciones del mismo producto
- **Escalable**: Fácil agregar nuevos productos

### **✅ Para Análisis:**
- **Precisión**: Reconoce productos específicos, no solo texto genérico
- **Tendencias**: Ve patrones de demanda por día/semana
- **Oportunidades**: Identifica productos poco vendidos
- **Categorías**: Entiende qué tipo de comida prefieren

### **✅ Para el Negocio:**
- **Inventario**: Sabe qué ingredientes comprar más
- **Promociones**: Qué productos promocionar
- **Menú**: Qué agregar o quitar del menú
- **Precios**: Qué productos tienen más demanda

---

## 🎯 **Resultado Final**

**Antes:** "No sabemos qué se pide más porque todo está en texto libre"

**Después:** "Sabemos que la crepa de nutella es nuestro producto estrella con 45 pedidos esta semana, las crepas dulces son la categoría más popular, y los aros de cebolla necesitan promoción"

El sistema convierte **texto libre** en **inteligencia de negocio** automáticamente! 🚀
