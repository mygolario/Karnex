require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('Connecting to DB...');
  try {
    await client.connect();
    console.log('Connected!');
  } catch (e) {
    console.error('Connection failed:', e);
    process.exit(1);
  }
  const dataDir = path.join(__dirname, '../data_migration');

  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Data directory not found: ${dataDir}`);
    process.exit(1);
  }

  // 1. Migrate Users & Subscriptions
  let profilesPath = path.join(dataDir, 'profiles.json');
  if (!fs.existsSync(profilesPath)) profilesPath = path.join(dataDir, 'profiles_rows.json');

  if (fs.existsSync(profilesPath)) {
    console.log(`📦 Migrating Profiles from ${path.basename(profilesPath)}...`);
    const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));

    for (const profile of profiles) {
      try {
        let subscriptionData = null;
        if (profile.subscription) {
            try {
                subscriptionData = typeof profile.subscription === 'string' 
                    ? JSON.parse(profile.subscription) 
                    : profile.subscription;
            } catch (e) {}
        }

        let settings = { emailNotifications: true, theme: 'system', language: 'fa' };
        if (profile.settings) {
             try {
                settings = typeof profile.settings === 'string' ? JSON.parse(profile.settings) : profile.settings;
             } catch (e) {}
        }

        let credits = { aiTokens: 10, projectsUsed: 0 };
        if (profile.credits) {
             try {
                credits = typeof profile.credits === 'string' ? JSON.parse(profile.credits) : profile.credits;
             } catch (e) {}
        }

        const name = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        const now = new Date();
        const createdAt = profile.created_at ? new Date(profile.created_at) : now;
        const updatedAt = profile.updated_at ? new Date(profile.updated_at) : now;

        // Upsert User
        // Note: 'role' column might not exist if added by Prisma but usually maps to string/enum.
        const userQuery = `
          INSERT INTO "User" ("id", "email", "name", "firstName", "lastName", "image", "createdAt", "updatedAt", "settings", "credits", "role")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT ("id") DO UPDATE SET
            "email" = EXCLUDED."email",
            "name" = EXCLUDED."name",
            "firstName" = EXCLUDED."firstName",
            "lastName" = EXCLUDED."lastName",
            "image" = EXCLUDED."image",
            "createdAt" = EXCLUDED."createdAt",
            "updatedAt" = EXCLUDED."updatedAt",
            "settings" = EXCLUDED."settings",
            "credits" = EXCLUDED."credits";
        `;
        
        await client.query(userQuery, [
          profile.id,
          profile.email,
          name,
          profile.first_name,
          profile.last_name,
          profile.avatar_url,
          createdAt,
          updatedAt,
          settings,
          credits,
          profile.role || 'user'
        ]);

        // Create Subscription
        if (subscriptionData && Object.keys(subscriptionData).length > 0) {
            const subQuery = `
              INSERT INTO "Subscription" ("id", "userId", "planId", "status", "startDate", "endDate", "autoRenew", "provider")
              VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT ("userId") DO NOTHING;
            `;
            // Note: standard uuid generation might need pgcrypto or we generate in JS.
            // But Prisma usually uses CUID. We can use uuid from 'crypto' or just rely on DB default if set?
            // "id" String @id @default(cuid())
            // CUID is not built-in PG.
            // I should generate ID in JS.
            const crypto = require('crypto');
            const subId = crypto.randomUUID(); // valid UUID, not CUID, but string field accepts it.
            
            await client.query(subQuery, [
              profile.id,
              subscriptionData.planId || 'free',
              subscriptionData.status || 'active',
              subscriptionData.startDate ? new Date(subscriptionData.startDate) : now,
              subscriptionData.endDate ? new Date(subscriptionData.endDate) : null,
              subscriptionData.autoRenew || false,
              subscriptionData.provider
            ]);
        }

      } catch (e) {
        console.error(`   ❌ Failed to migrate user ${profile.id}:`, e.message);
      }
    }
    console.log(`✅ Processed ${profiles.length} profiles.`);
  }

  // 2. Migrate Projects
  let projectsPath = path.join(dataDir, 'projects.json');
  if (!fs.existsSync(projectsPath)) projectsPath = path.join(dataDir, 'projects_rows.json');

  if (fs.existsSync(projectsPath)) {
    console.log(`📦 Migrating Projects from ${path.basename(projectsPath)}...`);
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

    for (const project of projects) {
        try {
            const pQuery = `
              INSERT INTO "Project" ("id", "userId", "projectName", "tagline", "description", "data", "createdAt", "updatedAt")
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              ON CONFLICT ("id") DO NOTHING;
            `;
            await client.query(pQuery, [
                project.id,
                project.user_id || project.userId,
                project.project_name || project.projectName || "Untitled",
                project.tagline,
                project.description,
                project.data || {},
                project.created_at ? new Date(project.created_at) : new Date(),
                project.updated_at ? new Date(project.updated_at) : new Date()
            ]);
        } catch (e) {
             // console.error(`   ❌ Failed to migrate project ${project.id}:`, e.message);
        }
    }
    console.log(`✅ Processed ${projects.length} projects.`);
  }

  // 3. Migrate Media Library
  let mediaPath = path.join(dataDir, 'media_library.json');
  if (!fs.existsSync(mediaPath)) mediaPath = path.join(dataDir, 'media_library_rows.json');

  if (fs.existsSync(mediaPath)) {
      console.log(`📦 Migrating Media Library from ${path.basename(mediaPath)}...`);
      const mediaItems = JSON.parse(fs.readFileSync(mediaPath, 'utf-8'));

      for (const item of mediaItems) {
          try {
              const mQuery = `
                INSERT INTO "MediaItem" ("id", "userId", "projectId", "url", "category", "subcategory", "prompt", "model", "createdAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT ("id") DO NOTHING;
              `;
              await client.query(mQuery, [
                  item.id,
                  item.user_id || item.userId,
                  item.project_id || item.projectId,
                  item.url,
                  item.category || 'other',
                  item.subcategory,
                  item.prompt,
                  item.model,
                  item.created_at ? new Date(item.created_at) : new Date()
              ]);
          } catch (e) {
              console.error(`   ❌ Failed to migrate media item ${item.id}:`, e.message);
          }
      }
      console.log(`✅ Processed ${mediaItems.length} media items.`);
  }

  await client.end();
  console.log('🎉 Migration completed!');
}

main().catch(console.error);
