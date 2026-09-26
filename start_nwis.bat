@echo off
echo ============================================================================
echo   eRTMAC-NWIS: Nearby Wells Intelligence System — Oil India Limited (SIH26121)
echo   Starting Local 3D Subsurface & Decision Support Console on port 5173...
echo ============================================================================
cd /d "%~dp0frontend"
npm run dev
