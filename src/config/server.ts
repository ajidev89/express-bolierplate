import express from "express";
import cors from "@/config/cors";
import Database from "@/config/database";
import dotenv from "dotenv";
import router from "@/routes";
import logger from "@/config/logger";
import morgan from "morgan";

dotenv.config();

class Server {
    public database;
    public cors;
    public app;
    public port;

    constructor() {
        this.database = new Database();
        this.cors = cors;
        this.app = express();
        this.port = process.env.PORT || 8800;
    }

    public async start(): Promise<void> {
        try {
            await this.database.connect();
            this.app.use(this.cors);
            this.app.use(morgan("tiny"));
            this.app.use(express.urlencoded({ extended: true }));
            this.app.use(express.json());
            this.app.use("/v1", router);

            this.app.listen(this.port, () => {
                logger.info("Server Start");
            });
        } catch (error) {
            console.log(error);
        }
    }
}

export default new Server();
