/**
 * KnockoutNotes — Android Icon & Splash Screen Updater (scripts/update-app-icons.js)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ICON_SRC = path.join(ROOT, 'knockoutnotes_icon.png');
const WORDMARK_SRC = path.join(ROOT, 'knockoutnotes_wordmark.png');
const RES_DIR = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

if (!fs.existsSync(ICON_SRC)) {
  console.error('Source icon not found:', ICON_SRC);
  process.exit(1);
}

const MIPMAP_DIRS = [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi'
];

MIPMAP_DIRS.forEach(dirName => {
  const targetDir = path.join(RES_DIR, dirName);
  if (fs.existsSync(targetDir)) {
    fs.copyFileSync(ICON_SRC, path.join(targetDir, 'ic_launcher.png'));
    fs.copyFileSync(ICON_SRC, path.join(targetDir, 'ic_launcher_round.png'));
    fs.copyFileSync(ICON_SRC, path.join(targetDir, 'ic_launcher_foreground.png'));
    console.log(`[Icon] Updated icons in ${dirName}`);
  }
});

const DRAWABLE_DIRS = [
  'drawable',
  'drawable-land-hdpi',
  'drawable-land-mdpi',
  'drawable-land-xhdpi',
  'drawable-land-xxhdpi',
  'drawable-land-xxxhdpi',
  'drawable-port-hdpi',
  'drawable-port-mdpi',
  'drawable-port-xhdpi',
  'drawable-port-xxhdpi',
  'drawable-port-xxxhdpi'
];

DRAWABLE_DIRS.forEach(dirName => {
  const targetDir = path.join(RES_DIR, dirName);
  if (fs.existsSync(targetDir)) {
    fs.copyFileSync(ICON_SRC, path.join(targetDir, 'splash.png'));
    console.log(`[Splash] Updated splash.png in ${dirName}`);
  }
});

console.log('[Icon] All Android app icons and splash screens successfully applied.');
