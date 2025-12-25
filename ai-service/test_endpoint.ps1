# Test the AI service endpoint with the actual PDF file
$pdfPath = "uploads\Environment_3_Pages_Notes.pdf"

Write-Host "Testing AI Service Endpoint" -ForegroundColor Cyan
Write-Host "=" * 60

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"Environment_3_Pages_Notes.pdf`"",
    "Content-Type: application/pdf$LF",
    [System.IO.File]::ReadAllBytes($pdfPath),
    "--$boundary",
    "Content-Disposition: form-data; name=`"num_questions`"$LF",
    "3",
    "--$boundary",
    "Content-Disposition: form-data; name=`"difficulty`"$LF",
    "Medium",
    "--$boundary--$LF"
) -join $LF

try {
    Write-Host "Sending request to http://localhost:8000/generate-quiz..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/generate-quiz" `
        -Method Post `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bodyLines `
        -TimeoutSec 60
    
    Write-Host "`nSUCCESS!" -ForegroundColor Green
    Write-Host "=" * 60
    
    Write-Host "`nResponse:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    Write-Host "`n`nGenerated Questions:" -ForegroundColor Cyan
    Write-Host "=" * 60
    
    $questions = $response.quiz_data
    for ($i = 0; $i -lt $questions.Count; $i++) {
        $q = $questions[$i]
        Write-Host "`nQ$($i+1): $($q.q)" -ForegroundColor White
        Write-Host "    Options:" -ForegroundColor Gray
        for ($j = 0; $j -lt $q.options.Count; $j++) {
            $marker = if ($j -eq $q.correct) { " <-- CORRECT" } else { "" }
            Write-Host "      $j. $($q.options[$j])$marker" -ForegroundColor $(if ($j -eq $q.correct) { "Green" } else { "Gray" })
        }
    }
    
    # Check if fallback
    $firstQ = $questions[0].q.ToLower()
    Write-Host "`n" -NoNewline
    Write-Host "=" * 60
    if ($firstQ -match "microservices|socket\.io|architectural style") {
        Write-Host "WARNING: These are FALLBACK questions!" -ForegroundColor Red
        Write-Host "They are NOT based on your PDF content." -ForegroundColor Red
    } else {
        Write-Host "SUCCESS: Questions appear to be PDF-specific!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "`nERROR!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.Exception -ForegroundColor DarkRed
}
