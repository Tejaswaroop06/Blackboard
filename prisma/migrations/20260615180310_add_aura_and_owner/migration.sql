-- AlterTable
ALTER TABLE "User" ADD COLUMN "auraColor" TEXT DEFAULT '#000000';
ALTER TABLE "User" ADD COLUMN "auraSound" TEXT;

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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Club_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Club" ("createdAt", "description", "frequency", "generation", "genre", "id", "isLocked", "isPersonal", "isStation", "name", "ownerId", "parentId", "updatedAt") SELECT "createdAt", "description", "frequency", "generation", "genre", "id", "isLocked", "isPersonal", "isStation", "name", "ownerId", "parentId", "updatedAt" FROM "Club";
DROP TABLE "Club";
ALTER TABLE "new_Club" RENAME TO "Club";
CREATE UNIQUE INDEX "Club_frequency_key" ON "Club"("frequency");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
