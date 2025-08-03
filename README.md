# WhatsApp Bot

This project is a modular WhatsApp bot built with Node.js, Express, and the Baileys library. It features direct PostgreSQL database integration and a shared common library for type definitions.

## Features

- 🤖 **WhatsApp Integration**: Built with Baileys for reliable WhatsApp Web API connection
- 🔄 **Real-time Messaging**: Automatic message handling and responses
- 🗄️ **Database Support**: PostgreSQL with direct SQL queries for data persistence  
- 📦 **Modular Architecture**: Shared common types and models
- 🔧 **TypeScript**: Full type safety and modern JavaScript features

## Project Structure

```
wa-bot/
├── wa-bot-server/              # Main server application
│   ├── src/
│   │   ├── app.ts              # Express server entry point
│   │   ├── bot/
│   │   │   └── whatsappBot.ts  # WhatsApp bot logic and handlers
│   │   ├── controllers/
│   │   │   └── messageController.ts # HTTP route controllers
│   │   ├── database/
│   │   │   └── connection.ts   # PostgreSQL direct connection
│   │   ├── routes/
│   │   │   └── index.ts        # API route definitions
│   │   ├── services/           # Business logic services
│   │   └── types/
│   │       └── index.ts        # Server-specific type definitions
│   ├── test.ts                 # Standalone bot test script
│   ├── package.json            # Dependencies and scripts
│   └── tsconfig.json           # TypeScript configuration
├── wa-bot-common/              # Shared library
│   ├── models/
│   │   └── chatMessage.ts      # Message model definitions
│   ├── types/
│   │   ├── messageTypes.ts     # Message-related types
│   │   └── roles.ts            # User role definitions
│   └── index.ts                # Barrel exports
└── README.md                   # This documentation
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Git

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd wa-bot
   ```

2. **Install dependencies for the server:**
   ```bash
   cd wa-bot-server
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `wa-bot-server` directory with the following variables:
   ```env
   # Database configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=whatsapp_bot
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   
   # Server configuration
   PORT=3000
   ```

4. **Set up the PostgreSQL database:**
   - Install PostgreSQL on your system if not already installed
   - Create a new database named `whatsapp_bot`
   - Ensure PostgreSQL is running and accessible with the credentials specified in your `.env` file

5. **Run the application:**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm run start
   ```

## Usage

### Main Bot
- The bot listens for incoming messages on WhatsApp and can respond based on predefined logic (see `src/bot/whatsappBot.ts`).
- You can extend the bot's functionality by modifying `src/bot/whatsappBot.ts`.

### Quick Test (without database or Express)
You can test the WhatsApp bot logic directly using `test.ts`:

1. Run:
   ```bash
   npx ts-node test.ts
   ```
2. Scan the QR code with your WhatsApp app ("Linked Devices").
3. Send a message "hola" to the linked account. The bot will reply automatically with "¡Hola! Soy un bot 🤖".

This is useful for quick bot testing without running the full backend or database.

## Available Scripts

In the `wa-bot-server` directory, you can run:

- `npm run start` - Starts the production server
- `npm run dev` - Starts the development server with hot reload
- `npm run build` - Builds the TypeScript project

## Dependencies

### Main Dependencies
- **@whiskeysockets/baileys**: WhatsApp Web API client
- **express**: Web framework for Node.js
- **pg**: PostgreSQL client
- **dotenv**: Environment variables management
- **qrcode-terminal**: QR code generation for WhatsApp authentication

### Development Dependencies
- **typescript**: TypeScript compiler
- **ts-node**: TypeScript execution for Node.js
- **@types/express**: TypeScript definitions for Express
- **@types/node**: TypeScript definitions for Node.js

## Architecture

This project follows a modular architecture:

1. **wa-bot-server**: Main application containing the Express server and WhatsApp bot
2. **wa-bot-common**: Shared library with common types and models that can be used across different parts of the application

The separation allows for better code organization and potential future expansion to multiple bot instances or additional services.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.