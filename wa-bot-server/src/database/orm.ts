import { Sequelize } from 'sequelize';

export class DatabaseORM {
    private sequelize: Sequelize;

   constructor(
        database = process.env.DB_NAME!,
        username = process.env.DB_USER!,
        password = process.env.DB_PASS!,
        host = process.env.DB_HOST!
    ) {
        this.sequelize = new Sequelize(database, username, password, {
            host: host,
            dialect: 'postgres',
        });
    }

    async connect() {
        try {
            await this.sequelize.authenticate();
            console.log('Connection to the database has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }

    // Define your models and methods for CRUD operations here
    // Example: create, read, update, delete methods
}