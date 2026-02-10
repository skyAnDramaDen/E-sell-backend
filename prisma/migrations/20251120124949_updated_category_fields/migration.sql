/*
  Warnings:

  - You are about to drop the column `availability` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageLink` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `taxonomyId` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "availability",
DROP COLUMN "category",
DROP COLUMN "imageLink",
DROP COLUMN "taxonomyId",
ADD COLUMN     "lowestCategory" TEXT,
ADD COLUMN     "lowestCategoryId" TEXT,
ADD COLUMN     "subCategory" TEXT,
ADD COLUMN     "subCategoryId" TEXT,
ADD COLUMN     "topCategory" TEXT,
ADD COLUMN     "topCategoryId" TEXT;
