#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Checks if all necessary files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

const checks = {
    passed: [],
    failed: [],
    warnings: []
};

function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        checks.passed.push(`✓ ${description}`);
        return true;
    } else {
        checks.failed.push(`✗ ${description} - File not found: ${filePath}`);
        return false;
    }
}

function checkEnvExample(filePath, requiredVars) {
    if (!fs.existsSync(filePath)) {
        checks.failed.push(`✗ Missing ${filePath}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const missingVars = requiredVars.filter(v => !content.includes(v));

    if (missingVars.length === 0) {
        checks.passed.push(`✓ ${path.basename(filePath)} has all required variables`);
    } else {
        checks.warnings.push(`⚠ ${path.basename(filePath)} missing: ${missingVars.join(', ')}`);
    }
}

console.log('\n🔍 TechNexus Deployment Readiness Check\n');
console.log('='.repeat(50));

// Check essential files
console.log('\n📁 Checking essential files...\n');
checkFile('package.json', 'Frontend package.json');
checkFile('ai-service/requirements.txt', 'AI Service requirements.txt');
checkFile('ai-service/main.py', 'AI Service main.py');
checkFile('realtime-service/package.json', 'Realtime Service package.json');
checkFile('realtime-service/server.js', 'Realtime Service server.js');
checkFile('render.yaml', 'Render Blueprint configuration');

// Check environment examples
console.log('\n🔐 Checking environment configuration...\n');
checkEnvExample('.env.local.example', [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SOCKET_URL',
    'NEXT_PUBLIC_AI_SERVICE_URL'
]);

checkEnvExample('ai-service/.env.example', [
    'GEMINI_API_KEY',
    'PORT'
]);

checkEnvExample('realtime-service/.env.example', [
    'PORT'
]);

// Check .gitignore
console.log('\n🚫 Checking .gitignore...\n');
if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    const essentialIgnores = ['.env', 'node_modules', '__pycache__'];
    const missingIgnores = essentialIgnores.filter(i => !gitignore.includes(i));

    if (missingIgnores.length === 0) {
        checks.passed.push('✓ .gitignore has essential entries');
    } else {
        checks.warnings.push(`⚠ .gitignore missing: ${missingIgnores.join(', ')}`);
    }
} else {
    checks.failed.push('✗ .gitignore not found');
}

// Check if .env files are not committed
console.log('\n🔒 Checking for sensitive files...\n');
const sensitiveFiles = ['.env', '.env.local', 'ai-service/.env', 'realtime-service/.env'];
let foundSensitive = false;

sensitiveFiles.forEach(file => {
    if (fs.existsSync(file)) {
        checks.warnings.push(`⚠ Found ${file} - Ensure it's in .gitignore`);
        foundSensitive = true;
    }
});

if (!foundSensitive) {
    checks.passed.push('✓ No sensitive .env files found in repo');
}

// Check package.json scripts
console.log('\n📦 Checking build scripts...\n');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.scripts && pkg.scripts.build && pkg.scripts.start) {
        checks.passed.push('✓ Frontend has build and start scripts');
    } else {
        checks.failed.push('✗ Frontend missing build or start scripts');
    }
} catch (e) {
    checks.failed.push('✗ Error reading package.json');
}

try {
    const pkg = JSON.parse(fs.readFileSync('realtime-service/package.json', 'utf8'));
    if (pkg.scripts && pkg.scripts.start) {
        checks.passed.push('✓ Realtime service has start script');
    } else {
        checks.failed.push('✗ Realtime service missing start script');
    }
} catch (e) {
    checks.failed.push('✗ Error reading realtime-service/package.json');
}

// Print results
console.log('\n' + '='.repeat(50));
console.log('\n📊 Results:\n');

if (checks.passed.length > 0) {
    console.log('✅ Passed Checks:');
    checks.passed.forEach(c => console.log(`   ${c}`));
    console.log('');
}

if (checks.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    checks.warnings.forEach(c => console.log(`   ${c}`));
    console.log('');
}

if (checks.failed.length > 0) {
    console.log('❌ Failed Checks:');
    checks.failed.forEach(c => console.log(`   ${c}`));
    console.log('');
}

console.log('='.repeat(50));

// Final verdict
if (checks.failed.length === 0) {
    console.log('\n✅ All critical checks passed! Ready for deployment.\n');
    console.log('Next steps:');
    console.log('1. Commit and push your code to GitHub');
    console.log('2. Follow DEPLOYMENT_CHECKLIST.md for deployment steps');
    console.log('3. Use render.yaml for Blueprint deployment\n');
    process.exit(0);
} else {
    console.log('\n❌ Some critical checks failed. Please fix the issues above.\n');
    process.exit(1);
}
