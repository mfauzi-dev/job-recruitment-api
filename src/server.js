import { app } from "./app.js";
import sequelize from "./config/database.js";
import { logger } from "./config/logger.js";
import dotenv from "dotenv";
import { Role, User, Company, Job, Application } from "./models/index.js";
dotenv.config();

(async () => {
    try {
        await sequelize.authenticate();
        logger.info("Database connection has been established successfully.");

        // await sequelize.sync();
        // logger.info("Database synced successfully.");

        const PORT = process.env.APP_PORT || 5000;
        app.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error(`Unable to connect to the database: ${error.message}`);
    }
})();
