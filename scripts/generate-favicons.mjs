/**
 * Script to generate favicon sizes from the existing logo
 * Run with: node scripts/generate-favicons.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Source image - using the existing icon
const SOURCE_IMAGE = path.join(iconsDir, 'icon-512x512.png');

// Favicon sizes to generate
const SIZES = [
  { size: 16, name: 'favicon-16x16.png', dir: publicDir },
  { size: 32, name: 'favicon-32x32.png', dir: publicDir },
  { size: 180, name: 'apple-touch-icon.png', dir: publicDir },
];

async function generateFavicons() {
  console.log('🎨 Generating favicon sizes...\n');
  
  for (const { size, name, dir } of SIZES) {
    const outputPath = path.join(dir, name);
    
    try {
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }
  
  console.log('\n🎉 Favicon generation complete!');
}

generateFavicons().catch(console.error);
