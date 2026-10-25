import { PrismaClient } from "@prisma/client";
import logger from "@/config/logger";

export const prisma = new PrismaClient();

class Database {
    public async connect(): Promise<void> {
        try {
            await prisma.$connect();
            const provider = process.env.DB_PROVIDER || "mongodb";
            logger.info(`Database connection successful (${provider})`);
            console.log(`Connected to ${provider}`);
        } catch (error) {
            console.error("Connection to database failed:", error);
            throw new Error("Connection to database failed");
        }
    }
}

export default Database;
