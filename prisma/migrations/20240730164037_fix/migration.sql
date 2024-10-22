/*
  Warnings:

  - A unique constraint covering the columns `[admin_id]` on the table `adminRoles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "permissions_adminRoleId_key";

-- CreateIndex
CREATE UNIQUE INDEX "adminRoles_admin_id_key" ON "adminRoles"("admin_id");
