-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pseudonym" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" DATETIME,
    "verificationToken" TEXT,
    "verificationTokenExpires" DATETIME,
    "image" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isGhostMode" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "auraColor" TEXT DEFAULT '#000000',
    "auraSound" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("auraColor", "auraSound", "bio", "createdAt", "email", "emailVerified", "id", "image", "isGhostMode", "password", "pseudonym", "updatedAt", "verificationToken", "verificationTokenExpires") SELECT "auraColor", "auraSound", "bio", "createdAt", "email", "emailVerified", "id", "image", "isGhostMode", "password", "pseudonym", "updatedAt", "verificationToken", "verificationTokenExpires" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_pseudonym_key" ON "User"("pseudonym");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
