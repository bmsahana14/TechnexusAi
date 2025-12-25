# Test the quiz generation API endpoint
$pdfPath = "uploads/Environment_3_Pages_Notes.pdf"
$uri = "http://localhost:8000/generate-quiz?num_questions=3&difficulty=Easy"

Write-Host "Testing Quiz Generation API Endpoint" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PDF File: $pdfPath"
Write-Host "Endpoint: $uri"
Write-Host ""

# Create multipart form data
$fileBin = [System.IO.File]::ReadAllBytes((Resolve-Path $pdfPath))
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"Environment_3_Pages_Notes.pdf`"",
    "Content-Type: application/pdf$LF",
    [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBin),
    "--$boundary--$LF"
) -join $LF

try {
    Write-Host "Sending request..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $uri -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    
    Write-Host ""
    Write-Host "SUCCESS! Response received:" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Message: $($response.message)"
    Write-Host "Filename: $($response.filename)"
    Write-Host "Questions Generated: $($response.quiz_data.Count)"
    Write-Host ""
    Write-Host "QUESTIONS:" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    
    for ($i = 0; $i -lt $response.quiz_data.Count; $i++) {
        $q = $response.quiz_data[$i]
        Write-Host ""
        Write-Host "Q$($i+1): $($q.q)" -ForegroundColor White
        for ($j = 0; $j -lt $q.options.Count; $j++) {
            $marker = if ($j -eq $q.correct) { "[CORRECT]" } else { "         " }
            $letter = [char](65 + $j)
            Write-Host "  $marker $letter) $($q.options[$j])"
        }
    }
    
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "ANALYSIS:" -ForegroundColor Yellow
    
    # Check if questions are from PDF
    $allText = ($response.quiz_data | ForEach-Object { $_.q }) -join " "
    
    if ($allText -match "microservices|socket\.io|architectural|realtime communication") {
        Write-Host "WARNING: Questions appear to be FALLBACK/GENERIC!" -ForegroundColor Red
        Write-Host "These are NOT from your PDF content." -ForegroundColor Red
    }
    elseif ($allText -match "environment|abiotic|biotic|natural|sunlight|air|water") {
        Write-Host "SUCCESS: Questions are from the PDF!" -ForegroundColor Green
        Write-Host "Questions correctly reference Environment topics." -ForegroundColor Green
    }
    else {
        Write-Host "UNCLEAR: Manual review needed" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to generate quiz" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
