import { Sequelize } from "sequelize";
import { config } from "./env";

export class DatabaseConnection {
  private static instance: Sequelize;

  public static getInstance(): Sequelize {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = DatabaseConnection.createConnection();
    }
    return DatabaseConnection.instance;
  }

  private static createConnection(): Sequelize {
    const { DB_CONNECTION_STRING } = config;
    const dbType = this.getDialectFromConnectionString(DB_CONNECTION_STRING);

    const sequelizeConfig = {
      logging: config.NODE_ENV === "development" ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    };

    switch (dbType) {
      case "mysql":
        return new Sequelize(DB_CONNECTION_STRING, {
          ...sequelizeConfig,
          dialect: "mysql",
          // dialectOptions: {
          //   charset: "utf8mb4",
          //   collate: "utf8mb4_unicode_ci",
          //   timezone: "+00:00",
          // },
        });

      case "mssql":
        return new Sequelize(DB_CONNECTION_STRING, {
          ...sequelizeConfig,
          dialect: "mssql",
          dialectOptions: {
            options: {
              encrypt: true,
              trustServerCertificate: true,
              requestTimeout: 30000,
            },
          },
        });

      case "oracle":
        return new Sequelize(DB_CONNECTION_STRING, {
          ...sequelizeConfig,
          dialect: "oracle",
          dialectOptions: {
            connectTimeout: 30000,
            requestTimeout: 30000,
          },
        });

      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }

  private static getDialectFromConnectionString(
    connectionString: string
  ): string {
    const protocol = connectionString.split("://")[0];
    switch (protocol) {
      case "mysql":
        return "mysql";
      case "mssql":
      case "sqlserver":
        return "mssql";
      case "oracle":
        return "oracle";
      default:
        throw new Error(
          `Cannot determine database type from connection string: ${connectionString}`
        );
    }
  }

  public static async testConnection(): Promise<void> {
    try {
      await DatabaseConnection.getInstance().authenticate();
      console.log("✅ Database connection established successfully");
    } catch (error) {
      console.error("❌ Unable to connect to the database:", error);
      throw error;
    }
  }

  public static async syncDatabase(force: boolean = false): Promise<void> {
    try {
      await DatabaseConnection.getInstance().sync({ force });
      console.log("✅ Database synchronized successfully");
    } catch (error) {
      console.error("❌ Database synchronization failed:", error);
      throw error;
    }
  }

  public static async closeConnection(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.close();
      console.log("🔒 Database connection closed");
    }
  }
}
