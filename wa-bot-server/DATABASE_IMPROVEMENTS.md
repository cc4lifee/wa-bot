# 📊 Base de Datos Mejorada para Sharicrepas

## 🎯 **Mejoras Implementadas**

La base de datos ha sido completamente rediseñada para optimizar el negocio específico de Sharicrepas. Las mejoras incluyen:

### **📈 Analytics y Métricas Empresariales**
- **Conversiones**: Tracking de cuántas conversaciones se convierten en pedidos
- **Productos populares**: Identificación automática de los productos más solicitados
- **Horas pico**: Análisis de patrones de actividad por horarios
- **Clientes recurrentes vs nuevos**: Segmentación automática de clientela

### **👥 Gestión Avanzada de Clientes**
- **Perfiles completos**: Historial de pedidos, gastos totales, productos favoritos
- **Sistema VIP**: Clientes con 10+ pedidos se marcan automáticamente como VIP
- **Notas personalizadas**: Espacio para recordar preferencias especiales
- **Nombres preferidos**: Como le gusta que los llamen

### **📝 Sistema de Pedidos Robusto**
- **Números de pedido únicos**: Formato `SH240812001` (Sharicrepas + fecha + secuencial)
- **Estados de pedido**: pending → confirmed → preparing → ready → delivered
- **Tracking completo**: Desde WhatsApp hasta entrega
- **Instrucciones especiales**: Notas adicionales del cliente

### **🔄 Estados de Conversación Persistentes**
- **Sesiones continuas**: El bot recuerda donde quedó cada conversación
- **Recuperación de contexto**: Si se cae el bot, mantiene el estado
- **Timeout automático**: Limpia sesiones inactivas automáticamente

---

## 🗄️ **Estructura de Tablas**

### **`sharicrepas_customers`** - Clientes
```sql
- phone_number (UNIQUE)   # Teléfono del cliente
- name, preferred_name    # Nombre completo y como le gusta que lo llamen
- total_orders, total_spent # Métricas de compra
- favorite_products[]     # Array de productos favoritos
- is_vip                  # Cliente VIP (10+ pedidos)
- notes                   # Notas especiales
```

### **`sharicrepas_orders`** - Pedidos
```sql
- order_number (UNIQUE)   # SH240812001
- customer_name           # Nombre para el pedido
- order_details           # Descripción completa
- status                  # pending/confirmed/preparing/ready/delivered
- estimated_time          # Tiempo estimado en minutos
- total_amount            # Monto total
- special_instructions    # Notas adicionales
```

### **`conversation_sessions`** - Estados de Chat
```sql
- phone_number            # Cliente
- current_screen          # welcome/ordering/taking_order/completed
- session_data (JSONB)    # Datos flexibles de la sesión
- last_activity           # Última actividad
```

### **`sharicrepas_messages`** - Mensajes Mejorados
```sql
- phone_number            # Cliente
- direction               # incoming/outgoing
- message_text            # Contenido
- intent                  # greeting/menu_request/order_request/etc.
- response_time_ms        # Tiempo de respuesta del bot
```

### **`sharicrepas_analytics`** - Métricas Diarias
```sql
- date                    # Fecha
- total_conversations     # Conversaciones del día
- total_orders            # Pedidos del día
- conversion_rate         # % de conversión
- popular_products (JSONB) # Productos más solicitados
- new_customers           # Clientes nuevos del día
```

### **`customer_feedback`** - Retroalimentación
```sql
- phone_number            # Cliente
- order_id                # Pedido relacionado
- rating (1-5)            # Calificación
- feedback_text           # Comentarios
- feedback_type           # order/service/product/general
```

---

## 🚀 **Configuración e Instalación**

### **1. Crear las nuevas tablas:**
```bash
npm run setup:sharicrepas
```

### **2. Configurar variables de entorno:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sharicrepas_bot
DB_USERNAME=postgres
DB_PASSWORD=tu_password
```

### **3. Verificar funcionamiento:**
```bash
npm test
```

---

## 📊 **Consultas Útiles para Analytics**

### **Conversión diaria:**
```sql
SELECT 
  date,
  total_conversations,
  total_orders,
  conversion_rate
FROM sharicrepas_analytics 
ORDER BY date DESC;
```

### **Top 10 clientes VIP:**
```sql
SELECT 
  preferred_name,
  phone_number,
  total_orders,
  total_spent
FROM sharicrepas_customers 
WHERE is_vip = true 
ORDER BY total_spent DESC 
LIMIT 10;
```

### **Productos más populares (últimos 7 días):**
```sql
SELECT 
  order_details,
  COUNT(*) as frequency
FROM sharicrepas_orders 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY order_details
ORDER BY frequency DESC
LIMIT 10;
```

### **Horarios más activos:**
```sql
SELECT 
  EXTRACT(hour FROM created_at) as hour,
  COUNT(*) as messages
FROM sharicrepas_messages 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY hour
ORDER BY messages DESC;
```

---

## 🎯 **Beneficios para Sharicrepas**

### **📈 Para el Negocio:**
- ✅ **Métricas reales**: Saber qué productos vender más
- ✅ **Clientes VIP**: Identificar y premiar a los mejores clientes
- ✅ **Optimización de horarios**: Entender cuándo hay más demanda
- ✅ **Tracking de pedidos**: Control total del proceso

### **👨‍💼 Para la Administración:**
- ✅ **Dashboard de métricas**: Ver rendimiento diario
- ✅ **Historial completo**: Cada interacción guardada
- ✅ **Análisis de tendencias**: Patrones de compra y comportamiento
- ✅ **Backup automático**: Toda la información segura

### **👥 Para los Clientes:**
- ✅ **Experiencia personalizada**: El bot los reconoce
- ✅ **Pedidos más rápidos**: Información guardada
- ✅ **Seguimiento de pedidos**: Números únicos de orden
- ✅ **Atención continua**: El bot recuerda conversaciones

---

## 🔧 **API del Nuevo Controlador**

### **SharicrepasController Methods:**

```typescript
// Gestión de clientes
registerCustomer(phoneNumber, name?) 
getCustomer(phoneNumber)

// Mensajes con analytics
saveMessage(phone, direction, text, intent?, responseTime?)

// Sistema de pedidos
createOrder(orderData)
updateOrderStatus(orderNumber, status)

// Estados de conversación
updateConversationSession(phone, screen, data?)

// Analytics
getTodayStats()
getPopularProducts(days?)
```

---

## 📱 **Integración con WhatsApp Bot**

El bot ahora automáticamente:

1. **📥 Guarda cada mensaje** con intención detectada
2. **👤 Registra clientes** automáticamente
3. **🔄 Mantiene estados** de conversación persistentes
4. **📝 Crea pedidos** con números únicos
5. **📊 Genera métricas** en tiempo real
6. **⏱️ Mide tiempos** de respuesta

---

## 🎉 **Resultado Final**

Con estas mejoras, Sharicrepas tiene:

- ✅ **Sistema empresarial completo** en lugar de bot básico
- ✅ **Analytics automáticos** para tomar decisiones
- ✅ **Gestión de clientes** profesional
- ✅ **Tracking de pedidos** completo
- ✅ **Escalabilidad** para crecimiento futuro

**El bot pasó de ser una herramienta simple a un sistema integral de gestión de clientes y pedidos específicamente diseñado para las necesidades de Sharicrepas.** 🚀
