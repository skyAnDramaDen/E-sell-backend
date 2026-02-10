/*
  Warnings:

  - The `lowestCategoryId` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `subCategoryId` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `topCategoryId` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "lowestCategoryId",
ADD COLUMN     "lowestCategoryId" INTEGER,
DROP COLUMN "subCategoryId",
ADD COLUMN     "subCategoryId" INTEGER NOT NULL,
DROP COLUMN "topCategoryId",
ADD COLUMN     "topCategoryId" INTEGER NOT NULL;
