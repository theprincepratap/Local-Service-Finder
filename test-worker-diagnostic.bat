@echo off
REM Worker Fetch - Diagnostic Script

echo.
echo ================================================== 
echo TEST 1: Backend Health Check
echo ==================================================
curl http://localhost:5000/api/health

echo.
echo ==================================================
echo TEST 2: Get Nearby Workers
echo ==================================================
curl "http://localhost:5000/api/workers/nearby?longitude=77.2090&latitude=28.6139&maxDistance=10000&limit=5"

echo.
echo ==================================================
echo All tests completed. Check output above.
echo ==================================================
echo.
pause
