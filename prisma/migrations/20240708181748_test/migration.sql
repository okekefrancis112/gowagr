/*
  Warnings:

  - The `first_login` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `otps` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[admin_id]` on the table `otps` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "first_login",
ADD COLUMN     "first_login" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "otps_userId_key" ON "otps"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "otps_admin_id_key" ON "otps"("admin_id");
