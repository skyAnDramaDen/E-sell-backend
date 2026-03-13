/*
  Warnings:

  - Added the required column `name` to the `ConversationParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN     "name" TEXT NOT NULL;
