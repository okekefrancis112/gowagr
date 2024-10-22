/*
  Warnings:

  - Added the required column `userId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `usdExchangeRate` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "currency" DROP NOT NULL,
ALTER COLUMN "userCurrency" DROP NOT NULL,
DROP COLUMN "usdExchangeRate",
ADD COLUMN     "usdExchangeRate" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "isPaid" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
