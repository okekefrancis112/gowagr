-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT DEFAULT 'https://api.realworld.io/images/smiley-cyrus.jpeg',
    "bio" TEXT,
    "location" TEXT,
    "country" TEXT,
    "dob" TIMESTAMP(3),
    "accepted_terms_conditions" BOOLEAN,
    "is_disabled" BOOLEAN,
    "verified_email" BOOLEAN,
    "verified_email_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN,
    "is_deleted_at" TIMESTAMP(3),
    "first_login" BOOLEAN,
    "last_login" TIMESTAMP(3),
    "reset_password_token" TEXT,
    "reset_password_expires" TIMESTAMP(3),
    "login_count" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adminRoles" (
    "id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "role_description" TEXT,
    "status" BOOLEAN DEFAULT true,
    "hierarchy" INTEGER DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "admin_id" TEXT,

    CONSTRAINT "adminRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "permission_name" TEXT NOT NULL,
    "permission_description" TEXT,
    "permission_alias" TEXT,
    "hierarchy" INTEGER,
    "adminRoleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "adminRoles_role_name_key" ON "adminRoles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "adminRoles_admin_id_key" ON "adminRoles"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_adminRoleId_key" ON "permissions"("adminRoleId");

-- AddForeignKey
ALTER TABLE "adminRoles" ADD CONSTRAINT "adminRoles_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_adminRoleId_fkey" FOREIGN KEY ("adminRoleId") REFERENCES "adminRoles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
