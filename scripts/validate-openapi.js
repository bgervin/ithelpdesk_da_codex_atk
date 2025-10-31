#!/usr/bin/env node

/**
 * Validation script for ServiceNow OpenAPI specification
 */

const fs = require('fs');
const path = require('path');

const openapiFile = path.join(__dirname, '..', 'plugins', 'servicenow-openapi.yaml');

console.log('🔍 Validating ServiceNow OpenAPI specification...\n');

// Check if file exists
if (!fs.existsSync(openapiFile)) {
  console.error('❌ OpenAPI file not found:', openapiFile);
  process.exit(1);
}

let yaml;
try {
  yaml = fs.readFileSync(openapiFile, 'utf8');
} catch (error) {
  console.error('❌ Error reading OpenAPI file:', error.message);
  process.exit(1);
}

// Basic validation checks
const checks = [
  {
    name: 'Has openapi version',
    test: () => yaml.includes('openapi: 3.0'),
    message: 'OpenAPI version should be 3.0.x'
  },
  {
    name: 'Has info section',
    test: () => yaml.includes('info:') && yaml.includes('title:'),
    message: 'Should have info section with title'
  },
  {
    name: 'Has servers section',
    test: () => yaml.includes('servers:'),
    message: 'Should have servers section'
  },
  {
    name: 'Has paths section',
    test: () => yaml.includes('paths:'),
    message: 'Should have paths section'
  },
  {
    name: 'Has security section',
    test: () => yaml.includes('security:') && yaml.includes('oauth2'),
    message: 'Should have security section with oauth2'
  },
  {
    name: 'Has listMyTickets operation',
    test: () => yaml.includes('operationId: listMyTickets'),
    message: 'Should have listMyTickets operation'
  },
  {
    name: 'Has createTicket operation',
    test: () => yaml.includes('operationId: createTicket'),
    message: 'Should have createTicket operation'
  },
  {
    name: 'Has updateTicket operation',
    test: () => yaml.includes('operationId: updateTicket'),
    message: 'Should have updateTicket operation'
  },
  {
    name: 'Has closeTicket operation',
    test: () => yaml.includes('operationId: closeTicket'),
    message: 'Should have closeTicket operation'
  },
  {
    name: 'Has getTicket operation',
    test: () => yaml.includes('operationId: getTicket'),
    message: 'Should have getTicket operation'
  },
  {
    name: 'Has components section',
    test: () => yaml.includes('components:'),
    message: 'Should have components section'
  },
  {
    name: 'Has security schemes',
    test: () => yaml.includes('securitySchemes:'),
    message: 'Should have securitySchemes in components'
  },
  {
    name: 'Has OAuth configuration',
    test: () => yaml.includes('authorizationUrl:') && yaml.includes('tokenUrl:'),
    message: 'Should have OAuth authorizationUrl and tokenUrl'
  },
  {
    name: 'Has incident schema',
    test: () => yaml.includes('schemas:') && yaml.includes('Incident:'),
    message: 'Should have Incident schema in components'
  }
];

let allPassed = true;

checks.forEach(check => {
  const passed = check.test();
  if (passed) {
    console.log(`✓ ${check.name}`);
  } else {
    console.error(`✗ ${check.name}: ${check.message}`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\n✅ OpenAPI specification is valid!');
  console.log('\n📝 Note: This is a basic validation. For full validation, use:');
  console.log('   npx @redocly/cli lint plugins/servicenow-openapi.yaml');
  process.exit(0);
} else {
  console.error('\n❌ OpenAPI specification has issues!');
  process.exit(1);
}
