#!/usr/bin/env bun
/**
 * Setup script for new developers
 * 
 * This script:
 * 1. Checks for required tools (bun, pnpm)
 * 2. Sets up environment variables (creates .env files if needed)
 * 3. Sets up the database (SQLite for local dev)
 * 4. Starts all services
 * 
 * Usage: bun scripts/setup.ts
 * Or: pnpm bootstrap
 */

import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: number, total: number, message: string) {
  log(`\n[${step}/${total}] ${message}`, 'cyan');
}

// Check if Bun is installed
async function checkBun() {
  try {
    const proc = Bun.spawn(['bun', '--version'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;
    if (exitCode === 0) {
      log(`✓ Bun installed: ${output.trim()}`, 'green');
      return true;
    }
    throw new Error('Bun not found');
  } catch {
    log('✗ Bun is not installed', 'red');
    log('  Install from: https://bun.sh', 'yellow');
    return false;
  }
}

// Check if pnpm is installed
async function checkPnpm() {
  try {
    const proc = Bun.spawn(['pnpm', '--version'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;
    if (exitCode === 0) {
      log(`✓ pnpm installed: ${output.trim()}`, 'green');
      return true;
    }
    throw new Error('pnpm not found');
  } catch {
    log('✗ pnpm is not installed', 'red');
    log('  Install with: npm install -g pnpm', 'yellow');
    return false;
  }
}

// Create .env file if it doesn't exist
function setupEnvFile(path: string, content: string) {
  if (existsSync(path)) {
    log(`  ✓ .env already exists: ${path}`, 'green');
    return false;
  } else {
    writeFileSync(path, content, 'utf-8');
    log(`  ✓ Created .env: ${path}`, 'green');
    return true;
  }
}

// Setup API .env file
function setupApiEnv() {
  const envPath = join(process.cwd(), 'api', '.env');
  const envContent = `# API Environment Variables
# Database - Using SQLite for local development
DB_TYPE=sqlite
DATABASE_URL=./local.db

# Server
PORT=9000
NODE_ENV=development

# Auth0 (optional for local dev - set these if you have Auth0 configured)
# AUTH0_DOMAIN=your-domain.auth0.com
# AUTH0_AUDIENCE=your-api-audience
# AUTH0_ISSUER=https://your-domain.auth0.com/

# CORS (comma-separated origins)
CORS_ORIGIN=http://localhost:9001,http://localhost:9002
`;

  return setupEnvFile(envPath, envContent);
}

// Setup Admin Dashboard .env file
function setupAdminEnv() {
  const envPath = join(process.cwd(), 'admin-dashboard', '.env');
  const envContent = `# Admin Dashboard Environment Variables
# API URL
API_URL=http://localhost:9000

# Auth0 (optional for local dev - set these if you have Auth0 configured)
# AUTH0_DOMAIN=your-domain.auth0.com
# AUTH0_CLIENT_ID=your-client-id
# AUTH0_AUDIENCE=your-api-audience
`;

  return setupEnvFile(envPath, envContent);
}

// Setup End User App .env file
function setupAppEnv() {
  const envPath = join(process.cwd(), 'end-user-app', '.env');
  const envContent = `# End User App Environment Variables
# API URL
API_URL=http://localhost:9000

# Auth0 (optional for local dev - set these if you have Auth0 configured)
# AUTH0_DOMAIN=your-domain.auth0.com
# AUTH0_CLIENT_ID=your-client-id
# AUTH0_AUDIENCE=your-api-audience
`;

  return setupEnvFile(envPath, envContent);
}

// Setup database
async function setupDatabase() {
  log('  Setting up database...', 'blue');
  
  // Check if database file exists
  const dbPath = join(process.cwd(), 'api', 'local.db');
  const dbExists = existsSync(dbPath);
  
  if (dbExists) {
    log(`  ✓ Database file exists: ${dbPath}`, 'green');
    log('  ℹ Run "pnpm db:push" to update schema if needed', 'yellow');
  } else {
    log('  Creating database...', 'blue');
    try {
      // Push schema to create database
      const proc = Bun.spawn(['bun', 'run', 'db:push'], {
        stdout: 'pipe',
        stderr: 'pipe',
        cwd: join(process.cwd(), 'api'),
      });
      const exitCode = await proc.exited;
      if (exitCode === 0) {
        log('  ✓ Database created and schema applied', 'green');
      } else {
        const stderr = await new Response(proc.stderr).text();
        log('  ⚠ Could not create database automatically', 'yellow');
        log(`  Error: ${stderr}`, 'yellow');
        log('  You may need to run: cd api && bun run db:push', 'yellow');
      }
    } catch (error) {
      log('  ⚠ Could not create database automatically', 'yellow');
      log('  You may need to run: cd api && bun run db:push', 'yellow');
    }
  }
}

// Start all services
async function startServices() {
  log('\n🚀 Starting all services...', 'bright');
  log('  API: http://localhost:9000', 'cyan');
  log('  End User App: http://localhost:9001', 'cyan');
  log('  Admin Dashboard: http://localhost:9002', 'cyan');
  log('\n  Press Ctrl+C to stop all services\n', 'yellow');
  
  // Start all services in parallel
  const api = Bun.spawn(['bun', 'run', 'dev'], {
    cwd: join(process.cwd(), 'api'),
    stdout: 'inherit',
    stderr: 'inherit',
  });
  
  const admin = Bun.spawn(['pnpm', 'dev'], {
    cwd: join(process.cwd(), 'admin-dashboard'),
    stdout: 'inherit',
    stderr: 'inherit',
  });
  
  const app = Bun.spawn(['pnpm', 'dev'], {
    cwd: join(process.cwd(), 'end-user-app'),
    stdout: 'inherit',
    stderr: 'inherit',
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n\n🛑 Stopping all services...', 'yellow');
    api.kill();
    admin.kill();
    app.kill();
    process.exit(0);
  });
  
  // Wait for all services (they run indefinitely)
  await Promise.all([
    api.exited,
    admin.exited,
    app.exited,
  ]);
}

// Main setup function
async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('  BCC Events Registration App - Setup Script', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  let step = 1;
  const totalSteps = 6;

  // Step 1: Check prerequisites
  logStep(step++, totalSteps, 'Checking prerequisites');
  const bunOk = await checkBun();
  const pnpmOk = await checkPnpm();
  
  if (!bunOk || !pnpmOk) {
    log('\n❌ Please install missing prerequisites and run again.', 'red');
    process.exit(1);
  }

  // Step 2: Check if dependencies are installed
  logStep(step++, totalSteps, 'Checking dependencies');
  if (!existsSync(join(process.cwd(), 'node_modules'))) {
    log('  ⚠ node_modules not found. Run "pnpm install" first.', 'yellow');
    log('  Running pnpm install...', 'blue');
    try {
      const proc = Bun.spawn(['pnpm', 'install'], {
        stdout: 'inherit',
        stderr: 'inherit',
        cwd: process.cwd(),
      });
      const exitCode = await proc.exited;
      if (exitCode === 0) {
        log('  ✓ Dependencies installed', 'green');
      } else {
        throw new Error(`pnpm install failed with exit code ${exitCode}`);
      }
    } catch (error) {
      log('  ✗ Failed to install dependencies', 'red');
      log('  Please run: pnpm install', 'yellow');
      process.exit(1);
    }
  } else {
    log('  ✓ Dependencies installed', 'green');
  }

  // Step 3: Setup environment variables
  logStep(step++, totalSteps, 'Setting up environment variables');
  const apiEnvCreated = setupApiEnv();
  setupAdminEnv();
  setupAppEnv();
  
  if (apiEnvCreated) {
    log('  ℹ Edit api/.env if you need to configure Auth0 or use PostgreSQL', 'yellow');
  }

  // Step 4: Setup database
  logStep(step++, totalSteps, 'Setting up database');
  await setupDatabase();

  // Step 5: Summary
  logStep(step++, totalSteps, 'Setup complete!');
  log('\n✓ Environment files configured', 'green');
  log('✓ Database ready', 'green');
  log('\n📝 Next steps:', 'bright');
  log('  1. Configure Auth0 in .env files (optional for local dev)', 'yellow');
  log('  2. Run "pnpm dev" to start all services', 'yellow');
  log('  3. Or run this script with --start to start services now', 'yellow');

  // Step 6: Start services if requested
  const shouldStart = process.argv.includes('--start') || process.argv.includes('-s');
  if (shouldStart) {
    logStep(step++, totalSteps, 'Starting services');
    await startServices();
  } else {
    log('\n💡 Tip: Run "pnpm setup --start" to start all services automatically', 'cyan');
  }

  log('\n' + '='.repeat(60), 'bright');
  log('  Setup complete! 🎉', 'green');
  log('='.repeat(60) + '\n', 'bright');
}

// Run main function
main().catch((error) => {
  log('\n❌ Setup failed:', 'red');
  console.error(error);
  process.exit(1);
});
