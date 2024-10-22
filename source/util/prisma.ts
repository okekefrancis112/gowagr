import { PrismaClient } from '@prisma/client';
// import { nanoid } from 'nanoid';

// const initDatabase = new PrismaClient({ log: ['error', 'info', 'query', 'warn'] });
// export default initDatabase;

// export const genId = () => nanoid(16);

// import { Client } from 'pg';
import { env } from '../config/env.config';

import { DATABASE_URL, DATABASE_URL_TEST } from '../config/env.config';
import Logger from './logger';
import { Namespaces } from '../constants/namespace.constant';

const logger = new Logger('general', Namespaces.POSTGRES_DATABASE);

let attempts = 0;

const POSTGRES_CONNECT_URL = env.isTest ? DATABASE_URL_TEST : DATABASE_URL;

// export const db = async () => new PrismaClient({ log: ['error', 'info', 'query', 'warn'] })
export const db = new PrismaClient({ log: ['error', 'info', 'query', 'warn'] })
    // .then(({ connection }) => {
    //   logger.info(
    //     `Successfully Connected to PostgresDB. ${connection.host}:${connection.port}/${connection.db.databaseName}`
    //   );
    // })
    // .catch((error) => {
    //   const nextConnect = ++attempts * (Math.random() * 10000);

    //   if (attempts >= 5) {
    //     logger.error('Unable to establish database connection', {
    //       error,
    //     });
    //     process.exit(1);
    //   }

    //   logger.error(
    //     `[Attempt #${attempts}]. Unable to connect to Database (${DATABASE_URL}): ${error}. Reconnecting in ${Math.floor(
    //       nextConnect / 1000
    //     )} seconds`
    //   );
    //   setTimeout(initDatabase, nextConnect);
    // });
