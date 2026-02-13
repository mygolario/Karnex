import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dataDir = path.join(__dirname, '../data_migration');

  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Data directory not found: ${dataDir}`);
    console.error('Please create a "data_migration" folder in the project root and place your Supabase JSON exports there.');
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
        // Parse subscription if it exists
        let subscriptionData = null;
        if (profile.subscription) {
            // It might be a JSON object or a string depending on export
            try {
                subscriptionData = typeof profile.subscription === 'string' 
                    ? JSON.parse(profile.subscription) 
                    : profile.subscription;
            } catch (e) {
                console.warn(`   ⚠️ Could not parse subscription for ${profile.id}`);
            }
        }

        // Parse settings/credits if they strictly match or default them
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


        // Create User
        await prisma.user.upsert({
          where: { id: profile.id },
          update: {
            email: profile.email || undefined,
            name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            firstName: profile.first_name,
            lastName: profile.last_name,
            image: profile.avatar_url,
            createdAt: profile.created_at ? new Date(profile.created_at) : undefined,
            updatedAt: profile.updated_at ? new Date(profile.updated_at) : undefined,
            settings: settings,
            credits: credits,
          },
          create: {
            id: profile.id,
            email: profile.email,
            name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            firstName: profile.first_name,
            lastName: profile.last_name,
            image: profile.avatar_url,
            createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
            updatedAt: profile.updated_at ? new Date(profile.updated_at) : new Date(),
            settings: settings,
            credits: credits,
            role: profile.role || 'user',
          },
        });

        // Create Subscription
        if (subscriptionData && Object.keys(subscriptionData).length > 0) {
            await prisma.subscription.create({
                data: {
                    userId: profile.id,
                    planId: subscriptionData.planId || 'free',
                    status: subscriptionData.status || 'active',
                    startDate: subscriptionData.startDate ? new Date(subscriptionData.startDate) : new Date(),
                    endDate: subscriptionData.endDate ? new Date(subscriptionData.endDate) : null,
                    autoRenew: subscriptionData.autoRenew || false,
                    provider: subscriptionData.provider,
                }
            }).catch(e => {
                // Ignore unique constraint violations (subscription already exists)
            });
        }

      } catch (e) {
        console.error(`   ❌ Failed to migrate user ${profile.id}:`, e);
      }
    }
    console.log(`✅ Processed ${profiles.length} profiles.`);
  } else {
    console.log('⚠️ profiles.json or profiles_rows.json not found. Skipping users.');
  }

  // 2. Migrate Projects
  let projectsPath = path.join(dataDir, 'projects.json');
  if (!fs.existsSync(projectsPath)) projectsPath = path.join(dataDir, 'projects_rows.json');

  if (fs.existsSync(projectsPath)) {
    console.log(`📦 Migrating Projects from ${path.basename(projectsPath)}...`);
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

    for (const project of projects) {
        try {
            await prisma.project.create({
                data: {
                    id: project.id,
                    userId: project.user_id || project.userId, // handle snake_case from supabase
                    projectName: project.project_name || project.projectName || "Untitled",
                    tagline: project.tagline,
                    description: project.description,
                    data: project.data || {}, // The big JSON blob
                    createdAt: project.created_at ? new Date(project.created_at) : new Date(),
                    updatedAt: project.updated_at ? new Date(project.updated_at) : new Date(),
                }
            });
        } catch (e) {
             // console.error(`   ❌ Failed to migrate project ${project.id}:`, e);
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
              await prisma.mediaItem.create({
                  data: {
                      id: item.id,
                      userId: item.user_id || item.userId,
                      projectId: item.project_id || item.projectId,
                      url: item.url,
                      category: item.category || 'other',
                      subcategory: item.subcategory,
                      prompt: item.prompt,
                      model: item.model,
                      createdAt: item.created_at ? new Date(item.created_at) : new Date(),
                  }
              });
          } catch (e) {
              console.error(`   ❌ Failed to migrate media item ${item.id}:`, e);
          }
      }
      console.log(`✅ Processed ${mediaItems.length} media items.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
