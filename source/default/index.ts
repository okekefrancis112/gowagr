import {
    TECHNICAL_EMAIL,
    TECHNICAL_PASSWORD,
    TECHNICAL_FIRST_NAME,
    TECHNICAL_LAST_NAME,
    TECHNICAL_USER_NAME
  } from '../config';
  import adminUserRepository from '../repositories/adminUser.repository';
  import permissionRepository from '../repositories/permission.repository';
  import roleRepository from '../repositories/role.repository';

  // Permissions
  const permissions = [
    // Overview
    {
      permission_name: 'View Overview',
      permission_description: 'Can view Overview',
      permission_alias: 'view-overview',
      hierarchy: 3,
    },

    // Statistics
    {
      permission_name: 'View Statistics',
      permission_description: 'Can view Statistics',
      permission_alias: 'view-statistics',
      hierarchy: 3,
    },

    {
      permission_name: 'Export Statistics',
      permission_description: 'Can export Statistics',
      permission_alias: 'export-statistics',
      hierarchy: 2,
    },

    // Notifications
    {
      permission_name: 'View Notifications',
      permission_description: 'Can view Notifications',
      permission_alias: 'view-notifications',
      hierarchy: 3,
    },
    {
      permission_name: 'Create Notifications',
      permission_description: 'Can create Notifications',
      permission_alias: 'create-notifications',
      hierarchy: 2,
    },

    {
      permission_name: 'Export Notifications',
      permission_description: 'Can export Notifications',
      permission_alias: 'export-notifications',
      hierarchy: 2,
    },

    {
      permission_name: 'Delete Notifications',
      permission_description: 'Can delete Notifications',
      permission_alias: 'delete-notifications',
      hierarchy: 2,
    },

    // Users
    {
      permission_name: 'Export Users',
      permission_description: 'Can export Users',
      permission_alias: 'export-users',
      hierarchy: 2,
    },

    {
      permission_name: 'Create Users',
      permission_description: 'Can create Users',
      permission_alias: 'create-users',
      hierarchy: 2,
    },

    {
      permission_name: 'View Users',
      permission_description: 'Can view Users',
      permission_alias: 'view-users',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Users',
      permission_description: 'Can delete Users',
      permission_alias: 'delete-users',
      hierarchy: 1,
    },

    // Projects
    {
      permission_name: 'Create Projects',
      permission_description: 'Can create Projects',
      permission_alias: 'create-project',
      hierarchy: 2,
    },
    {
      permission_name: 'View Projects',
      permission_description: 'Can view Projects',
      permission_alias: 'view-project',
      hierarchy: 3,
    },

    {
      permission_name: 'Export Projects',
      permission_description: 'Can export Projects',
      permission_alias: 'export-project',
      hierarchy: 3,
    },
    {
      permission_name: 'Delete Projects',
      permission_description: 'Can delete projects',
      permission_alias: 'delete-project',
      hierarchy: 2,
    },

    // Admin Users
    {
      permission_name: 'Create Admin Users',
      permission_description: 'Can create Admin Users',
      permission_alias: 'create-admin-users',
      hierarchy: 2,
    },
    {
      permission_name: 'View Admin Users',
      permission_description: 'Can view Admin Users',
      permission_alias: 'view-admin-users',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Admin Users',
      permission_description: 'Can delete Admin Users',
      permission_alias: 'delete-admin-users',
      hierarchy: 1,
    },

    // Track Record
    {
      permission_name: 'Create Track Record',
      permission_description: 'Can create Track Record',
      permission_alias: 'create-track-record',
      hierarchy: 2,
    },
    {
      permission_name: 'View Track Record',
      permission_description: 'Can view Track Record',
      permission_alias: 'view-track-record',
      hierarchy: 3,
    },
    {
      permission_name: 'Delete Track Record',
      permission_description: 'Can delete Track Record',
      permission_alias: 'delete-track-record',
      hierarchy: 2,
    },

    // Roles
    {
      permission_name: 'Create Roles',
      permission_description: 'Can manage Roles',
      permission_alias: 'create-roles',
      hierarchy: 2,
    },

    {
      permission_name: 'View Roles',
      permission_description: 'Can view Roles',
      permission_alias: 'view-roles',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Roles',
      permission_description: 'Can delete Roles',
      permission_alias: 'delete-roles',
      hierarchy: 1,
    },

    // Referrals
    {
      permission_name: 'Export Referrals',
      permission_description: 'Can export Referrals',
      permission_alias: 'export-referrals',
      hierarchy: 2,
    },
    {
      permission_name: 'View Referrals',
      permission_description: 'Can view Referrals',
      permission_alias: 'view-referrals',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Referrals',
      permission_description: 'Can delete Referrals',
      permission_alias: 'delete-referrals',
      hierarchy: 1,
    },

    // Wallets
    {
      permission_name: 'Export Wallet',
      permission_description: 'Can export Wallet',
      permission_alias: 'export-wallet',
      hierarchy: 2,
    },
    {
      permission_name: 'View Wallet',
      permission_description: 'Can view Wallet',
      permission_alias: 'view-wallet',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Wallet',
      permission_description: 'Can delete Wallet',
      permission_alias: 'delete-wallet',
      hierarchy: 1,
    },

    // Permissions
    {
      permission_name: 'View Permissions',
      permission_description: 'Can view Permissions',
      permission_alias: 'view-permissions',
      hierarchy: 3,
    },

    // Faqs
    {
      permission_name: 'Create Faqs',
      permission_description: 'Can create Faqs',
      permission_alias: 'create-faqs',
      hierarchy: 2,
    },

    {
      permission_name: 'Export Faqs',
      permission_description: 'Can export Faqs',
      permission_alias: 'export-faqs',
      hierarchy: 2,
    },

    {
      permission_name: 'View Faqs',
      permission_description: 'Can view Faqs',
      permission_alias: 'view-faqs',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Faqs',
      permission_description: 'Can delete Faqs',
      permission_alias: 'delete-faqs',
      hierarchy: 1,
    },

     // Learns
     {
      permission_name: 'Create Learns',
      permission_description: 'Can create Learns',
      permission_alias: 'create-learns',
      hierarchy: 2,
    },

    {
      permission_name: 'View Learns',
      permission_description: 'Can view Learns',
      permission_alias: 'view-learns',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Learns',
      permission_description: 'Can delete Learns',
      permission_alias: 'delete-learns',
      hierarchy: 1,
    },

    // Testimonials
    {
      permission_name: 'Create Testimonials',
      permission_description: 'Can create Testimonials',
      permission_alias: 'create-testimonials',
      hierarchy: 2,
    },

    {
      permission_name: 'View Testimonials',
      permission_description: 'Can view Testimonials',
      permission_alias: 'view-testimonials',
      hierarchy: 3,
    },

    {
      permission_name: 'Export Testimonials',
      permission_description: 'Can export Testimonials',
      permission_alias: 'export-testimonials',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Testimonials',
      permission_description: 'Can delete Testimonials',
      permission_alias: 'delete-testimonials',
      hierarchy: 2,
    },

    // Audits
    {
      permission_name: 'Export Audits',
      permission_description: 'Can export Audits',
      permission_alias: 'export-audits',
      hierarchy: 2,
    },

    {
      permission_name: 'View Audits',
      permission_description: 'Can view Audits',
      permission_alias: 'view-audits',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Audits',
      permission_description: 'Can delete Audits',
      permission_alias: 'delete-audits',
      hierarchy: 1,
    },

    // User Portfolio
    {
      permission_name: 'Create Portfolio',
      permission_description: 'Can create Portfolio',
      permission_alias: 'create-portfolio',
      hierarchy: 2,
    },

    {
      permission_name: 'View Portfolio',
      permission_description: 'Can view Portfolio',
      permission_alias: 'view-portfolio',
      hierarchy: 3,
    },

    {
      permission_name: 'Export Portfolio',
      permission_description: 'Can export Portfolio',
      permission_alias: 'export-portfolio',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Portfolio',
      permission_description: 'Can delete Portfolio',
      permission_alias: 'delete-portfolio',
      hierarchy: 1,
    },

    // Exchange Rate
    {
      permission_name: 'Create Exchange Rate',
      permission_description: 'Can create Exchange Rate',
      permission_alias: 'create-exchange-rate',
      hierarchy: 1,
    },

    {
      permission_name: 'View Exchange Rate',
      permission_description: 'Can view Exchange Rate',
      permission_alias: 'view-exchange-rates',
      hierarchy: 3,
    },

    {
      permission_name: 'Delete Exchange Rate',
      permission_description: 'Can delete Exchange Rate',
      permission_alias: 'delete-exchange-rate',
      hierarchy: 1,
    },
  ];

  const superAdmin = [
    // Views
    'view-overview',
    'view-statistics',
    'view-portfolio',
    'view-track-record',
    'view-referrals',
    'view-wallet',
    'view-audits',
    'view-faqs',
    'view-testimonials',
    'view-notifications',
    'view-permissions',
    'view-roles',
    'view-admin-users',
    'view-project',
    'view-learns',
    'view-exchange-rates',

    // Create
    'create-portfolio',
    'create-faqs',
    'create-testimonials',
    'create-notifications',
    'create-users',
    'create-roles',
    'create-project',
    'create-admin-users',
    'create-track-record',
    'create-learns',
    'create-exchange-rate',

    // Export
    'export-portfolio',
    'export-faqs',
    'export-testimonials',
    'export-notifications',
    'export-roles',
    'export-project',
    'export-admin-users',
    'export-referrals',
    'export-statistics',
    'export-wallet',
    'export-audits',

    // Delete
    'delete-notifications',
    'delete-project',
    'delete-track-record',
    'delete-referrals',
    'delete-faqs',
    'delete-testimonials',
    'delete-learns',
    'delete-exchange-rates',
  ];

  const defaultAdmin = [
    'view-overview',
    'view-statistics',
    'manage-statistics',
    'view-project',
    'view-faqs',
    'view-testimonials',
    'view-wallet',
    'view-track-record',
    'view-notifications',
    'view-learns',
    'view-exchange-rates',
  ];


  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Seed Permissions

  export async function seedPermissions() {
    permissions.forEach(async (e: any) => {
      const checkPermissions = await permissionRepository.getOne({
        where: { permission_alias: e.permission_alias }
      });
      if (checkPermissions) {
        console.log(`${checkPermissions.permission_alias} exists already`);
      } else {
        const saved = await permissionRepository.create({
          permission_name: e.permission_name,
          permission_description: e.permission_description,
          permission_alias: e.permission_alias,
          hierarchy: e.hierarchy,
        });
        console.log(`${saved.permission_name} created.`);
      }
    });
  }

  // Seed Technical Admin

  export async function seedTechnicalAdminRole() {
    await delay(15000);
    const all_permissions = await permissionRepository.get({});
    if (all_permissions.length > 0) {
      const all_permits = await permissionRepository.get({
        where: { permission_alias: { in: permissions.map((permits) => permits.permission_alias) }, }
      });

      const check_exist = await roleRepository.getOne({
        where: { role_name: 'Technical Admin' }
      });

      if (check_exist) {
        console.log('Technical Admin Role exists already');
        await roleRepository.atomicUpdate(
          { id: check_exist.id },
          { permissions: {
              connect: all_permits.map((id:any) => ({
                id: id.id,
              })),
            },
          }
        );
      } else {
        const saved = await roleRepository.create({
          role_name: 'Technical Admin',
          role_description: 'Technical Admin Role',
          permissions: {
            connect: all_permits.map((id:any) => ({
              id: id.id,
            })),
          },
          hierarchy: 1,
        });
        console.log(`${saved.role_name} role created.`);
      }
    }
  }

  // Seed SuperAdmin Role

  export async function seedSuperAdminRole() {
    await delay(3000);
    const findPermissions = await permissionRepository.get({
      where: { permission_alias: { in: superAdmin } }
    });

    const permissions = findPermissions.map((e: any) => e.id);

    const checkRole = await roleRepository.getOne({
      where: { role_name: 'Super Admin' }
    });

    if (checkRole) {
      console.log(`${checkRole.role_name} exists already`);

      await roleRepository.atomicUpdate(
        { id: checkRole.id },
        {
          permissions: {
            connect: permissions.map((id:any) => ({
              id: id,
            })),
          },
        }
      );
    } else {
      const saved = await roleRepository.create({
        role_name: 'Super Admin',
        role_description: 'Super Admin Role',
        permissions: {
          connect: permissions.map((id:any) => ({
            id: id,
          })),
        },
      });
      console.log(`${saved.role_name} role created.`);
    }
  }

  // Seed Default Role

  export async function seedDefaultAdminRole() {
    await delay(3000);
    const findPermissions = await permissionRepository.get({
      where: { permission_alias: { in: defaultAdmin } }
    });

    const permissions = findPermissions.map((e: any) => e.id);

    const Role = await roleRepository.get({});

    const checkRole = await roleRepository.getOne({
      where: { role_name: 'Default' }
    });

    if (checkRole) {
      console.log(`${checkRole.role_name} exists already`);

      const role = await roleRepository.atomicUpdate(
        { id: checkRole.id },
        {
          permissions: {
            connect: permissions.map((id:any) => ({
              id: id,
            })),
          },
        }
      );
    } else {
      const saved = await roleRepository.create({
        role_name: 'Default',
        role_description: 'Default Role',
        permissions: {
          connect: permissions.map((id:any) => ({
            id: id,
          })),
        },
      });
      console.log(`${saved.role_name} role created.`);
    }
  }

  // Seed Default Admin User
  export async function seedDefaultTechnicalAdminUser() {
    await delay(3000);
    const check_user = await adminUserRepository.getOne({
      where: { email: String(TECHNICAL_EMAIL) }
    });
    const role = await roleRepository.getOne({
      where: { role_name: 'Technical Admin' }
    });

    if (check_user) {
      console.log(`${check_user.email} exists already`);

      await adminUserRepository.atomicUpdate(
        { id: check_user.id },
        {   roles: {
          connect: [
            { id: role?.id! },
          ]
        }
      }
      );
    } else {
      const user = await adminUserRepository.createFullAdmin({
        fullname: `${String(TECHNICAL_FIRST_NAME)} ${String(TECHNICAL_LAST_NAME)}`,
        username: `${String(TECHNICAL_USER_NAME)}`,
        email: String(TECHNICAL_EMAIL),
        password: String(TECHNICAL_PASSWORD),
        verified_email: true,
        verified_email_at: new Date(),
        roles: {
          connect: [
            { id: role?.id! },
          ]
        }
      });
      console.log(`${user.email} created.`);
    }
  }
