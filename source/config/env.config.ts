import { config } from "dotenv";
import Joi, { ObjectSchema } from "joi";
import path from "path";
import Logger from "../util/logger";
config({ path: path.resolve(__dirname, "../../.env") });
import { Namespaces } from "../constants/namespace.constant";

// environment
export const env = {
    isDev: String(process.env.NODE_ENV).toLowerCase().includes("development"),
    isTest: String(process.env.NODE_ENV).toLowerCase().includes("test"),
    isProd: String(process.env.NODE_ENV).toLowerCase().includes("production"),
    isStaging: String(process.env.NODE_ENV).toLowerCase().includes("staging"),
    env: process.env.NODE_ENV,
};

export const {
    USER_PORT,
    CONSUMER_PORT,
    ADMIN_PORT,
    DATABASE_URL,
    DATABASE_URL_TEST,
    TOKEN_EXPIRE_TIME,
    SERVER_TOKEN_ISSUER,
    SERVER_TOKEN_SECRET,
    AWS_SECRET,
    AWS_ID,
    S3_BUCKET_NAME,

    REDIS_PORT,
    REDIS_HOST,
    REDIS_PASSWORD,

    TECHNICAL_EMAIL,
    TECHNICAL_PASSWORD,
    TECHNICAL_FIRST_NAME,
    TECHNICAL_LAST_NAME,
    TECHNICAL_USER_NAME,
} = process.env;

const logger = new Logger("general", Namespaces.POSTGRES_DATABASE);

const schema = Joi.object({});
const validateAppConfig = (
    schema: ObjectSchema,
    config: Record<string, unknown>
): void => {
    const result = schema.validate(config, {
        abortEarly: false,
        allowUnknown: true,
    });

    if (result.error) {
        logger.error("Application configuration error.", {
            details: result.error.details,
        });

        throw result.error;
    }
};

export const validateEnv = () => {
    try {
        validateAppConfig(schema, process.env);
    } catch (e) {
        console.error("Can't start app. Env config invalid.");
        process.exit(1);
    }
};
