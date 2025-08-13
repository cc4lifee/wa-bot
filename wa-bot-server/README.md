# WhatsApp Bot Server

Este es el servidor principal del bot de WhatsApp con Express.js, PostgreSQL y TypeScript.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Configurar base de datos
npm run setup:db
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor con hot reload
npm run build        # Compilar TypeScript
npm start            # Servidor producción

# Base de datos
npm run setup:db     # Crear tablas

# Testing
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con coverage

# Linting
npm run lint         # Revisar código
npm run lint:fix     # Corregir automáticamente
```

## 🔧 Configuración

### Variables de Entorno

Ver `.env.example` para todas las variables disponibles:

- `DB_*`: Configuración de PostgreSQL
- `WA_*`: Configuración del bot de WhatsApp
- `LOG_LEVEL`: Nivel de logging (error, warn, info, debug)
- `API_KEY`: Clave API opcional para proteger endpoints

## 📁 Estructura del Proyecto

```
src/
├── controllers/     # Controladores HTTP y Bot
├── database/        # Conexión a base de datos
├── middleware/      # Middleware de Express
├── services/        # Lógica de negocio
├── utils/          # Utilidades (logging, validación)
├── config/         # Configuración centralizada
├── __tests__/      # Tests unitarios
└── app.ts          # Punto de entrada
```

## 🎯 Endpoints API

### Sistema
- `GET /api/status` - Estado del servidor

### Mensajes
- `GET /api/messages` - Listar mensajes
- `GET /api/messages/:phoneNumber` - Mensajes de usuario
- `POST /api/send-message` - Enviar mensaje

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear/actualizar usuario

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests específicos
npm test -- --testNamePattern="BotController"
```

## 📊 Logging

Los logs se guardan en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs

En desarrollo también se muestran en consola.

## 🔒 Seguridad

- Rate limiting automático
- Validación de entrada
- Headers de seguridad con Helmet
- Autenticación API opcional

## 🚀 Producción

```bash
# Compilar
npm run build

# Configurar variables de entorno de producción
export NODE_ENV=production
export DB_HOST=your-prod-db-host
# ... otras variables

# Ejecutar
npm start
```

## 🐛 Debugging

```bash
# Logs detallados
LOG_LEVEL=debug npm run dev

# Solo errores
LOG_LEVEL=error npm start
```
