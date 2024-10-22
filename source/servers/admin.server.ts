import { createApp } from '../server';
import { validateEnv } from '../config/env.config';
import { ADMIN_PORT } from '../config/env.config';
import { bindAdminRoutes } from '../util/useRoutes';
import Logger from '../util/logger';
import { Namespaces } from '../constants/namespace.constant';
import {
  seedDefaultAdminRole,
  seedDefaultTechnicalAdminUser,
  seedPermissions,
  seedSuperAdminRole,
  seedTechnicalAdminRole,
} from '../default/index';
import { db } from "../util/prisma";

const name = 'Transactly Admin Service';

const init = () => createApp(name, bindAdminRoutes);
const logger = new Logger('general', Namespaces.ADMIN_SERVER);

(async () => {
  validateEnv();
  db;

  init().listen(ADMIN_PORT, () => {
    logger.info(`Admin Server started successfully on ${ADMIN_PORT}`);
  });

  // await seedPermissions();
  // await seedTechnicalAdminRole();
  // await seedSuperAdminRole();
  // await seedDefaultAdminRole();
  // await seedDefaultTechnicalAdminUser();
})();
