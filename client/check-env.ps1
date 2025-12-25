# TechNexus AI Quiz Arena - Quick Setup Guide
# Run this script to check your Supabase configuration

Write-Host "`n🔍 TechNexus AI Quiz Arena - Environment Setup Checker`n" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

$envPath = Join-Path $PSScriptRoot ".env.local"

if (-not (Test-Path $envPath)) {
    Write-Host "`n❌ ERROR: .env.local file not found!`n" -ForegroundColor Red
    Write-Host "📝 To fix this:" -ForegroundColor Yellow
    Write-Host "   1. Create a file named .env.local in the client folder"
    Write-Host "   2. Add your Supabase credentials"
    Write-Host "   3. See SUPABASE_SETUP.md for detailed instructions`n"
    Write-Host "Example .env.local content:" -ForegroundColor Cyan
    Write-Host ("-" * 60) -ForegroundColor Gray
    Write-Host "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
    Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here"
    Write-Host "NEXT_PUBLIC_SOCKET_URL=http://localhost:4000"
    Write-Host ("-" * 60) -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "`n✅ .env.local file found!`n" -ForegroundColor Green

# Read environment file
$envContent = Get-Content $envPath -Raw
$envVars = @{}

$envContent -split "`n" | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $envVars[$parts[0].Trim()] = $parts[1].Trim()
        }
    }
}

# Check required variables
$requiredVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SOCKET_URL"
)

$allConfigured = $true

Write-Host "Checking required environment variables:`n" -ForegroundColor Cyan

foreach ($varName in $requiredVars) {
    $value = $envVars[$varName]
    $isConfigured = $value -and $value -ne "your_supabase_url" -and $value -ne "your_supabase_key"
    
    if ($isConfigured) {
        Write-Host "✅ $varName" -ForegroundColor Green
        
        if ($varName -eq "NEXT_PUBLIC_SUPABASE_URL") {
            if (-not $value.StartsWith("https://") -or -not $value.Contains(".supabase.co")) {
                Write-Host "   ⚠️  Warning: URL format looks incorrect" -ForegroundColor Yellow
                Write-Host "   Expected: https://xxxxx.supabase.co"
                Write-Host "   Got: $value"
                $allConfigured = $false
            } else {
                Write-Host "   📍 $value" -ForegroundColor Gray
            }
        } elseif ($varName -eq "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
            if ($value.Length -lt 100) {
                Write-Host "   ⚠️  Warning: Key seems too short" -ForegroundColor Yellow
                $allConfigured = $false
            } else {
                $preview = $value.Substring(0, 20) + "..." + $value.Substring($value.Length - 10)
                Write-Host "   🔑 $preview" -ForegroundColor Gray
            }
        } else {
            Write-Host "   🔌 $value" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ $varName - NOT CONFIGURED" -ForegroundColor Red
        $allConfigured = $false
    }
    Write-Host ""
}

Write-Host ("=" * 60) -ForegroundColor Gray

if ($allConfigured) {
    Write-Host "`n✅ All environment variables are configured!`n" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Make sure you have created an admin user in Supabase"
    Write-Host "   2. Restart your development server (npm run dev)"
    Write-Host "   3. Try logging in at http://localhost:3000/login`n"
    Write-Host "📚 For detailed setup instructions, see SUPABASE_SETUP.md`n" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Some environment variables are missing or incorrect!`n" -ForegroundColor Red
    Write-Host "📝 To fix this:" -ForegroundColor Yellow
    Write-Host "   1. Open client/.env.local in a text editor"
    Write-Host "   2. Add/update the missing variables"
    Write-Host "   3. Get your credentials from Supabase Dashboard → Settings → API"
    Write-Host "   4. Run this script again to verify`n"
    Write-Host "📚 See SUPABASE_SETUP.md for detailed instructions`n" -ForegroundColor Yellow
    exit 1
}
