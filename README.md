# WhatsApp Bot

This project is a WhatsApp bot built using Node.js, Express, and the Baileys library. It utilizes PostgreSQL as the database, managed through an ORM, and is containerized using Docker.

## Project Structure

```
wa-bot-server
├── src
│   ├── app.ts                # Entry point of the application (Express + bot)
│   ├── bot
│   │   └── whatsappBot.ts    # WhatsApp bot logic
│   ├── controllers
│   │   └── messageController.ts # Route controllers
│   ├── database
│   │   └── orm.ts            # Database ORM
│   ├── routes
│   │   └── index.ts          # Route definitions
│   └── types
│       └── index.ts          # Type definitions
├── test.ts                   # Quick test script for WhatsApp bot
├── docker-compose.yml        # Docker configuration for PostgreSQL
├── package.json              # npm dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd whatsapp-bot
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Set up the PostgreSQL database:**
   - Ensure Docker is installed and running.
   - Start the database service:
     ```
     docker-compose up -d
     ```

4. **Run the application:**
   ```
   npm run start
   ```

## Usage


### Main Bot
- The bot listens for incoming messages on WhatsApp and can respond based on predefined logic (see `src/bot/whatsappBot.ts`).
- You can extend the bot's functionality by modifying `src/bot/whatsappBot.ts`.

### Quick Test (without database or Express)
You can test the WhatsApp bot logic directly using `test.ts`:

1. Run:
   ```
   npx ts-node test.ts
   ```
2. Scan the QR code with your WhatsApp app ("Linked Devices").
3. Send a message "hola" to the linked account. The bot will reply automatically with "¡Hola! Soy un bot 🤖".

This is useful for quick bot testing without running the full backend or database.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.