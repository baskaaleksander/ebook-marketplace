/*
  Warnings:

  - The `productId` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `balance` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_productId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "productId",
ADD COLUMN     "productId" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "balance",
ADD COLUMN     "stripeStatus" TEXT NOT NULL DEFAULT 'unverified';
