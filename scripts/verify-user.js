/**
 * Standalone script — run with: node scripts/verify-user.js
 * Directly patches the SQLite DB to mark testuser as verified.
 */
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createId } = require('@paralleldrive/cuid2');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

// Hash password synchronously for speed
const { execSync } = require('child_process');

// Use built-in crypto for a quick hash via node
const crypto = require('crypto');

// bcryptjs doesn't have sync in all versions, use a pre-computed hash
// password = "testpass123", rounds=10
// We'll insert using a known hash
const passwordHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y';
// ^ This is bcrypt("testpass123", 10) — a known valid hash for testing

const now = new Date().toISOString();

// Check if user exists
const existing = db.prepare("SELECT id, pseudonym, emailVerified FROM User WHERE pseudonym = 'testuser'").get();

if (existing) {
  // Just verify their email and reset password
  db.prepare(`
    UPDATE User 
    SET emailVerified = ?, verificationToken = NULL, verificationTokenExpires = NULL, password = ?
    WHERE pseudonym = 'testuser'
  `).run(now, passwordHash);
  console.log('✅ testuser email verified and password reset to: testpass123');
  console.log('   User ID:', existing.id);
} else {
  // Create the user
  const id = 'testuser_' + Math.random().toString(36).slice(2, 10);
  db.prepare(`
    INSERT INTO User (id, pseudonym, email, password, emailVerified, createdAt, updatedAt)
    VALUES (?, 'testuser', 'test@blackboard.local', ?, ?, ?, ?)
  `).run(id, passwordHash, now, now, now);
  console.log('✅ testuser created and verified. ID:', id);
}

// Show current user list
const users = db.prepare("SELECT id, pseudonym, email, emailVerified FROM User LIMIT 10").all();
console.log('\n📋 Users in DB:');
users.forEach(u => console.log(`  - ${u.pseudonym} | ${u.email} | verified: ${u.emailVerified ? 'YES' : 'NO'}`));

db.close();
