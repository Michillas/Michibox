# Load environment variables from .env.local
$envFile = ".env.local"
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    $content -split "`n" | ForEach-Object {
        $line = $_.Trim()
        if ($line -match '^([^#=]+)=(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            # Remove any carriage returns or newlines from the value
            $value = $value -replace "`r", "" -replace "`n", ""
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "Loaded: $name" -ForegroundColor Gray
        }
    }
    Write-Host ""
}
else {
    Write-Host "Warning: .env.local not found" -ForegroundColor Yellow
}

# Run the setup script
node scripts/setup-db.js
