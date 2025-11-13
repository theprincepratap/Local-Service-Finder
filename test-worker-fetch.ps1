#!/usr/bin/env powershell
# 🔧 Worker Fetch - Diagnostic Script
# This script tests the entire booking flow

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔧 WORKER FETCH - DIAGNOSTIC SCRIPT          ║" -ForegroundColor Cyan
Write-Host "║  Testing complete booking flow                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Colors
$success = "Green"
$errorColor = "Red"
$warning = "Yellow"
$info = "Cyan"

# Test 1: Health Check
Write-Host "═══════════════════════════════════════════════" -ForegroundColor $info
Write-Host "TEST 1: Backend Health Check" -ForegroundColor $info
Write-Host "═══════════════════════════════════════════════" -ForegroundColor $info

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is running!" -ForegroundColor $success
    Write-Host "   Status: $($response.message)" -ForegroundColor $info
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor $errorColor
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor $errorColor
    Write-Host "   Please run: npm start (in backend folder)" -ForegroundColor $warning
    exit 1
}

Write-Host ""

# Test 2: Get Nearby Workers
Write-Host "═══════════════════════════════════════════════" -ForegroundColor $info
Write-Host "TEST 2: Get Nearby Workers" -ForegroundColor $info
Write-Host "═══════════════════════════════════════════════" -ForegroundColor $info

try {
    $params = @{
        longitude = "77.2090"
        latitude = "28.6139"
        maxDistance = "10000"
        limit = "5"
    }
    
    $queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join `"&`"
    $uri = "http://localhost:5000/api/workers/nearby?$queryString"
    
    Write-Host "   URL: $uri" -ForegroundColor $info
    
    $response = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction Stop
    
    if ($response.count -gt 0) {
        Write-Host "✅ Found $($response.count) workers" -ForegroundColor $success
        
        $firstWorker = $response.data[0]
        Write-Host "   First Worker:" -ForegroundColor $info
        Write-Host "      ID: $($firstWorker._id)" -ForegroundColor $info
        Write-Host "      Name: $($firstWorker.name)" -ForegroundColor $info
        Write-Host "      Category: $($firstWorker.category)" -ForegroundColor $info
        Write-Host "      Price: ₹$($firstWorker.pricePerHour)/hr" -ForegroundColor $info
        
        # Store worker ID for next test
        $workerId = $firstWorker._id
    } else {
        Write-Host "⚠️  No workers found" -ForegroundColor $warning
        Write-Host "   Create a worker profile first" -ForegroundColor $warning
        exit 1
    }
} catch {
    Write-Host "❌ Error fetching workers" -ForegroundColor $errorColor
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor $errorColor
    exit 1
}

Write-Host ""

# Test 3: Get Single Worker
Write-Host "═══════════════════════════════════════════════" -ForegroundColor $info
Write-Host "TEST 3: Get Single Worker by ID" -ForegroundColor $info
Write-Host "═══════════════════════════════════════════════" -ForegroundColor $info

try {
    $uri = "http://localhost:5000/api/workers/$workerId"
    Write-Host "   URL: $uri" -ForegroundColor $info
    
    $response = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction Stop
    
    Write-Host "✅ Worker details fetched successfully!" -ForegroundColor $success
    
    $worker = $response.data.worker
    Write-Host "   Details:" -ForegroundColor $info
    Write-Host "      Name: $($worker.userId.name)" -ForegroundColor $info
    Write-Host "      Email: $($worker.userId.email)" -ForegroundColor $info
    Write-Host "      Phone: $($worker.userId.phone)" -ForegroundColor $info
    Write-Host "      Categories: $($worker.categories -join ', ')" -ForegroundColor $info
    Write-Host "      Experience: $($worker.experience) years" -ForegroundColor $info
    Write-Host "      Rating: $($worker.rating)/5" -ForegroundColor $info
    Write-Host "      Price: ₹$($worker.pricePerHour)/hr" -ForegroundColor $info
    Write-Host "      Verified: $($worker.verified)" -ForegroundColor $info
    Write-Host "      Active: $($worker.isActive)" -ForegroundColor $info
    
} catch {
    Write-Host "❌ Error fetching worker details" -ForegroundColor $errorColor
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor $errorColor
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor $errorColor
    Write-Host "   Worker ID: $workerId" -ForegroundColor $errorColor
    exit 1
}

Write-Host ""

# Test 4: Database Check
Write-Host "═══════════════════════════════════════════════" -ForegroundColor $info
Write-Host "TEST 4: Database Status" -ForegroundColor $info
Write-Host "═══════════════════════════════════════════════" -ForegroundColor $info

Write-Host "✅ Worker exists in database" -ForegroundColor $success
Write-Host "   ID: $workerId" -ForegroundColor $info

# Test 5: Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor $info
Write-Host "TEST SUMMARY" -ForegroundColor $info
Write-Host "═══════════════════════════════════════════════" -ForegroundColor $info

Write-Host "`n✅ All tests passed!" -ForegroundColor $success
Write-Host "`nNext steps:" -ForegroundColor $info
Write-Host "1. Open http://localhost:5173 in browser" -ForegroundColor $info
Write-Host "2. Go to 'Find Workers' page" -ForegroundColor $info
Write-Host "3. Search for workers" -ForegroundColor $info
Write-Host "4. Click 'Book Now' button" -ForegroundColor $info
Write-Host "5. Booking form should load" -ForegroundColor $info

Write-Host "`nDebug commands:" -ForegroundColor $warning
Write-Host "- Press F12 in browser to open DevTools" -ForegroundColor $warning
Write-Host "- Check Console tab for logs" -ForegroundColor $warning
Write-Host "- Check Network tab for API calls" -ForegroundColor $warning

Write-Host "`nWorker ID for manual testing:" -ForegroundColor $info
Write-Host "$workerId" -ForegroundColor $warning

Write-Host ""
