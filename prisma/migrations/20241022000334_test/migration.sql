/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_PostToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RolePermissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserFavorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserFollows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserInterests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_likedBy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `adminRoles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `otps` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ICurrency" AS ENUM ('NGN', 'USD', 'GBP', 'EUR', 'CAD');

-- DropForeignKey
ALTER TABLE "_PostToTag" DROP CONSTRAINT "_PostToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_PostToTag" DROP CONSTRAINT "_PostToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "_RolePermissions" DROP CONSTRAINT "_RolePermissions_A_fkey";

-- DropForeignKey
ALTER TABLE "_RolePermissions" DROP CONSTRAINT "_RolePermissions_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserFavorites" DROP CONSTRAINT "_UserFavorites_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFavorites" DROP CONSTRAINT "_UserFavorites_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserInterests" DROP CONSTRAINT "_UserInterests_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserInterests" DROP CONSTRAINT "_UserInterests_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserTags" DROP CONSTRAINT "_UserTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserTags" DROP CONSTRAINT "_UserTags_B_fkey";

-- DropForeignKey
ALTER TABLE "_likedBy" DROP CONSTRAINT "_likedBy_A_fkey";

-- DropForeignKey
ALTER TABLE "_likedBy" DROP CONSTRAINT "_likedBy_B_fkey";

-- DropForeignKey
ALTER TABLE "adminRoles" DROP CONSTRAINT "adminRoles_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_postId_fkey";

-- DropForeignKey
ALTER TABLE "otps" DROP CONSTRAINT "otps_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_authorId_fkey";

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "notification_count" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "verified_coach" BOOLEAN DEFAULT false,
ADD COLUMN     "verified_coach_at" TIMESTAMP(3),
ALTER COLUMN "image" SET DEFAULT '',
ALTER COLUMN "verified_email" SET DEFAULT false;

-- DropTable
DROP TABLE "_PostToTag";

-- DropTable
DROP TABLE "_RolePermissions";

-- DropTable
DROP TABLE "_UserFavorites";

-- DropTable
DROP TABLE "_UserFollows";

-- DropTable
DROP TABLE "_UserInterests";

-- DropTable
DROP TABLE "_UserTags";

-- DropTable
DROP TABLE "_likedBy";

-- DropTable
DROP TABLE "adminRoles";

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "comments";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "posts";

-- DropTable
DROP TABLE "tags";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT,
    "notificationCategory" TEXT,
    "content" TEXT,
    "actionLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userData" JSONB NOT NULL,
    "currency" "ICurrency" NOT NULL,
    "walletAccountNumber" TEXT NOT NULL,
    "creditTransactions" DECIMAL(65,30) NOT NULL,
    "debitTransactions" DECIMAL(65,30) NOT NULL,
    "totalCreditTransactions" DECIMAL(65,30) NOT NULL,
    "totalDebitTransactions" DECIMAL(65,30) NOT NULL,
    "status" "Status" NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "balance_before" DECIMAL(65,30) NOT NULL,
    "balance_after" DECIMAL(65,30) NOT NULL,
    "last_debit_amount" DECIMAL(65,30) NOT NULL,
    "last_deposit_amount" DECIMAL(65,30) NOT NULL,
    "last_debit_date" TIMESTAMP(3) NOT NULL,
    "last_deposit_date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notifications_id_key" ON "notifications"("id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_userId_key" ON "notifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_id_key" ON "wallets"("id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "otps_id_key" ON "otps"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_id_key" ON "payments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_id_key" ON "transactions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
