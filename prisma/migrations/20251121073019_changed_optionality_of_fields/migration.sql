/*
  Warnings:

  - Made the column `subCategory` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subCategoryId` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `topCategory` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `topCategoryId` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "subCategory" SET NOT NULL,
ALTER COLUMN "subCategoryId" SET NOT NULL,
ALTER COLUMN "topCategory" SET NOT NULL,
ALTER COLUMN "topCategoryId" SET NOT NULL;
