#!/usr/bin/env node

/**
 * Package script for IT Helpdesk Agent
 * Creates a zip file containing all necessary files for Teams app deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const appPackageDir = path.join(rootDir, 'appPackage');
const pluginsDir = path.join(rootDir, 'plugins');
const adaptiveCardsDir = path.join(rootDir, 'adaptiveCards');
const outputDir = path.join(rootDir, 'dist');
const outputFile = path.join(outputDir, 'ITHelpdesk-Agent.zip');

console.log('📦 Packaging IT Helpdesk Agent...\n');

// Check if required files exist
const requiredFiles = [
  path.join(appPackageDir, 'manifest.json'),
  path.join(appPackageDir, 'declarativeAgent.json'),
  path.join(pluginsDir, 'servicenow-plugin.json'),
  path.join(pluginsDir, 'servicenow-openapi.yaml')
];

console.log('✓ Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`  ✗ Missing: ${path.relative(rootDir, file)}`);
    allFilesExist = false;
  } else {
    console.log(`  ✓ Found: ${path.relative(rootDir, file)}`);
  }
});

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing. Cannot create package.');
  process.exit(1);
}

// Check for icons
const colorIcon = path.join(appPackageDir, 'color.png');
const outlineIcon = path.join(appPackageDir, 'outline.png');

if (!fs.existsSync(colorIcon) || !fs.existsSync(outlineIcon)) {
  console.warn('\n⚠️  Warning: Icon files not found!');
  console.warn('  Please replace color.png.placeholder and outline.png.placeholder with actual PNG icons:');
  console.warn(`    - ${path.relative(rootDir, colorIcon)} (192x192 px)`);
  console.warn(`    - ${path.relative(rootDir, outlineIcon)} (32x32 px)`);
  console.warn('\n  Package will be created without icons.\n');
}

// Create dist directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('\n✓ Created dist directory');
}

// Create the zip package
console.log('\n📦 Creating package...');

try {
  // Remove old package if exists
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }

  // Create zip using system zip command
  const filesToZip = [
    'appPackage/manifest.json',
    'appPackage/declarativeAgent.json',
    'plugins/servicenow-plugin.json',
    'plugins/servicenow-openapi.yaml'
  ];

  // Add icons if they exist
  if (fs.existsSync(colorIcon)) {
    filesToZip.push('appPackage/color.png');
  }
  if (fs.existsSync(outlineIcon)) {
    filesToZip.push('appPackage/outline.png');
  }

  // Add adaptive cards
  if (fs.existsSync(adaptiveCardsDir)) {
    const cards = fs.readdirSync(adaptiveCardsDir).filter(f => f.endsWith('.json'));
    cards.forEach(card => {
      filesToZip.push(`adaptiveCards/${card}`);
    });
  }

  const zipCommand = `cd "${rootDir}" && zip -r "${outputFile}" ${filesToZip.join(' ')}`;
  execSync(zipCommand, { stdio: 'inherit' });

  console.log('\n✅ Package created successfully!');
  console.log(`\n📦 Package location: ${path.relative(rootDir, outputFile)}`);
  console.log('\n📋 Next steps:');
  console.log('   1. Update environment variables in .env');
  console.log('   2. Configure OAuth in ServiceNow');
  console.log('   3. Upload package to Teams admin center');
  console.log('   4. Configure OAuth in M365 Plugin Vault');
  console.log('\n   See docs/SETUP.md for detailed instructions.');

} catch (error) {
  console.error('\n❌ Error creating package:', error.message);
  process.exit(1);
}
