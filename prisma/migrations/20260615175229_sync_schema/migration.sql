/*
  Warnings:

  - You are about to drop the column `auraColor` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `auraSound` on the `User` table. All the data in the column will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Club" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "genre" TEXT NOT NULL DEFAULT 'GENERAL',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "frequency" REAL,
    "isStation" BOOLEAN NOT NULL DEFAULT false,
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Club" ("createdAt", "description", "generation", "genre", "id", "isLocked", "name", "parentId", "updatedAt") SELECT "createdAt", "description", "generation", "genre", "id", "isLocked", "name", "parentId", "updatedAt" FROM "Club";
DROP TABLE "Club";
ALTER TABLE "new_Club" RENAME TO "Club";
CREATE UNIQUE INDEX "Club_frequency_key" ON "Club"("frequency");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pseudonym" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" DATETIME,
    "verificationToken" TEXT,
    "verificationTokenExpires" DATETIME,
    "image" TEXT,
    "isGhostMode" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("bio", "createdAt", "email", "emailVerified", "id", "image", "isGhostMode", "password", "pseudonym", "updatedAt") SELECT "bio", "createdAt", "email", "emailVerified", "id", "image", "isGhostMode", "password", "pseudonym", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_pseudonym_key" ON "User"("pseudonym");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
