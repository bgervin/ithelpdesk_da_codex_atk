#!/usr/bin/env node

/**
 * Validation script for Adaptive Card templates
 */

const fs = require('fs');
const path = require('path');

const cardsDir = path.join(__dirname, '..', 'adaptiveCards');

console.log('🔍 Validating Adaptive Card templates...\n');

// Check if directory exists
if (!fs.existsSync(cardsDir)) {
  console.error('❌ Adaptive Cards directory not found:', cardsDir);
  process.exit(1);
}

// Get all JSON files in the directory
const cardFiles = fs.readdirSync(cardsDir).filter(file => file.endsWith('.json'));

if (cardFiles.length === 0) {
  console.error('❌ No Adaptive Card templates found in:', cardsDir);
  process.exit(1);
}

console.log(`Found ${cardFiles.length} card template(s):\n`);

let allValid = true;

cardFiles.forEach(file => {
  const filePath = path.join(cardsDir, file);
  console.log(`📄 Validating ${file}...`);
  
  let card;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    card = JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`  ❌ JSON parse error in ${file}:`, error.message);
    } else {
      console.error(`  ❌ Error reading ${file}:`, error.message);
    }
    allValid = false;
    console.log();
    return;
  }
  
  try {
    
    // Basic validation checks
    const checks = [
      {
        name: 'Has $schema',
        test: () => card.$schema && card.$schema.includes('adaptivecards.io'),
        message: 'Should have $schema property pointing to adaptivecards.io'
      },
      {
        name: 'Has type: AdaptiveCard',
        test: () => card.type === 'AdaptiveCard',
        message: 'Should have type: AdaptiveCard'
      },
      {
        name: 'Has version',
        test: () => card.version && typeof card.version === 'string',
        message: 'Should have version property'
      },
      {
        name: 'Has body',
        test: () => Array.isArray(card.body) && card.body.length > 0,
        message: 'Should have body array with at least one element'
      },
      {
        name: 'Version is 1.5 or lower',
        test: () => {
          const version = parseFloat(card.version);
          return version <= 1.5;
        },
        message: 'Version should be 1.5 or lower for compatibility'
      }
    ];
    
    let cardValid = true;
    checks.forEach(check => {
      const passed = check.test();
      if (passed) {
        console.log(`  ✓ ${check.name}`);
      } else {
        console.error(`  ✗ ${check.name}: ${check.message}`);
        cardValid = false;
        allValid = false;
      }
    });
    
    if (cardValid) {
      console.log(`  ✅ ${file} is valid\n`);
    } else {
      console.log(`  ❌ ${file} has issues\n`);
    }
    
  } catch (error) {
    console.error(`  ❌ Unexpected error validating ${file}:`, error.message);
    allValid = false;
    console.log();
  }
});

if (allValid) {
  console.log('✅ All Adaptive Card templates are valid!');
  console.log('\n📝 Note: This is a basic validation. For full validation, use:');
  console.log('   https://adaptivecards.io/designer/');
  process.exit(0);
} else {
  console.error('❌ Some Adaptive Card templates have issues!');
  process.exit(1);
}
