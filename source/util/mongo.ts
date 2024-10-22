// import { Client } from 'pg';
// import { env } from '../config/env.config';

// import { POSTGRES_DB_NAME, DATABASE_URL, DATABASE_URL_TEST } from '../config/env.config';
// import Logger from './logger';
// import { Namespaces } from '../constants/namespace.constant';

// const logger = new Logger('general', Namespaces.POSTGRES_DATABASE);

// let attempts = 0;

// const POSTGRES_CONNECT_URL = env.isTest ? DATABASE_URL_TEST : DATABASE_URL;

// export const initDatabase = async () =>
//   Client(`${POSTGRES_CONNECT_URL}`, {
//     connectTimeoutMS: 20000,
//     keepAlive: true,
//     socketTimeoutMS: 0,
//     dbName: POSTGRES_DB_NAME,
//   })
//     .then(({ connection }) => {
//       logger.info(
//         `Successfully Connected to PostgresDB. ${connection.host}:${connection.port}/${connection.db.databaseName}`
//       );
//     })
//     .catch((error) => {
//       const nextConnect = ++attempts * (Math.random() * 10000);

//       if (attempts >= 5) {
//         logger.error('Unable to establish database connection', {
//           error,
//         });
//         process.exit(1);
//       }

//       logger.error(
//         `[Attempt #${attempts}]. Unable to connect to Database (${DATABASE_URL}): ${error}. Reconnecting in ${Math.floor(
//           nextConnect / 1000
//         )} seconds`
//       );
//       setTimeout(initDatabase, nextConnect);
//     });
