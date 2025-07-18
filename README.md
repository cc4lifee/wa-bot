# WhatsApp Bot

This project is a WhatsApp bot built using Node.js, Express, and the Baileys library. It utilizes PostgreSQL as the database, managed through an ORM, and is containerized using Docker.

## Project Structure

```
whatsapp-bot
├── src
│   ├── app.ts                # Entry point of the application
│   ├── bot
│   │   └── index.ts          # WhatsApp bot logic
│   ├── controllers
│   │   └── index.ts          # Route controllers
│   ├── database
│   │   └── orm.ts            # Database ORM
│   ├── routes
│   │   └── index.ts          # Route definitions
│   └── types
│       └── index.ts          # Type definitions
├── docker-compose.yml         # Docker configuration for PostgreSQL
├── package.json               # npm dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                  # Project documentation
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

- The bot listens for incoming messages on WhatsApp and can respond based on predefined logic.
- You can extend the bot's functionality by modifying the `src/bot/index.ts` file.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.