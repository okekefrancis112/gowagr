import { ExpressRequest, createApp } from "../server";
import { validateEnv, USER_PORT } from "../config/env.config";
import { bindUserRoutes } from "../util/useRoutes";
import Logger from "../util/logger";
import { db } from "../util/prisma";
import { Namespaces } from "../constants/namespace.constant";
// import * as redis from "../services/redis.service";


const logger = new Logger("general", Namespaces.USER_SERVER);

const name = "Transactly";

export const init = () => createApp(name, bindUserRoutes);

(async function starters(req: ExpressRequest) {
    validateEnv();
    db;
    // redis;

    init().listen(USER_PORT, () => {
        logger.info(`User Server started successfully on ${USER_PORT}`);
    });
})({} as ExpressRequest);
