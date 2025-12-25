#!/usr/bin/env node

/**
 * TechNexus AI Quiz Arena - Environment Setup Checker
 * This script verifies that all required environment variables are configured
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 TechNexus AI Quiz Arena - Environment Setup Checker\n');
console.log('='.repeat(60));

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
    console.log('\n❌ ERROR: .env.local file not found!\n');
    console.log('📝 To fix this:');
    console.log('   1. Create a file named .env.local in the client folder');
    console.log('   2. Add your Supabase credentials');
    console.log('   3. See SUPABASE_SETUP.md for detailed instructions\n');
    console.log('Example .env.local content:');
    console.log('─'.repeat(60));
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
    console.log('NEXT_PUBLIC_SOCKET_URL=http://localhost:4000');
    console.log('─'.repeat(60));
    process.exit(1);
}

console.log('\n✅ .env.local file found!\n');

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
        }
    }
});

// Check required variables
const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SOCKET_URL'
];

let allConfigured = true;

console.log('Checking required environment variables:\n');

requiredVars.forEach(varName => {
    const value = envVars[varName];
    const isConfigured = value && value !== 'your_supabase_url' && value !== 'your_supabase_key' && value !== 'your-project-id';

    if (isConfigured) {
        console.log(`✅ ${varName}`);

        // Additional validation
        if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
            if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
                console.log(`   ⚠️  Warning: URL format looks incorrect`);
                console.log(`   Expected: https://xxxxx.supabase.co`);
                console.log(`   Got: ${value}`);
                allConfigured = false;
            } else {
                console.log(`   📍 ${value}`);
            }
        } else if (varName === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
            if (value.length < 100) {
                console.log(`   ⚠️  Warning: Key seems too short`);
                allConfigured = false;
            } else {
                console.log(`   🔑 ${value.substring(0, 20)}...${value.substring(value.length - 10)}`);
            }
        } else if (varName === 'NEXT_PUBLIC_SOCKET_URL') {
            console.log(`   🔌 ${value}`);
        }
    } else {
        console.log(`❌ ${varName} - NOT CONFIGURED`);
        allConfigured = false;
    }
    console.log('');
});

console.log('='.repeat(60));

if (allConfigured) {
    console.log('\n✅ All environment variables are configured!\n');
    console.log('Next steps:');
    console.log('   1. Make sure you have created an admin user in Supabase');
    console.log('   2. Restart your development server (npm run dev)');
    console.log('   3. Try logging in at http://localhost:3000/login\n');
    console.log('📚 For detailed setup instructions, see SUPABASE_SETUP.md\n');
} else {
    console.log('\n❌ Some environment variables are missing or incorrect!\n');
    console.log('📝 To fix this:');
    console.log('   1. Open client/.env.local in a text editor');
    console.log('   2. Add/update the missing variables');
    console.log('   3. Get your credentials from Supabase Dashboard → Settings → API');
    console.log('   4. Run this script again to verify\n');
    console.log('📚 See SUPABASE_SETUP.md for detailed instructions\n');
    process.exit(1);
}
